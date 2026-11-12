import type { PropsWithChildren } from 'hono/jsx';

interface LayoutProps {
	serverName: string;
	cfVersionMetadata: string;
}

export const Layout = ({ serverName, cfVersionMetadata, children }: PropsWithChildren<LayoutProps>) => {
	return (
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="keywords" content={`maven, repository, browser, ${serverName}`} />
			<meta name="og:title" content={serverName} />
			<meta name="og:description" content={`A maven repository browser for ${serverName}`} />
			<meta name="description" content={`A maven repository browser for ${serverName}`} />
			<title>{serverName}</title>
			<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet" />
			<link href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css" rel="stylesheet" />
			<link rel="stylesheet" href={`/app.css?v=${cfVersionMetadata}`} />
		</head>
		<body>
		<main>
			<header>
				<div class="container">
					<h1><a href="/web/index">{serverName}</a></h1>
					<a href="https://github.com/cobbled-creators/maven-worker" class="sources" target="_blank">
						<i class="icon icon-l icon-github"></i>
					</a>
				</div>
			</header>

			<main class="container-wide" style="min-height: 200px;">
				<div id="content">{children}</div>
			</main>
		</main>
		</body>
		</html>
	);
};


