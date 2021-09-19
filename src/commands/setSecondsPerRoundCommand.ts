import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';
import { SlashCommandNumberOption } from '@discordjs/builders';

export default class SetSecondsPerRoundCommand extends Command
{
    private readonly secondsOptionName = 'seconds';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('setsecondsperround');
        this.data.setDescription('Specify the amount of seconds a round will last.');
        this.data.setDefaultPermission(false);

        const secondsOption = new SlashCommandNumberOption();
        secondsOption.setName(this.secondsOptionName);
        secondsOption.setDescription('The amount of seconds a round will last.');
        secondsOption.setRequired(true);
        this.data.addNumberOption(secondsOption);
    }

    public async execute (interaction: Discord.CommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        const seconds = interaction.options.getNumber(this.secondsOptionName);

        if (seconds === null)
        {
            await interaction.editReply('Invalid option.');
            return;
        }

        if (seconds < 1)
        {
            await interaction.editReply('The time a round will last must be greater than zero.');
            return;
        }

        await this.engine.setSecondsPerRound(seconds);

        await interaction.editReply(`The time a round will last has been set to ${seconds} seconds.`);
    }
}
