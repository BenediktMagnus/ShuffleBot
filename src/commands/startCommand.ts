import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';
import { SlashCommandNumberOption } from '@discordjs/builders';

export default class StartCommand extends Command
{
    private readonly startInSecondsOptionName = 'startin';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('start');
        this.data.setDescription('Start the shuffling!');
        this.data.setDefaultPermission(false);

        const startInSecondsOption = new SlashCommandNumberOption();
        startInSecondsOption.setName(this.startInSecondsOptionName);
        startInSecondsOption.setDescription(
            'Seconds to wait until starting. Defaults to the time between rounds.'
        );
        startInSecondsOption.setRequired(false);
        this.data.addNumberOption(startInSecondsOption);
    }

    public async execute (interaction: Discord.CommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        let startInSeconds = interaction.options.getNumber(this.startInSecondsOptionName);

        if (startInSeconds === null)
        {
            startInSeconds = 0;
        }

        const roundParameters = this.engine.getRoundParameters();

        if (roundParameters.lobbyChannelId === null)
        {
            await interaction.editReply('No lobby channel has been set.');
            return;
        }

        const sendFromChannelId = interaction.channelId;

        await interaction.editReply(
            `Lobby channel is <#${roundParameters.lobbyChannelId}>.` + '\n' +
            `Meeting room name is "${roundParameters.meetingRoomName}".` + '\n' +
            `Seconds per round is ${roundParameters.secondsPerRound}.` + '\n' +
            `Seconds between rounds is ${roundParameters.secondsBetweenRounds}.` + '\n' +
            `People per room is ${roundParameters.peoplePerRoom}.`
        );

        await this.engine.start(sendFromChannelId, startInSeconds);
    }
}
