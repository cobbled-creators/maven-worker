import { Hono } from 'hono';
import { getBucket, getRepositories, MUTABLE_CACHE_CONTROL } from './utils';
import { html } from 'hono/html';
import type { Context } from 'hono';
import { env } from 'cloudflare:workers';

export const Layout = ({ children }: { children?: any }) => (
	<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="keywords" content={`maven, repository, browser, ${env.SERVER_NAME}`} />
		<meta name="og:title" content={env.SERVER_NAME} />
		<meta name="og:description" content={`A maven repository browser for ${env.SERVER_NAME}`} />
		<meta name="description" content={`A maven repository browser for ${env.SERVER_NAME}`} />
		<title>{env.SERVER_NAME}</title>
		<script
			src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.10/dist/htmx.min.js"
			integrity="sha384-H5SrcfygHmAuTDZphMHqBJLc3FhssKjG7w/CeCpFReSfwBWDTKpkzPP8c+cLsK+V"
			crossorigin="anonymous"
		></script>
		<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet" />
		<link href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css" rel="stylesheet" />
		<link rel="stylesheet" href={`/app.css?v=${env.CF_VERSION_METADATA.id}`} />
	</head>
	<body hx-boost="true" hx-target="#content" hx-swap="innerHTML show:window:top">
	<main>
		<header>
			<div class="container">
				<h1><a href="/web">{env.SERVER_NAME}</a></h1>
				<a href="https://github.com/gitoido-mc/xander-maven-worker" class="sources" target="_blank">
					<i class="nes-icon github is-medium"></i>
				</a>
			</div>
		</header>

		<main class="container-wide" style="min-height: 200px;">
			<div id="content">
				{children}
			</div>
		</main>
	</main>
	</body>
	</html>
);

function renderContent(c: Context<{ Bindings: Env }>, content: any) {
	if (c.req.header('hx-request') === 'true' || c.req.header('HX-Request') === 'true') {
		return c.html(content);
	}
	return c.html(html`<!DOCTYPE html>${(<Layout>{content}</Layout>)}`);
}

export const ui = new Hono<{ Bindings: Env }>({ strict: false });

// This endpoint returns HTML fragments for HTMX
ui.get('/', async (c) => {
	// List all repositories (R2 bindings)
	const bindings = getRepositories(c.env).sort();

	c.header('Cache-Control', MUTABLE_CACHE_CONTROL);

	return renderContent(
		c,
		<ul id="file-list">
			{bindings.map((repo) => (
				<li>
					<a href={`/web/${repo}/`}>
						<i class="icon icon-s icon-globe"></i>
						<span>{repo}/</span>
					</a>
				</li>
			))}
		</ul>
	);
});

ui.get('/:repo{[a-z]+}/*', async (c) => {
	const repo = c.req.param('repo');
	let path = c.req.path.substring(`/web/${repo}`.length);
	if (path.startsWith('/')) path = path.substring(1);
	if (path.length > 0 && !path.endsWith('/')) path += '/';

	c.header('Cache-Control', MUTABLE_CACHE_CONTROL);

	const bucket = getBucket(c.env, repo);
	if (!bucket) {
		return renderContent(c, <div class="error">Repository not found</div>);
	}

	let cursor: string | undefined;
	let truncated = false;
	const allPrefixes: string[] = [];
	const allObjects: R2Object[] = [];

	do {
		const listed = await bucket.list({
			prefix: path,
			delimiter: '/',
			cursor
		});

		allPrefixes.push(...listed.delimitedPrefixes);
		allObjects.push(...listed.objects);

		truncated = listed.truncated;
		cursor = listed.truncated ? listed.cursor : undefined;
	} while (truncated);

	const parts = path.split('/').filter(Boolean);

	const upPath = parts.slice(0, -1).join('/');
	const upHref = upPath ? `/web/${repo}/${upPath}/` : `/web/${repo}/`;

	const folders = allPrefixes.sort();
	const files = allObjects.sort((a, b) => a.key.localeCompare(b.key));

	return renderContent(
		c,
		<>
			<Breadcrumbs repo={repo} path={path} />
			<Coordinates repo={repo} path={path} hasFiles={files.filter(val => val.key.endsWith(".jar")).length > 0} />
			<ul id="file-list">
				{path.length > 0 && (
					<li>
						<a href={upHref}><i class="icon icon-s icon-up"></i><span>..</span></a>
					</li>
				)}

				{folders.map((folder) => {
					const folderName = folder.substring(path.length);
					return (
						<li>
							<span class="folder">
								<i class="icon icon-s icon-folder"></i>
								<a href={`/web/${repo}/${folder}`}>{folderName}</a>
							</span>
						</li>
					);
				})}

				{files.map((file) => {
					if (file.key === path) return null; // skip the folder itself if it's an object
					const fileName = file.key.substring(path.length);
					const size = (file.size / 1024).toFixed(2) + ' KB';
					const dateObj = new Date(file.uploaded);
					const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

					return (
						<li class="record">
							<span class="file">
								<i class="icon icon-s icon-file"></i>
								<a href={`/${repo}/${file.key}`} target="_blank">{fileName}</a>
							</span>
							<span class="meta">
								{size} &bull; {date}
							</span>
						</li>
					);
				})}
			</ul>
		</>
	);
});

const Coordinates = ({ repo, path, hasFiles }: { repo: string, path: string, hasFiles: boolean }) => {
	// template to insert repo
	const repoCoordinate = `repositories {
  maven("https://maven.cobbled-creators.org/${repo}/")
}`;
	// template to insert deps

	const pathBits = path.split('/').filter(Boolean);
	const version = pathBits.length > 3 ? pathBits.pop() : "";
	const coordinate = pathBits.length > 3 ? pathBits.pop() : "";
	const group = pathBits.join(".");
		const pathCoordinate = `repositories {
  maven("https://maven.cobbled-creators.org/${repo}/")
}

dependencies {
  modImplementation("${group}:${coordinate}:${version}")
}
`;

	return (
		<div class="nes-container with-title coordinates">
			<p class="title">Repository coordinates :: build.gradle.kts</p>
			<pre>{hasFiles ? pathCoordinate : repoCoordinate}</pre>
		</div>
	);
}

const Breadcrumbs = ({ repo, path }: { repo: string; path: string }) => {
	const parts = path.split('/').filter(Boolean);

	let currentPath = '';
	console.log(parts);
	const breadcrumbs = parts.map((part, index) => {
		currentPath += part + '/';
		const isLast = index === parts.length - 1;
		return (
			<li>
				{isLast ? (
					<span class="entry">
						<a href="#" aria-current="page">
							{part}
						</a>
					</span>
				) : (
					<span class="entry">
						<a href={`/web/${repo}/${currentPath}`}>{part}</a>
						<span class="separator">/</span>
					</span>
				)}
			</li>
		);
	});

	return (
		<nav aria-label="Breadcrumb">
			<ol class="breadcrumbs">
				<li>
					{parts.length === 0 ? (
						<>
							<a href="/web" aria-current="page">
								<i class="icon icon-s icon-home"></i>
							</a>
							<span class="separator">/</span>
						</>
					) : (
						<>
							<a href="/web">
								<i class="icon icon-s icon-home"></i>
							</a>
							<span class="separator">/</span>
						</>
					)}
				</li>
				<li>
					{parts.length === 0 ? (
						<><a href="#" aria-current="page">{repo}</a><span class="separator">/</span></>
					) : (
						<><a href={`/web/${repo}/`}>{repo}</a><span class="separator">/</span></>
					)}
				</li>
				{breadcrumbs}
			</ol>
		</nav>
	);
};
