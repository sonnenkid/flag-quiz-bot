const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const normalizeText = require('../utils/normalizeText.js');
const formatDate = require('../utils/formatDate.js');

const hasPlayedToday = async function (connection, userID, today) {
    try {
        const [result] = await connection.query("SELECT last_played FROM scores WHERE discord_id = ?", [userID]);

        if (!result.length) {
            return false;
        }

        const lastPlayed = result[0].last_played;
        return formatDate(lastPlayed) === formatDate(today);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('your daily session of five random flags')
        .setDescriptionLocalizations({ 'es-ES': 'tu sesion diaria de cinco banderas aleatorias' }),
    async execute(interaction, userLanguage) {

        const { connection, playLock, languageFiles } = interaction.client;
        const { id: serverID } = interaction.guild;
        const { id: userID } = interaction.user;

        const { strings, countries } = languageFiles.get(userLanguage);

        if (playLock.has(serverID)) {
            interaction.reply(strings["IN_USE"]);
            return;
        }

        const today = new Date();
        if (await hasPlayedToday(connection, userID, today)) {
            interaction.reply(strings['ALREADY_PLAYED']);
            return;
        }

        playLock.set(serverID, true);

        const attachments = [];

        for (let i = 0; i < 5; i++) {
            const index = Math.floor(Math.random() * countries.length);
            const country = countries.splice(index, 1)[0];
            const flag = new AttachmentBuilder(`src/assets/flags/${country.cca2}.png`);
            const messageEmbed = new EmbedBuilder();
            messageEmbed.setTitle(strings['GUESS']);
            messageEmbed.setImage(`attachment://${country.cca2}.png`);
            messageEmbed.setColor('#FFFFFF');
            const attachment = {
                embed: messageEmbed,
                flag: flag,
                answers: [country.name.official, country.name.common]
            }
            attachments.push(attachment);
        }

        let sessionCorrectAnswers = 0;
        let sessionScore = 0;

        try {
            await interaction.reply(strings['STARTING']);
            let message = null;
            for (const attachment of attachments) {
                const { embed, flag, answers } = attachment;
                if (message) message.edit({ embeds: [embed], files: [flag] });
                else message = await interaction.channel.send({ embeds: [embed], files: [flag] });

                const filter = response => {
                    return answers.some(r => normalizeText(r) === normalizeText(response.content) && userID === response.author.id);
                }
                await interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                    .then((collected) => {
                        collected.first().react('✅');
                        sessionScore += 10;
                        sessionCorrectAnswers++;
                    })
                    .catch((err) => {
                    })
            }
            interaction.channel.send(`${strings['CORRECT_ANSWERS'].replace(/%REPL%/g, sessionCorrectAnswers)}. ${strings['POINTS'].replace(/%REPL%/g, sessionScore)}`);
            connection.query("INSERT INTO scores (discord_id, score, last_played, times_played) VALUES (?, ?, ?, default) ON DUPLICATE KEY UPDATE score=score+VALUES(score), last_played=VALUES(last_played), times_played=times_played+1", [userID, sessionScore, today]);
            playLock.delete(serverID);
        }
        catch (err) {
            console.log(err);
        }
    }
}