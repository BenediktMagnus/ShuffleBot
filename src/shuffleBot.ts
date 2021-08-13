import * as Discord from 'discord.js';

export class ShuffleBot
{
    private discordClient: Discord.Client;

    constructor ()
    {
        this.discordClient = new Discord.Client(
            {
                intents: [Discord.Intents.FLAGS.GUILDS && Discord.Intents.FLAGS.GUILD_MESSAGES]
            }
        );

        this.discordClient.on('error',
            (error) =>
            {
                console.error(error);
            }
        );

    }

    public async run (): Promise<string>
    {
        const loginName = await this.discordClient.login('TODO: Token');

        return loginName;
    }

    public terminate (): void
    {
        this.discordClient.destroy();
    }
}
