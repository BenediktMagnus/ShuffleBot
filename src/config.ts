import { promises as fs } from 'fs';

interface ConfigJson
{
    name?: string;
    clientId?: string;
    token?: string;
}

export class Config
{
    public name: string;
    public clientId: string;
    public token: string;

    constructor ()
    {
        this.name = '';
        this.clientId = '';
        this.token = '';
    }

    public async load (filePath: string): Promise<void>
    {
        const content = await fs.readFile(filePath, 'utf8');

        const configJson = JSON.parse(content) as ConfigJson;

        if ((configJson.name === undefined)
            || (configJson.clientId === undefined)
            || (configJson.token === undefined))
        {
            throw new Error('Invalid config file');
        }

        this.name = configJson.name;
        this.clientId = configJson.clientId;
        this.token = configJson.token;
    }

    public reload = this.load.bind(this);
}
