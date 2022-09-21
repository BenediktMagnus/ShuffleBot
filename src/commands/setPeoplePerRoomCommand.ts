import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';

export default class SetPeoplePerRoomCommand extends Command
{
    private readonly countOptionName = 'count';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('setpeopleperroom');
        this.data.setDescription('Specify the people count per room.');

        const countOption = new Discord.SlashCommandNumberOption();
        countOption.setName(this.countOptionName);
        countOption.setDescription('The number of people per room.');
        countOption.setRequired(true);
        this.data.addNumberOption(countOption);
    }

    public async execute (interaction: Discord.ChatInputCommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        const count = interaction.options.getNumber(this.countOptionName);

        if (count === null)
        {
            await interaction.editReply('Invalid option.');
            return;
        }

        if (count < 1)
        {
            await interaction.editReply('The people count per room must be greater than zero.');
            return;
        }

        await this.engine.setPeoplePerRoom(count);

        await interaction.editReply(`The people count per room has been set to ${count}.`);
    }
}
