import { Context, Hono } from 'hono';
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';
import { Layout } from '../components/Layout';
import { getBucket, getRepositories, MUTABLE_CACHE_CONTROL } from '../util/helpers';
import { MavenList } from '../components/MavenList';
import { NotFound } from '../components/NotFound';
import { RepositoryList } from '../components/RepositoryList';

import { createMiddleware } from "hono/factory";

export const resolvePath = createMiddleware(async (c, next) => {
	if (c.req.path.includes("//")) {
		return c.redirect(c.req.path.replaceAll(/\/+/g, "/"));
	}
	await next();
});


export const web = new Hono<{ Bindings: Env }>({ strict: false });

web.use(resolvePath);

web.use(
	jsxRenderer(
		({ children }) => {
			const c: Context<{ Bindings: Env }> = useRequestContext();
			c.header('Cache-Control', MUTABLE_CACHE_CONTROL);
			return Layout({
				serverName: c.env.SERVER_NAME,
				cfVersionMetadata: c.env.CF_VERSION_METADATA.id,
				children: children
			});
		},
		{
			docType: '<!doctype html>'
		}
	)
);

web.get('/index', (c) => {
	return c.render(
		<MavenList repositories={getRepositories(c.env).sort()} />
	);
});

web.get('/:repo{[a-z]+}/*', async (c) => {
	const repo = c.req.param('repo');
	let path = c.req.path.substring(`/web/${repo}`.length);
	if (path.startsWith('/')) path = path.substring(1);
	if (path.length > 0 && !path.endsWith('/')) path += '/';

	console.log(path);
	const bucket = getBucket(c.env, repo);
	if (!bucket) {
		return c.render(<NotFound message={'Repository not found'} />);
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

	const folders = allPrefixes.sort();
	const files = allObjects.sort((a, b) => a.key.localeCompare(b.key));

	return c.render(
		<RepositoryList repo={repo} path={path} folders={folders} files={files} />
	);
});
