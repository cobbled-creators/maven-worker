import { randomBytes } from 'node:crypto';

export const hashValuesToString = async (...args: string[]) => {
	const encoder = new TextEncoder();
	const random = randomBytes(64);
	const bytes = encoder.encode([random, ...args].join(''));
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	const hashArray = Array.from(new Uint8Array(digest));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
