require('dotenv').config();

const DiscordClient = require('./utils/structures/Client.js');
const client = new DiscordClient();

const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const { registerCommands, registerEvents, registerLanguages } = require('./utils/register.js');

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        await registerLanguages(client);
        await registerEvents(client);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: await registerCommands(client)
        })
        client.login(process.env.BOT_TOKEN);
    }
    catch (err) {
        console.log(err);
    }
})();