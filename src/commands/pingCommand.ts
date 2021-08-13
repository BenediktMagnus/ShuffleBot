import * as Discord from 'discord.js';
import { Command } from './command';
import { SlashCommandBuilder } from '@discordjs/builders';

export class PingCommand implements Command
{
    public data: SlashCommandBuilder;

    constructor ()
    {
        this.data = new SlashCommandBuilder();
        this.data.setName('ping');
        this.data.setDescription('Replies with Pong!');
    }

    public async execute (interaction: Discord.CommandInteraction): Promise<void>
    {
        await interaction.reply('Pong!');
    }
}
