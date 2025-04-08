import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import { bold, ChatInputCommandInteraction } from "discord.js";

@ApplyOptions<Command.Options>({
    name: 'roll',
    description: 'Roll a dice.',
})
export default class extends Command {
    public override async chatInputRun(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const { getRandomNumber } = this.container.utilities['number'];
        const { createStackedText } = this.container.utilities['string'];
        const db = await this.container.db.managers.player.fetch(interaction.user.id);
        const betAmount = interaction.options.getNumber('bet', true) ?? 0;
        const winnings = betAmount * Math.round(0.1 + Math.random() * 1.9);

        let [bot, user] = [getRandomNumber(1, 6), getRandomNumber(1, 6)];

        // Rig the roll so the user only wins 25% of the time
        if (Math.random() > 0.25) {
            while (user <= bot) {
                user = getRandomNumber(1, 6);
            }
        } else {
            while (bot <= user) {
                bot = getRandomNumber(1, 6);
            }
        }


        if (betAmount >= db.economy.coins) {
            return interaction.editReply({
                content: `you don't have that amount, don't try to break me`,
            });
        }

        db.economy.coins += user > bot ? winnings : -betAmount;
        await db.save();

        return interaction.editReply({
            embeds: [
                {
                    title: `You ${user > bot ? 'won' : 'lost'}!`,
                    description: createStackedText(
                        `You rolled a ${bold(user.toString())} and the bot rolled a ${bold(bot.toString())}.`,
                        `Net: ${user > bot ? '+' : '-'}${Math.abs(betAmount - winnings)}`,
                        `You ${user > bot ? 'won' : 'lost'} ${user > bot ? winnings : betAmount} CC.`,
                    )
                }
            ]
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
        registry.registerChatInputCommand(
            (command) =>
                command
                    .setName(this.name)
                    .setDescription(this.description)
                    .addNumberOption((option) => option.setName('bet').setDescription('The amount you want to bet.').setRequired(true).setMinValue(1).setMaxValue(1_000_000_000)),
        );
    }
}