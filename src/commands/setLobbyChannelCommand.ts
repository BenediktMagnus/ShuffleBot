import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';

export default class SetLobbyChannelCommand extends Command
{
    private readonly lobbyChannelOptionName = 'channel';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('setlobbychannel');
        this.data.setDescription('Specify the voice channel that shall be used as the lobby.');

        const lobbyChannelOption = new Discord.SlashCommandChannelOption();
        lobbyChannelOption.setName(this.lobbyChannelOptionName);
        lobbyChannelOption.setDescription('The voice channel that shall be used as the lobby.');
        lobbyChannelOption.setRequired(true);
        this.data.addChannelOption(lobbyChannelOption);
    }

    public async execute (interaction: Discord.ChatInputCommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        const lobbyChannel = interaction.options.getChannel(this.lobbyChannelOptionName);

        if ((lobbyChannel === null) || (lobbyChannel === undefined))
        {
            await interaction.editReply('Invalid channel.');
            return;
        }

        if (lobbyChannel.type != Discord.ChannelType.GuildVoice)
        {
            await interaction.editReply('The channel must be a voice channel.');
            return;
        }

        await this.engine.setLobbyChannelId(lobbyChannel.id);

        await interaction.editReply(`The lobby channel has been set to "${lobbyChannel.name}".`);
    }
}
