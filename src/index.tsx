import { Hono } from 'hono';
import { basicAuth } from './middleware/auth';
import { api } from './web/api';
import { discord } from './discord/init';
import { web } from './web/app';
import { Variables } from './util/types';


const app = new Hono<{ Bindings: Env, Variables: Variables }>({ strict: false });

app.get('/', (c) => c.redirect('/web/index'));

// Enforce auth on API PUT requests
app.use('*', basicAuth);

// UI HTML fragments
app.route('/web', web);

// Discord
app.get("/discord/bot/connect", async (c) => c.redirect('/web/index'));

app.mount("/discord/bot", discord);

// API routes (GET/PUT artifacts)
app.route('/', api);

export { MetadataDebouncer } from './util/debounce';

export default {
	fetch: app.fetch,
};
