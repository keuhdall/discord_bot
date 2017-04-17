const config = require('./config.js');
const Discord = require('discord.js');
const bot = new Discord.Client();
const kraive = '94011401940504576';
const fica = '166226448598695936';
const keuhdall = '100335365998538752';
const navet = '94045969099792384';

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
- !msg : affiche le n-ieme message du channel
- !clean [-c -t]: permet de clean les derniers messages	du channel courant. -c = count -t = time
- !nogord : met kraive en PLS\`\`\``);
	else if (content === "!about")
		channel.sendMessage(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas a me contacter pour plus de renseignements`);
	else if (content === "!nogord")
		channel.sendMessage(`Qui n'a pas down Nogord ? <@${kraive}>`);
});

/*
Function that clean messages
Command : !clean [option] [number]
Available options : -c -t
*/
bot.on("message", message => {
		var tab = message.content.split(" ");
		if (tab[0] !== "!clean") return ;
		if (tab[1] === "-c" && tab[2]) {
			if (message.author.id !== navet && message.author.id !== keuhdall) {
				message.channel.sendMessage('Hep hep hep, t\'as pas les droits sale retard.');
				return ;
			}
			if (tab[2] > 50) tab[2] = 50; 
			tab[2]++;
			message.channel.fetchMessages({limit : tab[2]})
			.then(messages => {
				var msg = messages.array();
				for (var i = 0; i < tab[2]; i++)
					msg[i].delete();
			})
			.catch(console.error());
			message.channel.sendMessage(`${tab[2] - 1} Messages effacés avec succès par ${message.author.username}.`);
		}
		else
			message.channel.sendMessage('Erreur de syntaxe dans la commande, tapez !help pour plus d\'informations');
});

/*
Function that will display the n-th message
Command : !msg [index of the message you zqnt to display]
*/
bot.on("message", message => {
	var tab = message.content.split(" ");
	if (tab[0] !== "!msg" || !tab[1]) return ;
	tab[1]++;
	message.channel.fetchMessages({limit : tab[1]})
	.then(messages => {
		var msg = messages.array();
		message.channel.sendMessage(`${msg[tab[1] - 1].content}`);
	})
	.catch(console.error());
});

/*
Function that will automatically add a reaction to the messages of certain members to troll them
*/
bot.on("message", message => {
	if (message.author.id === fica)
		console.log('TODO');
		//message.react(bot.emojis.find('name', 'poop')).catch(console.error)
	else if (message.author.id === kraive)
		message.react(message.guild.emojis.find('name', 'nogpls')).catch(console.error);
});

bot.login(config.token);
