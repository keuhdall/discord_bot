const shared = require('./shared.js'),
    tools = require('./tools.js');

module.exports = {
    handleSiu : message => {
        let arg = tools.patchArgs(message.content.split(" "), 1);
        if (!arg || arg === "") return;
        message.channel.send(`Vous avez quoi contre ${arg} ?`);
    },
    
    handleWellan : message => {
        let arg = tools.patchArgs(message.content.split(" "), 1);
        message.channel.send(arg.replace(/ /g, "... ") + "...");
    },

    handleSjw : message => {
        let arg = tools.patchArgs(message.content.split(" "), 1);
        if (!arg || arg === "") return;
        message.channel.send(`${arg} n'est pas systématique, donc ${arg} n'existe pas.`);
    },

    handleLasergame : message => {
        message.channel.send("Qui a fait -1200 au lasergame ? <@178069705246900234>");
    }
}