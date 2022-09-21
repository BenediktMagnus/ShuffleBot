import * as Discord from 'discord.js';
import { Command } from './command';
import { Engine } from '../engine';

export default class EndCommand extends Command
{
    private readonly immediatelyOptionName = 'immediately';

    constructor (engine: Engine)
    {
        super(engine);

        this.data.setName('end');
        this.data.setDescription('End the shuffling.');

        const immediatelyOption = new Discord.SlashCommandBooleanOption();
        immediatelyOption.setName(this.immediatelyOptionName);
        immediatelyOption.setDescription('If true, end the shuffling immediately.');
        immediatelyOption.setRequired(false);
        this.data.addBooleanOption(immediatelyOption);
    }

    public async execute (interaction: Discord.ChatInputCommandInteraction): Promise<void>
    {
        await interaction.deferReply();

        const endImmediately = interaction.options.getBoolean(this.immediatelyOptionName);

        if ((endImmediately === null) || (!endImmediately))
        {
            this.engine.end();

            await interaction.editReply('This will be the last round of shuffling.');
        }
        else
        {
            await this.engine.cancel();

            await interaction.editReply('Ended the shuffling immediately.');
        }
    }
}
