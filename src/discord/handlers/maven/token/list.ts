import { factory } from '../../../factory';
import { makeSubCommand } from 'discord-hono';
import { MessageFlags } from 'discord-api-types/v10';

type TokenRecord = { username?: string; } & Record<string, unknown>;

export const SubCommandMavenTokenList = factory.subCommand(
	makeSubCommand('list', 'List tokens'),
	async c => {
		if (!c.interaction.member) return c.res({ content: `Guild member not found`, flags: MessageFlags.Ephemeral });

		const userId = c.interaction.member.user.id;
		const db = c.env.DB;

		const stmt = db
			.prepare('SELECT username FROM credentials WHERE discord_id = ?')
			.bind(userId);

		const data = await stmt.all();

		let message = `Listing tokens for user <@${userId}>\n`;

		if (!data.success) return c.res({
			content: `No records found for <@${userId}>`,
			flags: MessageFlags.Ephemeral
		});

		data.results.forEach((value: TokenRecord) => {
			message = message + `\`${value.username}\`\n`;
		});

		return c.res({
			content: message,
			flags: MessageFlags.Ephemeral
		});
	}
);
