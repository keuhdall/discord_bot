const config = require('./config.js');
const Discord = require('discord.js');
const bot = new Discord.Client();
const kraive = '94011401940504576';
const fica = '166226448598695936';
const poop = '303239764595965952';

bot.on("ready", function () {
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on('guildMemberAdd', ({user, guild}) => {
	guild.defaultChannel.sendMessage(`Yo <@${user.id}>, tiens toi à carreau petit fdp sinon la PLS sera pour toi gros batard.`)
});

bot.on('guildMemberRemove', ({user, guild}) => {
	guild.defaultChannel.sendMessage(`Cette sous race de <@${user.id}> viens de se faire mettre en PLS car il ne méritait pas de nous cotoyer, on a un haut standing ici.`)
});

bot.on("message", ({content, channel}) => {
	if (content !== "!nogord") return ;
	channel.sendMessage(`Qui n'a pas down Nogord ? <@${kraive}>`)
});

bot.on("message", message => {
	if (message.author.id === fica)
		message.react(bot.emojis.find('name', 'poop')).catch(console.error)
	else if (message.author.id === kraive)
		message.react(message.guild.emojis.find('name', 'nogpls')).catch(console.error)
});

bot.login(config.token);
