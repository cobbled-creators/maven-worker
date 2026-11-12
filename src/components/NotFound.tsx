import { FC } from 'hono/jsx';

interface NotFoundProps {
	message: string
}

export const NotFound: FC<NotFoundProps> = ({message}: NotFoundProps) => {
	return (<div class="error">{message}</div>);
}
