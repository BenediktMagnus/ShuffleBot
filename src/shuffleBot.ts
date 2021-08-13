import * as Discord from 'discord.js';
import { Command } from './commands/command';
import { promises as fs } from 'fs';

export class ShuffleBot
{
    private discordClient: Discord.Client;
    private commands: Discord.Collection<string, Command>;

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

        this.discordClient.on('interactionCreate', this.onInteraction.bind(this));

        this.commands = new Discord.Collection();
    }

    public async run (): Promise<string>
    {
        await this.loadCommands();

        const loginName = await this.discordClient.login('TODO: Token');

        return loginName;
    }

    private async loadCommands (): Promise<void>
    {
        let commandFiles = await fs.readdir('./commands');
        commandFiles = commandFiles.filter(file => file.endsWith('Command.js'));

        for (const commandFile of commandFiles)
        {
            const command = await import(`./commands/${commandFile}`) as Command;

            this.commands.set(command.data.name, command);
        }
    }

    public terminate (): void
    {
        this.discordClient.destroy();
    }

    private async onInteraction (interaction: Discord.Interaction): Promise<void>
    {
        if (!interaction.isCommand() || !this.commands.has(interaction.commandName))
        {
            return;
        }

        try
        {
            const command = this.commands.get(interaction.commandName);

            if (command === undefined)
            {
                console.error(`Could not find command "${interaction.commandName}".`);

                return;
            }

            await command.execute(interaction);
        }
        catch (error)
        {
            console.error(error);
        }
    }
}
