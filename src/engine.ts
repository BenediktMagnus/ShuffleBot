import { Config } from "./config";

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
}
