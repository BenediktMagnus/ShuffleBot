import * as Discord from 'discord.js';
import { Config } from './config';

// TODO: It should be checked if actions in Discord are successful or fail because of (internal) errors. Is there a global error handler?

interface RoundParameters
{
    lobbyChannelId: string|null;
    meetingRoomName: string;
    secondsPerRound: number;
    secondsBetweenRounds: number;
    peoplePerRoom: number;
}

interface Channels
{
    lobby: Discord.VoiceChannel;
    info: Discord.TextChannel;
}

/**
 * The engine of the bot contains the main logic and handles the commands.
 */
export class Engine
{
    private config: Config;
    private discordClient: Discord.Client;

    /** The info channel is the channel where all information will be messaged to;
     *  is set to the channel where the start command came from. */
    private infoChannelId: string|null;

    /** True while the bot shall run. Will be set to false when it shall end. */
    private continueRunning: boolean;

    private meatingRoomIds: string[];

    private queuedEvents: Set<NodeJS.Timer>;

    constructor (config: Config, discordClient: Discord.Client)
    {
        this.config = config;
        this.discordClient = discordClient;

        this.infoChannelId = null;
        this.continueRunning = false;

        this.meatingRoomIds = [];

        this.queuedEvents = new Set();
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
    public async start (commandChannelId: string, startInSeconds: number): Promise<void>
    {
        this.infoChannelId = commandChannelId;

        this.continueRunning = true;

        await this.queueNextRound(startInSeconds);
    }

    private async queueNextRound (startInSeconds: number): Promise<void>
    {
        this.queueEvent(
            async () =>
            {
                const channels = await this.tryGetChannels();

                if (channels === null)
                {
                    return;
                }

                await channels.info.send('The bot is now shuffling!');

                const meetingRoomChannels = await this.createMeetingRooms(channels);
                await this.shufflePeople(channels, meetingRoomChannels);

                this.queueReminders();

                this.queueFinaliser();
            },
            startInSeconds
        );

        const channels = await this.tryGetChannels();

        if (channels === null)
        {
            return;
        }

        await channels.info.send(`The shuffling will start in ${startInSeconds} seconds!`);
    }

    private async shufflePeople (channels: Channels, meetingRoomChannels: Discord.VoiceChannel[]): Promise<void>
    {
        const peopleCount = channels.lobby.members.size;
        const roomCount = meetingRoomChannels.length;

        /* TODO: The following could perhabs be faster by getting the list of all members in the lobby beforehand and distributing them
           in parallel (without await) to the meeting rooms, then afterwards wait for all setChannel promises to finish.
           It should be tested if this is indeed faster (it could not if the Discord API bottlenecked) and is as reliable as the current
           solution. One would have to check for members leaving the lobby in the meantime, references becoming invalid and possible
           reliability issues with the API, possibly more. */

        while (channels.lobby.members.size > 0)
        {
            for (const meetingRoom of meetingRoomChannels)
            {
                if ((meetingRoom.members.size >= this.config.peoplePerRoom) || (channels.lobby.members.size <= 0))
                {
                    break;
                }

                await channels.lobby.members.random()?.voice.setChannel(meetingRoom);
            }
        }

        await channels.info.send(`The bot has shuffled ${peopleCount} people into ${roomCount} rooms.`);
    }

    private async createMeetingRooms (channels: Channels): Promise<Discord.VoiceChannel[]>
    {
        const peopleCount = channels.lobby.members.size;
        // TODO: Check for too few members left.
        const roomCount = Math.ceil(peopleCount / this.config.peoplePerRoom);

        const meetingRoomChannels: Discord.VoiceChannel[] = [];

        for (let roomNumber = 1; roomNumber <= roomCount; roomNumber++)
        {
            const channel = await channels.lobby.guild.channels.create(
                `${this.config.meetingRoomName} ${roomNumber}`,
                {
                    type: 'GUILD_VOICE',
                    parent: channels.lobby.parent ?? undefined
                }
            );

            await channel.setUserLimit(this.config.peoplePerRoom);
            // Set the same permissions for the channel as for the lobby:
            await channel.permissionOverwrites.set(channels.lobby.permissionOverwrites.cache);

            meetingRoomChannels.push(channel);

            this.meatingRoomIds.push(channel.id);
        }

        return meetingRoomChannels;
    }

    /**
     * Create events for the reminders of how many minutes left.
     * There will be one reminder for one minute left and one for each five minutes (five, ten, fifteen...).
     */
    private queueReminders (): void
    {
        let oneMinuteReminderTime = this.config.secondsPerRound - 60;
        if (oneMinuteReminderTime < 0)
        {
            oneMinuteReminderTime = 0;
        }

        this.queueEvent(
            async () =>
            {
                const channels = await this.tryGetChannels();

                if (channels === null)
                {
                    return;
                }

                if (oneMinuteReminderTime > 0)
                {
                    await channels.info.send('1 minute left!');
                }
                else
                {
                    await channels.info.send(`${this.config.secondsPerRound} seconds left!`);
                }
            },
            oneMinuteReminderTime
        );

        let remainingTime = this.config.secondsPerRound;
        let counter = 1;
        while (remainingTime > 5 * 60)
        {
            remainingTime -= 5 * 60;
            const minutesLeft = counter * 5;

            this.queueEvent(
                async () =>
                {
                    const channels = await this.tryGetChannels();

                    if (channels === null)
                    {
                        return;
                    }

                    await channels.info.send(`${minutesLeft} minutes left.`);
                },
                remainingTime
            );

            counter += 1;
        }
    }

    /**
     * Create an event to return all members back to the lobby and delete the meeting rooms.
     * If continueRunning is true, an event to start the next round will be created.
     */
    private queueFinaliser (): void
    {
        this.queueEvent(
            async () =>
            {
                const channels = await this.tryGetChannels();

                if (channels === null)
                {
                    return;
                }

                await channels.info.send('Returning to lobby.');

                await this.returnToLobby();
                await this.deleteMeetingRooms();

                if (this.continueRunning)
                {
                    await this.queueNextRound(this.config.secondsBetweenRounds);
                }
                else
                {
                    await channels.info.send('The shuffling ended.');
                }
            },
            this.config.secondsPerRound
        );
    }

    private async returnToLobby (): Promise<void>
    {
        const channels = await this.tryGetChannels();

        if (channels === null)
        {
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
                // TODO: Check for too few members left.

                await member.voice.setChannel(channels.lobby);
            }
        }
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

    /**
     * End the shuffling after the current round.
     */
    public end (): void
    {
        this.continueRunning = false;
    }

    /**
     * Cancel the shuffling, including any ongoing round.
     */
    public async cancel (): Promise<void>
    {
        this.continueRunning = false;

        this.cancelAllEvents();

        await this.returnToLobby();
        await this.deleteMeetingRooms();
    }

    /**
     * Try to get the channels.
     * If one of them is not found, return null and cancel all ongoing events.
     */
    private async tryGetChannels (): Promise<Channels|null>
    {
        //TODO: Canceling all events is unexpected. Either remove that or rename the function to represent what it does.

        if ((this.config.lobbyChannelId === null) || (this.infoChannelId === null))
        {
            console.error('No lobby or info channel set.');

            this.cancelAllEvents();

            return null;
        }

        const lobbyChannel = await this.discordClient.channels.fetch(this.config.lobbyChannelId) as Discord.VoiceChannel|null;
        const infoChannel = await this.discordClient.channels.fetch(this.infoChannelId) as Discord.TextChannel|null;

        if ((lobbyChannel === null) || (infoChannel === null))
        {
            console.error('Could not find lobby or info channel.');

            this.cancelAllEvents();

            return null;
        }

        return {
            lobby: lobbyChannel,
            info: infoChannel,
        };
    }

    /**
     * Add a timed event to the list of queued events.
     * Can later be cancelled.
     * @param callback The function to run.
     * @param startInSeconds The time to start the event in seconds from now.
    */
    private queueEvent (asyncCallback: (...args: any[]) => Promise<void>, startInSeconds: number): void
    {
        const syncedCallback = this.catchVoidPromise(asyncCallback);

        const timeout = setTimeout(
            () =>
            {
                syncedCallback();

                this.queuedEvents.delete(timeout);
            },
            startInSeconds * 1000
        );

        this.queuedEvents.add(timeout);
    }

    /**
     * Cancell all ongoing events.
     */
    private cancelAllEvents (): void
    {
        for (const timer of this.queuedEvents)
        {
            clearTimeout(timer);
        }
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
