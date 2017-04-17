const config = require('./config.js');
const Discord = require('discord.js');
const bot = new Discord.Client();
const kraive = '94011401940504576';
const fica = '166226448598695936';
const keuhdall = '100335365998538752';

bot.on("ready", function () {
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on('guildMemberAdd', ({user, guild}) => {
	guild.defaultChannel.sendMessage(`Yo <@${user.id}>, tiens toi à carreau petit fdp sinon la PLS sera pour toi gros batard.`);
});

bot.on('guildMemberRemove', ({user, guild}) => {
	guild.defaultChannel.sendMessage(`Cette sous race de <@${user.id}> viens de se faire mettre en PLS car il ne méritait pas de nous cotoyer, on a un haut standing ici.`);
});

bot.on("message", ({content, channel}) => {
	if (content === "!help")
		channel.sendMessage(`Voici la liste des commandes :\`\`\`
- !help : affiche ce message
- !about : donne des informations sur le bot
- !nogord : met kraive en PLS\`\`\``);
	else if (content === "!about")
		channel.sendMessage(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas a me contacter pour plus de renseignements`);
	else if (content === "!nogord")
		channel.sendMessage(`Qui n'a pas down Nogord ? <@${kraive}>`);
});

bot.on("message", ({author, channel, content}) {
		var tab = content.split(" ");
		if (tab[0] !== "!cleanmsg") return ;
		if (tab[1] === "-count" && tab[2]) {
			var col = channel.fetchMessages({limit : tab[2]});
			for (i = 0; i < col.length, i++) {
				col[i].delete();
			}
			channel.sendMessage('ggwp');
		}
		else
			channel.sendMessage('blablabla c pa b1');
});

bot.on("message", message => {
	if (message.author.id === fica)
		console.log('TODO');
		//message.react(bot.emojis.find('name', 'poop')).catch(console.error)
	else if (message.author.id === kraive)
		message.react(message.guild.emojis.find('name', 'nogpls')).catch(console.error);
});

bot.login(config.token);
