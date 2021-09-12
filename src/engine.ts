import * as Discord from 'discord.js';
import * as Timer from 'timers/promises';
import { Config } from './config';

interface RoundParameters
{
    lobbyChannelId: string|null;
    meetingRoomName: string;
    secondsPerRound: number;
    secondsBetweenRounds: number;
    peoplePerRoom: number;
}

/**
 * The engine of the bot contains the main logic and handles the commands.
 */
export class Engine
{
    private config: Config;
    private discordClient: Discord.Client;

    private meatingRoomIds: string[];

    private timers: Set<NodeJS.Timer>;

    constructor (config: Config, discordClient: Discord.Client)
    {
        this.config = config;
        this.discordClient = discordClient;

        this.meatingRoomIds = [];

        this.timers = new Set();
    }

    public async setLobbyChannelId (channelId: string): Promise<void>
    {
        this.config.lobbyChannelId = channelId;

        await this.config.save();
    }

    public async setSecondsPerRound (seconds: number): Promise<void>
    {
        this.config.secondsPerRound = seconds;

        await this.config.save();
    }

    public async setSecondsBetweenRounds (seconds: number): Promise<void>
    {
        this.config.secondsBetweenRounds = seconds;

        await this.config.save();
    }

    public async setPeoplePerRoom (count: number): Promise<void>
    {
        this.config.peoplePerRoom = count;

        await this.config.save();
    }

    public async setMeetingRoomName (name: string): Promise<void>
    {
        this.config.meetingRoomName = name;

        await this.config.save();
    }

    public getRoundParameters (): RoundParameters
    {
        return {
            lobbyChannelId: this.config.lobbyChannelId,
            meetingRoomName: this.config.meetingRoomName,
            secondsPerRound: this.config.secondsPerRound,
            secondsBetweenRounds: this.config.secondsBetweenRounds,
            peoplePerRoom: this.config.peoplePerRoom,
        };
    }

    /**
     * Start the shuffle bot!
     * @param commandChannelId The channel where the start command came from.
     */
    public start (commandChannelId: string, startInSeconds: number): void
    {
        const startTimer = setTimeout(
            this.catchVoidPromise(
                async () =>
                {
                    const infoChannel = await this.discordClient.channels.fetch(commandChannelId) as Discord.TextChannel|null;

                    if (infoChannel === null)
                    {
                        console.error('Could not find info channel.');

                        return;
                    }

                    await infoChannel.send('The bot is now shuffling!');

                    await this.shufflePeople();

                    await Timer.setTimeout(5000);

                    await this.returnToLobby();
                }
            ),
            startInSeconds * 1000
        );

        this.timers.add(startTimer);
    }

    private async shufflePeople (): Promise<void>
    {
        if (this.config.lobbyChannelId === null)
        {
            console.error('No lobby channel set.');
            return;
        }

        const lobbyChannel = await this.discordClient.channels.fetch(this.config.lobbyChannelId) as Discord.VoiceChannel|null;

        if (lobbyChannel === null)
        {
            console.error('Could not find lobby channel.');
            return;
        }

        const peopleCount = lobbyChannel.members.size;

        console.log(peopleCount);

        await this.createMeetingRooms(peopleCount, lobbyChannel);
    }

    private async createMeetingRooms (count: number, lobbyChannel: Discord.VoiceChannel): Promise<void>
    {
        for (let roomNumber = 1; roomNumber <= count; roomNumber++)
        {
            const channel = await lobbyChannel.guild.channels.create(
                `${this.config.meetingRoomName} ${roomNumber}`,
                {
                    type: 'GUILD_VOICE',
                    parent: lobbyChannel.parent ?? undefined
                }
            );

            await channel.setUserLimit(count);

            this.meatingRoomIds.push(channel.id);

            await lobbyChannel.members.first()?.voice.setChannel(channel);

            console.log(`Created meeting room ${roomNumber}`);
        }
    }

    private async returnToLobby (): Promise<void>
    {
        if (this.config.lobbyChannelId === null)
        {
            console.error('No lobby channel set.');
            return;
        }

        const lobbyChannel = await this.discordClient.channels.fetch(this.config.lobbyChannelId) as Discord.VoiceChannel|null;

        if (lobbyChannel === null)
        {
            console.error('Could not find lobby channel.');
            return;
        }

        for (const meetingRoomId of this.meatingRoomIds)
        {
            const meetingRoomChannel = await this.discordClient.channels.fetch(meetingRoomId) as Discord.VoiceChannel|null;

            if (meetingRoomChannel === null)
            {
                continue;
            }

            for (const member of meetingRoomChannel.members.values())
            {
                await member.voice.setChannel(lobbyChannel);
            }
        }

        await this.deleteMeetingRooms();
    }

    private async deleteMeetingRooms (): Promise<void>
    {
        for (const meetingRoomId of this.meatingRoomIds)
        {
            const meetingRoomChannel = await this.discordClient.channels.fetch(meetingRoomId);

            if (meetingRoomChannel === null)
            {
                continue;
            }

            await meetingRoomChannel.delete();
        }

        this.meatingRoomIds = [];
    }

    private catchVoidPromise (promiseReturner: (...args: any[]) => Promise<void>): (...args: any[]) => void
    {
        const arrowFunction = (...args: any[]): void =>
        {
            promiseReturner(...args).catch(
                (error) =>
                {
                    console.error(error);
                }
            );
        };

        return arrowFunction;
    }
}
