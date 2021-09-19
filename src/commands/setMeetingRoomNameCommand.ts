import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';
import { SlashCommandStringOption } from '@discordjs/builders';

export default class SetMeetingRoomNameCommand extends Command
{
    private readonly nameOptionName = 'name';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('setmeetingroomname');
        this.data.setDescription('Specify the name of the meeting rooms. This will be postfixed with the room number.');

        const nameOption = new SlashCommandStringOption();
        nameOption.setName(this.nameOptionName);
        nameOption.setDescription('The room name.');
        nameOption.setRequired(true);
        this.data.addStringOption(nameOption);
    }

    public async execute (interaction: Discord.CommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        const name = interaction.options.getString(this.nameOptionName);

        if (name === null)
        {
            await interaction.editReply('Invalid option.');
            return;
        }

        if (name == '')
        {
            await interaction.editReply('The room name must not be empty.');
            return;
        }

        await this.engine.setMeetingRoomName(name);

        await interaction.editReply(`The meeting room name has been set to "${name}".`);
    }
}
