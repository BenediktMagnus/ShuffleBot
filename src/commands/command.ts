import * as Discord from 'discord.js';
import { Engine } from '../engine';

export abstract class Command
{
    protected readonly engine: Engine;
    public readonly data: Discord.SlashCommandBuilder;

    constructor (engine: Engine)
    {
        this.engine = engine;

        this.data = new Discord.SlashCommandBuilder();
        this.data.setDefaultMemberPermissions(null);
    }

    public abstract execute (interaction: Discord.Interaction): Promise<void>;
}
