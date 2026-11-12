import { FC } from 'hono/jsx';

interface RepositoryCoordinatesProps {
	repo: string,
	path: string,
	hasFiles: boolean
}

export const RepositoryCoordinates: FC<RepositoryCoordinatesProps> = ({ repo, path, hasFiles }: RepositoryCoordinatesProps) => {
	// template to insert repo
	const repoCoordinate = `repositories {
  maven("https://maven.cobbled-creators.org/${repo}/")
}`;
	// template to insert deps

	const pathBits = path.split('/').filter(Boolean);
	const version = pathBits.length > 2 ? pathBits.pop() : '';
	const coordinate = pathBits.length > 2 ? pathBits.pop() : '';
	const group = pathBits.join('.');
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
};
