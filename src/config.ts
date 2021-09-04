import { promises as fs } from 'fs';

interface ConfigJson
{
    name?: string;
    clientId?: string;
    token?: string;
    controlGroupId?: string;
}

export class Config
{
    public name: string;
    public clientId: string;
    public token: string;
    public controlGroupId: string;

    constructor ()
    {
        this.name = '';
        this.clientId = '';
        this.token = '';
        this.controlGroupId = '';
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
    }

    public reload = this.load.bind(this);
}
