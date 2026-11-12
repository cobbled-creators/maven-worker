import { describe, expect, it } from 'vitest';
import { api } from '../src/web/api';

describe('Maven downloads', () => {
	const body = 'SDL3 native library';
	const object = {
		body,
		httpEtag: '"etag"',
		size: body.length,
		writeHttpMetadata() {},
	};
	const bindings = {
		ALLOW_OVERWRITES: 'false',
		REPOSITORIES: 'releases',
		VALIDATE_PATHS: 'true',
		releases: {
			get: async () => object,
			head: async () => object,
		},
	} as unknown as Env;
	const url = 'https://example.com/releases/dev/isxander/sdl/3.2.0/sdl-3.2.0-linux-x86_64.so';

	it.each(['GET', 'HEAD'])('includes the download filename in %s responses', async (method) => {
		const response = await api.request(url, { method }, bindings);

		expect(response.headers.get('Content-Disposition')).toBe(
			'attachment; filename="sdl-3.2.0-linux-x86_64.so"',
		);
	});
});
