import { factory } from '../../../factory';
import { makeStringOption, makeSubCommand } from 'discord-hono';
import { MessageFlags } from 'discord-api-types/v10';

const options = [
	makeStringOption(
		'username',
		'The username bound to token'
	)
];

export const SubCommandMavenTokenRevokeUser = factory.subCommand(
	makeSubCommand('revoke', 'Revoke token by user').options(options),
	async (c) => {
		if (!c.interaction.member) return c.res({ content: `Guild member not found`, flags: MessageFlags.Ephemeral });

		const userName = (c.var.username as String).replaceAll(/[^\w\-_]/ig, '_');
		const userId = c.interaction.member.user.id;
		const db = c.env.DB;

		const stmt = db
			.prepare('DELETE FROM credentials WHERE username = ? and discord_id = ?')
			.bind(userName, userId);

		await stmt.run();

		const message = `Deleted token ${userName}!\n`;

		return c.res({
			content: message,
			flags: MessageFlags.Ephemeral
		});
	}
);

export const SubCommandMavenTokenRevokeAll = factory.subCommand(
	makeSubCommand('revoke_all', 'Revoke all tokens').options(options),
	async (c) => {
		if (!c.interaction.member) return c.res({ content: `Guild member not found`, flags: MessageFlags.Ephemeral });

		const userId = c.interaction.member.user.id;
		const db = c.env.DB;

		const stmt = db
			.prepare('DELETE FROM credentials WHERE discord_id = ?')
			.bind(userId);

		await stmt.run();

		const message = `Deleted all tokens for <@${userId}>!\n`;

		return c.res({
			content: message,
			flags: MessageFlags.Ephemeral
		});
	}
);
