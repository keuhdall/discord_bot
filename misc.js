const shared = require('./shared.js'),
    tools = require('./tools.js');

module.exports = {
    handleSiu : message => {
        let str = tools.patchArgs(message.content.split(" "), 1);
        if (!str || str === "") return;
        message.channel.send(`Vous avez quoi contre ${str} ?`);
    },
    
    handleWellan : message => {
        let arg = tools.patchArgs(message.content.split(" "), 1);
        message.channel.send(arg.replace(/ /g, "... ") + "...");
    },

    /*
     Function that allows me to recover my permissions if i mess to much with the bot
     Command : !member [only works with my ID ; you have to edit the code]
    */
    handleMember : (message, bot) => {
        let potager = bot.guilds.find('name', 'Potager');
        let vegetable = potager.roles.find('name', 'Légume');
        let standing = potager.roles.find('name', 'Standing');
        let memberKeuhdall = potager.fetchMember(message.author)
        .then(member => {
            let fairRole = Array();
            fairRole.push(vegetable);
            fairRole.push(standing);
            if (message.author.id === keuhdall)
                member.setRoles(fairRole);
        });
    }
}