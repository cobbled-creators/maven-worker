import { makeSlashCommand } from 'discord-hono';
import { factory } from '../factory';

export const CommandPing = factory.command(
	makeSlashCommand('ping', 'Check state of the maven'),
	c => c.res(
		`Pong!\n` +
		`**Deploy version id:** ${c.env.CF_VERSION_METADATA.id}\n` +
		`**Deploy date:** ${c.env.CF_VERSION_METADATA.timestamp}\n` +
		`**Guild:** ${c.interaction.guild_id}\n`
	)
);
