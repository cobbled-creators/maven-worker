import { factory } from '../../../factory';
import { makeSubCommandGroup } from 'discord-hono';
import * as create from './create';
import * as list from './list';
import * as revoke from './revoke';
import * as rotate from './rotate';

const handlers = Object.values({...create, ...list, ...revoke, ...rotate})

export const SubCommandMavenToken = factory.subCommandGroup(
	makeSubCommandGroup('token', "Manipulate tokens").options(
		factory.getSubCommands(handlers)
	),
	factory.subLoader(handlers)
)
