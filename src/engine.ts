import { Config } from "./config";

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

    constructor (config: Config)
    {
        this.config = config;
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
}