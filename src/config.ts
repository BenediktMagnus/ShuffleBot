import { promises as fs } from 'fs';

interface ConfigJson
{
    name?: string;
    clientId?: string;
    token?: string;
    controlGroupId?: string;
    lobbyChannelId?: string|null;
    secondsPerRound?: number;
    secondsBetweenRounds?: number;
    peoplePerRoom?: number;
    meetingRoomName?: string;
}

export class Config
{
    // TODO: The following three should be readonly properties:
    public name: string;
    public clientId: string;
    public token: string;
    /** The ID of the group that is allowed to control the bot (can use commands). */
    public controlGroupId: string;
    /** The ID of the channel used as lobby; that is where everyone starts that will be distributed to the meeting rooms. */
    public lobbyChannelId: string|null;
    public secondsPerRound: number;
    public secondsBetweenRounds: number;
    public peoplePerRoom: number;
    public meetingRoomName: string;

    private filePath: string|null;

    constructor ()
    {
        this.name = '';
        this.clientId = '';
        this.token = '';
        this.controlGroupId = '';
        this.lobbyChannelId = null;
        this.secondsPerRound = 300;
        this.secondsBetweenRounds = 60;
        this.peoplePerRoom = 4;
        this.meetingRoomName = 'Meeting Room';

        this.filePath = null;
    }

    public async load (filePath: string): Promise<void>
    {
        const content = await fs.readFile(filePath, 'utf8');

        const configJson = JSON.parse(content) as ConfigJson;

        if (configJson.name === undefined)
        {
            throw new Error('Config file is missing the name field.');
        }
        if (configJson.clientId === undefined)
        {
            throw new Error('Config file is missing the clientId field.');
        }
        if (configJson.token === undefined)
        {
            throw new Error('Config file is missing the token field.');
        }
        if (configJson.controlGroupId === undefined)
        {
            throw new Error('Config file is missing the controlGroupId field.');
        }

        this.name = configJson.name;
        this.clientId = configJson.clientId;
        this.token = configJson.token;
        this.controlGroupId = configJson.controlGroupId;

        this.lobbyChannelId = configJson.lobbyChannelId ?? null;

        if (configJson.secondsPerRound !== undefined)
        {
            this.secondsPerRound = configJson.secondsPerRound;
        }
        if (configJson.secondsBetweenRounds !== undefined)
        {
            this.secondsBetweenRounds = configJson.secondsBetweenRounds;
        }
        if (configJson.peoplePerRoom !== undefined)
        {
            this.peoplePerRoom = configJson.peoplePerRoom;
        }
        if (configJson.meetingRoomName !== undefined)
        {
            this.meetingRoomName = configJson.meetingRoomName;
        }
        // TODO: Should these fields be part of the config default file?

        this.filePath = filePath;
    }

    public reload = this.load.bind(this);
}
