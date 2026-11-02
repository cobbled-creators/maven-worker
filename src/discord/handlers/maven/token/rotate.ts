import { factory } from '../../../factory';
import { makeStringOption, makeSubCommand } from 'discord-hono';
import { MessageFlags } from 'discord-api-types/v10';
import { hashValuesToString } from './util';

const options = [
	makeStringOption(
		'username',
		'The username bound to token'
	)
];

export const SubCommandMavenTokenRotateUser = factory.subCommand(
	makeSubCommand('rotate', 'Rotate token by user').options(options),
	async (c) => {
		if (!c.interaction.member) return c.res({ content: `Guild member not found`, flags: MessageFlags.Ephemeral });

		const userName = (c.var.username as String).replaceAll(/[^\w\-_]/ig, '_');
		const userId = c.interaction.member.user.id;
		const timestamp = Date.now();
		const db = c.env.DB;
		const hash = await hashValuesToString(userName, timestamp.toString(), c.env.PEPPER)

		const stmt = db
			.prepare('UPDATE credentials SET password_hash = ? WHERE discord_id = ? AND username = ?')
			.bind(hash, userId, userName);

		await stmt.run();

		const message = `Success!\n` +
			`**User:** \`${userName}\`\n` +
			`**Token:** \`${hash}\`\n\n` +
			`**DONT SHARE IT WITH ANYONE!**`;

		return c.res({
			content: message,
			flags: MessageFlags.Ephemeral
		});
	}
);
