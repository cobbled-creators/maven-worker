import { factory } from '../../../factory';
import { CommandContext, makeStringOption, makeSubCommand } from 'discord-hono';
import { MessageFlags, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { randomBytes } from 'node:crypto';

type CommandReq = CommandContext<{ Bindings: Env } & {
	Variables?: {} | undefined
}, RESTPostAPIChatInputApplicationCommandsJSONBody>;

const options = [
	makeStringOption(
		'username',
		'Set the token username'
	)
];

export const SubCommandMavenTokenCreate = factory.subCommand(
	makeSubCommand('create', 'Create Token').options(options),
	async c => {
		const userId = c.interaction.member?.user.id;
		const timestamp = Date.now();
		const random = randomBytes(64);

		const db = c.env.DB;
		const encoder = new TextEncoder();
		const bytes = encoder.encode(userId!! + timestamp!! + random + c.env.PEPPER);
		const digest = await crypto.subtle.digest('SHA-256', bytes);
		const hashArray = Array.from(new Uint8Array(digest));
		const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		console.debug({
			userId: userId,
			timestamp: timestamp,
			userName: c.var.username,
			hash: hash
		})
		const stmt = db
			.prepare('INSERT INTO credentials(username, discord_id, password_hash) VALUES (?, ?, ?)')
			.bind(c.var.username, userId, hash);

		await stmt.run();

		const message = `Success!\n` +
			`**User:** \`${c.var.username}\`\n` +
			`**Token:** \`${hash}\`\n\n` +
			`**DONT SHARE IT WITH ANYONE!**`;

		return c.res({
			content: message,
			flags: MessageFlags.Ephemeral,

		});
	}
);
