import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';

export default class PingCommand extends Command
{
    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('ping');
        this.data.setDescription('Replies with Pong!');
    }

    public override async execute (interaction: Discord.CommandInteraction): Promise<void>
    {
        await interaction.reply('Pong!');
    }
}
