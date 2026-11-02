import { register } from 'discord-hono'
import * as handlers from './handlers'
import { factory } from './factory'

register(
	factory.getCommands(Object.values(handlers)),
	process.env.DISCORD_APPLICATION_ID,
	process.env.DISCORD_TOKEN,
)
