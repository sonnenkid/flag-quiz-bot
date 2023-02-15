const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const normalizeText = require('../utils/normalizeText.js');
const addLineBreaks = require('../utils/styles/lineBreaks.js');
const styleCodeBlock = require('../utils/styles/codeBlock.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('get info about the specified country')
        .setDescriptionLocalizations({ 'es-ES': 'muestra informacion sobre el pais indicado' })
        .addStringOption((option) =>
            option
                .setName('country')
                .setNameLocalizations({ 'es-ES': 'pais' })
                .setDescription('country from which you want to get info')
                .setDescriptionLocalizations({ 'es-ES': 'pais del que quieres obtener informacion' })
                .setRequired(true)
                .addChoices()),
    async execute(interaction, userLanguage) {

        const { languageFiles } = interaction.client;

        const { strings, countries } = languageFiles.get(userLanguage);

        let option = interaction.options.getString('country');
        let country = await countries.find(c => normalizeText(c.name.common) === normalizeText(option) || normalizeText(c.name.official) === normalizeText(option));

        if (!country) {
            interaction.reply(strings['COUNTRY_NOT_VALID'].replace(/%REPL%/g, option));
            return;
        }


        const flag = new AttachmentBuilder()
            .setFile(country.flag.url);
        const embed = new EmbedBuilder()
            .setAuthor({ name: country.name.common.toUpperCase(), iconURL: country.flag.attachment })
            .setImage(country.flag.attachment)
            .setColor('#e0e0e0');

        let bordersText = '';
        if (country.borders.length) {
            for (const border of country.borders) {
                bordersText += `${border.flag} ${border.name}\n`
            }
        }
        else {
            bordersText += strings['DOES_NOT_HAVE'];
        }

        let capitalsText = '';
        if (country.capital.length) {
            for (const capital of country.capital) {
                capitalsText += `${capital}\n`
            }
        }
        else {
            capitalsText += strings['DOES_NOT_HAVE'];
        }

        embed.addFields(
            {
                name: strings['OFFICIAL_NAME'],
                value: styleCodeBlock(addLineBreaks(country.name.official, 30))
            },
            {
                name: strings['CAPITAL'],
                value: styleCodeBlock(capitalsText)
            },
            {
                name: strings['CONTINENT'],
                value: styleCodeBlock(country.region),
                inline: true
            },
            {
                name: strings['SUBREGION'],
                value: styleCodeBlock(country.subregion),
                inline: true
            },
            {
                name: strings['BORDERS_WITH'],
                value: bordersText
            },
            {
                name: strings['AREA'],
                value: styleCodeBlock(country.area)
            }
        )

        interaction.reply({ embeds: [embed], files: [flag] });

    }
}