import { Context, Next } from 'hono';

export async function basicAuth(c: Context<{ Bindings: Env }>, next: Next) {
	// Only require auth for PUT requests in this simple maven server
	if (c.req.method !== 'PUT') {
		return await next();
	}

	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return c.text('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Maven Repository"',
			},
		});
	}

	const base64Credentials = authHeader.substring(6);
	const credentials = atob(base64Credentials);
	const [username, ...passwordParts] = credentials.split(':');
	const password = passwordParts.join(':');

	if (!username || !password) {
		return c.text('Unauthorized', 401);
	}

	// Verify against D1
	const db = c.env.DB;

	const stmt = db.prepare('SELECT password_hash FROM credentials WHERE username = ?').bind(username);
	const row = await stmt.first<{ password_hash: string }>();

	if (!row || row.password_hash !== password) {
		return c.text('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Maven Repository"',
			},
		});
	}

	await next();
}
