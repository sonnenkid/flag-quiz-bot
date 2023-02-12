const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.log(`No command matching ${interaction.commandName} was found.`);
            return
        }

        const userLanguage = interaction.locale;
        const { languageFiles, defaultLanguage } = interaction.client;

        if (!languageFiles.has(userLanguage)) {
            userLanguage = defaultLanguage;
        }

        try {
            await command.execute(interaction, userLanguage);
        }
        catch (err) {
            console.log(`Error executing ${interaction.commandName}`);
            console.log(err);
        }
    }
}