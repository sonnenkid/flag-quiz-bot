const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const styleCodeBlock = require('../utils/styles/codeBlock.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show the leaderboard')
        .setDescriptionLocalizations({ 'es-ES': 'muestra la tabla de puntos' }),
    async execute(interaction, userLanguage) {

        const { connection, languageFiles } = interaction.client;

        const { strings } = languageFiles.get(userLanguage);

        try {
            const [result] = await connection.query("SELECT * FROM scores ORDER BY score DESC, times_played ASC, last_played ASC LIMIT 0, 10");

            if (!result.length) {
                interaction.reply(string['EMPTY_LEADERBOARD']);
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(strings['LEADERBOARD'])
                .setDescription(strings['SORTED_BY'])
                .setColor('#e0e0e0');
            let fieldText = '';
            for (let index = 0; index < result.length; index++) {
                try {
                    const { discord_id, score } = result[index];
                    const player = await interaction.client.users.cache.get(discord_id);
                    fieldText += `${index + 1}. ${player.username}#${player.discriminator}: ${score} points\n`;
                }
                catch (err) {
                    console.log(err);
                }

            }

            embed.addFields(
                {
                    name: strings['TOP_10'],
                    value: styleCodeBlock(fieldText)
                }
            )

            interaction.reply({ embeds: [embed] });
        }
        catch (err) {
            console.log(err);
        }
    }
}