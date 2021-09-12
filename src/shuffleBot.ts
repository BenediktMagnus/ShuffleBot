import * as Discord from 'discord.js';
import * as Path from 'path';
import { Command } from './commands/command';
import type { CommandConstructor } from './types/commandConstructor';
import { Config } from './config';
import { REST as DiscordRestApi } from '@discordjs/rest';
import { Routes as DiscordRoutes } from 'discord-api-types/v9';
import { Engine } from './engine';
import { promises as fs } from 'fs';
import type { ModuleWithDefaultExport } from './types/moduleWithDefaultExport';

export class ShuffleBot
{
    private config: Config;
    private engine: Engine;

    private discordClient: Discord.Client;
    private commands: Discord.Collection<string, Command>;

    constructor (config: Config, engine: Engine)
    {
        this.config = config;
        this.engine = engine;

        const intents = new Discord.Intents();
        intents.add(
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        );

        this.discordClient = new Discord.Client(
            {
                intents: intents
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

        await this.discordClient.login(this.config.token);

        const loginName = this.discordClient.user?.tag;

        if (loginName === undefined)
        {
            throw new Error('Failed to login to Discord, no user tag found.');
        }

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

            const command = new commandClass(this.engine);

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

        const commandsAsJsonArray = this.commands.map(command => command.data.toJSON());

        // We do not register global commands but instead register all commands in all guilds.
        // This prevents the one hour cache restriction of the Discord API.
        for (const guild of guilds)
        {
            const result = await discordRestApi.put(
                DiscordRoutes.applicationGuildCommands(
                    this.config.clientId, guild.id
                ),
                {
                    body: commandsAsJsonArray
                }
            ) as { id: Discord.Snowflake}[];

            // Set permissions (only control group has access) for all commands:
            for (const resultEntry of result)
            {
                const commandId = resultEntry.id;

                const command = await guild.commands.fetch(commandId);

                await command.permissions.add(
                    {
                        permissions: [
                            {
                                id: this.config.controlGroupId,
                                type: 'ROLE',
                                permission: true,
                            }
                        ]
                    }
                );
            }
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
