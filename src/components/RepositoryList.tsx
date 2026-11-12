import { FC } from 'hono/jsx';
import { RepositoryCoordinates } from './RepositoryCoordinates';
import { Breadcrumbs } from './Breadcrumbs';

interface RepositoryListProps {
	repo: string;
	path: string;
	folders: string[];
	files: R2Object[];
}

export const RepositoryList: FC<RepositoryListProps> = ({ repo, path, folders, files }: RepositoryListProps) => {
	const parts = path.split('/').filter(Boolean);
	const upPath = parts.slice(0, -1).join('/');
	const upHref = upPath ? `/web/${repo}/${upPath}/` : `/web/${repo}/`;

	return (
		<>
			<Breadcrumbs repo={repo} path={path} />
			<RepositoryCoordinates repo={repo} path={path} hasFiles={files.filter(val => val.key.endsWith(".jar")).length > 0} />
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
};
