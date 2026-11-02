import { Hono } from 'hono';
import { basicAuth } from './auth';
import { api } from './api';
import { ui } from './ui';
import { discord } from './discord/init';

const app = new Hono<{ Bindings: Env }>({ strict: false });

app.get('/', (c) => c.redirect('/web'));

// Enforce auth on API PUT requests
app.use('*', basicAuth);

// UI HTML fragments
app.route('/web', ui);

// Discord
app.get("/discord/bot/connect", async (c) => c.redirect('/web'));

app.mount("/discord/bot", discord);

// API routes (GET/PUT artifacts)
app.route('/', api);

export { MetadataDebouncer } from './debounce';

export default {
	fetch: app.fetch,
};
