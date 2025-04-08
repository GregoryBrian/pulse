import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable, Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, inlineCode } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Generates a random number between your minimum and maximum numbers.'
})
export class Random extends Command {
	public override chatInputRun(interaction: ChatInputCommandInteraction) {
		const min = interaction.options.getNumber('min', true);
		const max = interaction.options.getNumber('max', true);
		const num = this.container.utilities['number'].getRandomNumber(min, max);

		return interaction.reply(`Your random number is ${inlineCode(num.toLocaleString())}`);
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command
				.setName(this.name)
				.setDescription(this.description)
				.addNumberOption((option) => option.setName('min').setDescription('The minimum value.').setRequired(true))
				.addNumberOption((option) => option.setName('max').setDescription('The maximum value.').setRequired(true))
		);
	}
}
