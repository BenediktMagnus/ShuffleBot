import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';
import { SlashCommandNumberOption } from '@discordjs/builders';

export default class SetSecondsBetweenRoundsCommand extends Command
{
    private readonly secondsOptionName = 'seconds';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('setsecondsbetweenrounds');
        this.data.setDescription('Specify the amount of seconds between two rounds.');
        this.data.setDefaultPermission(false);

        const secondsOption = new SlashCommandNumberOption();
        secondsOption.setName(this.secondsOptionName);
        secondsOption.setDescription('The amount of seconds between two rounds.');
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
            await interaction.editReply('The amount of seconds between two rounds must be greater than zero.');
            return;
        }

        await this.engine.setSecondsBetweenRounds(seconds);

        await interaction.editReply(`The amount of seconds between two rounds has been set to ${seconds} seconds.`);
    }
}
