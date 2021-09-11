import * as Discord from 'discord.js';
import { Engine } from '../engine';
import { SlashCommandBuilder } from '@discordjs/builders';

export abstract class Command
{
    protected readonly engine: Engine;
    public readonly data: SlashCommandBuilder;

    constructor (engine: Engine)
    {
        this.engine = engine;

        this.data = new SlashCommandBuilder();
    }

    public abstract execute (interaction: Discord.CommandInteraction): Promise<void>;
}
