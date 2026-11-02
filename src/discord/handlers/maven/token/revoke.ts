import { factory } from '../../../factory';
import { makeStringOption, makeSubCommand } from 'discord-hono';
import { MessageFlags } from 'discord-api-types/v10';

const options = [
	makeStringOption(
		'name',
		'The name bound to token'
	)
];

export const SubCommandMavenTokenRevokeUser = factory.subCommand(
	makeSubCommand('revoke', 'Revoke token by name').options(options),
	async (c) => {
		if (!c.interaction.member) return c.res({ content: `Guild member not found`, flags: MessageFlags.Ephemeral });

		const name = (c.var.name as String).replaceAll(/[^\w\-_]/ig, '_');
		const userId = c.interaction.member.user.id;
		const db = c.env.DB;

		const stmt = db
			.prepare('DELETE FROM credentials WHERE username = ? and discord_id = ?')
			.bind(name, userId);

		await stmt.run();

		const message = `Deleted token ${name}!\n`;

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
