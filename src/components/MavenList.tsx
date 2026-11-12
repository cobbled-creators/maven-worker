import { FC } from 'hono/jsx';

interface MavenListProps {
	repositories: string[];
}

export const MavenList: FC<MavenListProps> = ({ repositories }: MavenListProps) => {
	return (
		<ul id="file-list">
			{repositories.map((repo) => (
				<li>
					<a href={`/web/${repo}/`}>
						<i class="icon icon-s icon-globe"></i>
						<span>{repo}/</span>
					</a>
				</li>
			))}
		</ul>
	);
};
