import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';

export default class ShowParametersCommand extends Command
{
    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('showparameters');
        this.data.setDescription('Show the current parameters.');
    }

    public async execute (interaction: Discord.ChatInputCommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        const roundParameters = this.engine.getRoundParameters();

        const lobbyChannelName = roundParameters.lobbyChannelId === null ? 'not set' : `<#${roundParameters.lobbyChannelId}>`;

        await interaction.editReply(
            `Lobby channel is ${lobbyChannelName}.` + '\n' +
            `Meeting room name is "${roundParameters.meetingRoomName}".` + '\n' +
            `Time per round is ${roundParameters.secondsPerRound} seconds.` + '\n' +
            `Time between rounds is ${roundParameters.secondsBetweenRounds} seconds.` + '\n' +
            `People per room is ${roundParameters.peoplePerRoom}.`
        );
    }
}
