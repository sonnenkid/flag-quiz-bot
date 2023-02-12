const { Client, Collection, GatewayIntentBits } = require('discord.js');
const createConnection = require('../../../database/database.js');

class DiscordClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent
            ]
        })
        createConnection
            .then(connection => {
                this.connection = connection;
                console.log('Succesfully connected to the database');
            })
            .catch(err => {
                throw new Error(err);
            })
        this.commands = new Collection();
        this.languageFiles = new Collection();
        this.defaultLanguage = 'en-US';
        this.playLock = new Collection();

    }
}

module.exports = DiscordClient;