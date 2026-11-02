import { makeActionRow, makeLinkButton, makeSlashCommand } from 'discord-hono'
import { factory } from '../factory'

export const PingCommand = factory.command(
	makeSlashCommand('ping', 'Check state of the maven'),
	c => c.res(
		`**Pong!**\nDeploy tag: ${c.env.CF_VERSION_METADATA.tag}\nDeploy date: ${c.env.CF_VERSION_METADATA.timestamp}`
	)
)
