import * as Discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface Command
{
    data: SlashCommandBuilder;

    execute (interaction: Discord.CommandInteraction): Promise<void>;
}
