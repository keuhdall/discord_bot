const config = require('./config.js');
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on("ready", function () {
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on("message", function (msg) {
	if (msg.content === 'ping') {
		msg.channel.sendMessage("pong!");
		console.log("pong-ed " + msg.author.username);
	}
});
bot.login(config.token);
