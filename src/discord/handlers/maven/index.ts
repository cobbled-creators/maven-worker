import { factory } from '../../factory';
import { makeSlashCommand } from 'discord-hono';
import * as token from './token/index';

const handlers = Object.values({ ...token });

export const CommandMaven = factory.command(
	makeSlashCommand('maven', 'Maven Ops').options(
		factory.getSubCommands(handlers)
	),
	factory.subLoader(handlers)
);
