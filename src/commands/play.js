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
        countries = countries.filter(country => country.independent);

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

        const session = [];

        for (let i = 0; i < 5; i++) {
            const index = Math.floor(Math.random() * countries.length);
            const [country] = countries.splice(index, 1);
            const flag = new AttachmentBuilder()
                .setFile(country.flag.url);
            const embed = new EmbedBuilder()
                .setTitle(strings['GUESS'])
                .setImage(country.flag.attachment)
                .setColor('#FFFFFF');
            session.push({
                content: { embeds: [embed], files: [flag] },
                answers: [country.name.official, country.name.common],
                reaction: country.flag.emoji
            });
        }

        let sessionCorrectAnswers = 0;
        let sessionScore = 0;

        try {
            await interaction.reply(strings['STARTING']);
            let message = null;
            for (const { content, answers, reaction } of session) {
                if (message) message.edit(content);
                else message = await interaction.channel.send(content);

                const filter = response => { return answers.some(answer => normalizeText(answer) === normalizeText(response.content) && userID === response.author.id) }
                await interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                    .then((collected) => {
                        collected.first().react(reaction);
                        sessionScore += 10;
                        sessionCorrectAnswers++;
                    })
                    .catch();
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