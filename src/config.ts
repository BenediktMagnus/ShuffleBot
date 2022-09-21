import { promises as fs } from 'fs';

interface ConfigJson
{
    name?: string;
    clientId?: string;
    token?: string;
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

        this.name = configJson.name;
        this.clientId = configJson.clientId;
        this.token = configJson.token;

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

    public async saveAs (filePath: string): Promise<void>
    {
        const configJson: Required<ConfigJson> = {
            name: this.name,
            clientId: this.clientId,
            token: this.token,
            lobbyChannelId: this.lobbyChannelId,
            secondsPerRound: this.secondsPerRound,
            secondsBetweenRounds: this.secondsBetweenRounds,
            peoplePerRoom: this.peoplePerRoom,
            meetingRoomName: this.meetingRoomName,
        };

        const content = JSON.stringify(configJson, null, 4);

        await fs.writeFile(filePath, content, 'utf8');
    }

    public async save (): Promise<void>
    {
        if (this.filePath === null)
        {
            throw new Error('The config must be loaded before it can be saved.');
        }

        await this.saveAs(this.filePath);
    }
}
