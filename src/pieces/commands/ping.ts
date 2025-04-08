import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable, Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, inlineCode } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: "Checks for the bot's heartbeat."
})
export class Ping extends Command {
	public override chatInputRun(interaction: ChatInputCommandInteraction) {
		return interaction.reply(`Pong! Took ${inlineCode(`${interaction.client.ws.ping}ms`)} to ping.`);
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) => command.setName(this.name).setDescription(this.description));
	}
}
