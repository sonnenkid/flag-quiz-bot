const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        try {
            await member.fetch();
        }
        catch (err) {
            console.log(err);
        }
    }
}