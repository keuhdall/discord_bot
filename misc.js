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

    handleLasergame : message => {
        message.channel.send("Qui a fait -1200 au lasergame ? <@178069705246900234>");
    }
}