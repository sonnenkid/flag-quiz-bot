const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild) {
        try {
            await guild.members.fetch();
            console.log(`Bot joined on guild ${guild.id}`);
        }
        catch (err) {
            console.log(err);
        }
    }
}