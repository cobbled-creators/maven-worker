import { factory } from '../../../factory';
import { makeSubCommandGroup } from 'discord-hono';
import * as create from './create';

const handlers = Object.values({...create})

export const SubCommandMavenToken = factory.subCommandGroup(
	makeSubCommandGroup('token', "Manipulate Tokens").options(
		factory.getSubCommands(handlers)
	),
	factory.subLoader(handlers)
)
