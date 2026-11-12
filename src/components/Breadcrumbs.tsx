import { FC } from 'hono/jsx';

interface BreadcrumbsProps {
	repo: string;
	path: string;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ repo, path }: BreadcrumbsProps) => {
	const parts = path.split('/').filter(Boolean);

	let currentPath = '';
	const breadcrumbs = parts.map((part, index) => {
		currentPath += part + '/';
		const isLast = index === parts.length - 1;
		const isSecondToLast = index === parts.length - 2;
		const isLong = parts.length > 3;
		const formatted = () => {
			if (isLong && isSecondToLast) return part;
			if (isLong && !isSecondToLast) return part[0];
			return part;
		};
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
						<a href={`/web/${repo}/${currentPath}`} title={part}>{formatted()}</a>
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
							<a href="/web/index" aria-current="page">
								<i class="icon icon-s icon-home"></i>
							</a>
							<span class="separator">/</span>
						</>
					) : (
						<>
							<a href="/web/index">
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
