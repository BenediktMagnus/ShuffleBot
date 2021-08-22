import * as Discord from 'discord.js';
import * as Path from 'path';
import { Command } from './commands/command';
import type { CommandConstructor } from './types/commandConstructor';
import { Config } from './config';
import { REST as DiscordRestApi } from '@discordjs/rest';
import { Routes as DiscordRoutes } from 'discord-api-types/v9';
import { promises as fs } from 'fs';
import type { ModuleWithDefaultExport } from './types/moduleWithDefaultExport';

export class ShuffleBot
{
    private config: Config;
    private discordClient: Discord.Client;
    private commands: Discord.Collection<string, Command>;

    constructor (config: Config)
    {
        this.config = config;

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

        const loginName = await this.discordClient.login(this.config.token);

        await this.registerCommands();

        return loginName;
    }

    /**
     * Loads all commands from the command directory.
     */
    private async loadCommands (): Promise<void>
    {
        const directoryPath = Path.join(__dirname, 'commands');

        let commandFiles = await fs.readdir(directoryPath);
        commandFiles = commandFiles.filter(file => file.endsWith('Command.js'));

        for (const commandFile of commandFiles)
        {
            const commandFilePath = Path.join(directoryPath, commandFile);

            const commandModule = await import(commandFilePath) as ModuleWithDefaultExport;

            const commandClass = commandModule.default as CommandConstructor;

            const command = new commandClass();

            this.commands.set(command.data.name, command);
        }
    }

    /**
     * Registers all commands at the Discord API.
     */
    private async registerCommands (): Promise<void>
    {
        const discordRestApi = new DiscordRestApi(
            {
                version: '9'
            }
        );

        discordRestApi.setToken(this.config.token);

        const guilds = this.discordClient.guilds.cache.values();

        for (const guild of guilds)
        {
            await discordRestApi.put(
                DiscordRoutes.applicationGuildCommands(
                    this.config.clientId, guild.id
                ),
                {
                    body: this.commands.values()
                }
            );
        }
    }

    public terminate (): void
    {
        this.discordClient.destroy();
    }

    /**
     * Called wheren there is a new interaction from Discord.
     * @param interaction The interaction created by the Discord library.
     */
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
