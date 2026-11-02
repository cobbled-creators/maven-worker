import { factory } from '../../../factory';
import { CommandContext, makeStringOption, makeSubCommand } from 'discord-hono';
import { MessageFlags, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { hashValuesToString } from './util';

const options = [
	makeStringOption(
		'username',
		'Set the token username'
	)
];

export const SubCommandMavenTokenCreate = factory.subCommand(
	makeSubCommand('create', 'Create token').options(options),
	async c => {
		if (!c.interaction.member) return c.res({ content: `Guild member not found`, flags: MessageFlags.Ephemeral });

		const userName = (c.var.username as String).replaceAll(/[^\w\-_]/ig, '_');
		const userId = c.interaction.member.user.id;
		const timestamp = Date.now();
		const db = c.env.DB;
		const hash = await hashValuesToString(userName, timestamp.toString(), c.env.PEPPER)

		const stmt = db
			.prepare('INSERT INTO credentials(username, discord_id, password_hash) VALUES (?, ?, ?)')
			.bind(userName, userId, hash);

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
