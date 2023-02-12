const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const guilds = client.guilds.cache;
        for (const [key, value] of guilds) {
            try {
                await value.members.fetch();
            }
            catch (err) {
                console.log(err);
            }
        }
        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
}