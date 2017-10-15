const config = require('./config.js');
	Discord = require('discord.js'),
	shared = require('./shared.js'),
	tools = require('./tools.js'),
	utils = require('./utils.js'),
	admcmds = require('./admincommands.js'),
	spam = require('./spam.js'),
	music = require('./music.js'),
	apis = require('./apis.js'),
	translate = require('google-translate-api'),
	fs = require('fs'),
	bot = new Discord.Client(),
	fica = '166226448598695936',
	keuhdall = '100335365998538752';

let adminRolesFile = fs.readFileSync('./adminRolesFile.json', 'utf8');
var commands = [];

//Miscelanous commands
commands['!siou']			= handleSiou;
commands['!member']			= handleMember;

//Utility commands
commands['!adminlist']		= utils.handleAdminList;
commands['!help']			= utils.handleHelp;
commands['!about']			= utils.handleAbout;
commands['!reminder']		= utils.handleReminder;
commands['!roll']			= utils.handleRoll;
commands['!clean']			= utils.handleClean;
commands['!msg']			= utils.handleMsg;

//Translation commands
commands['!t']				= handleTranslate;

//Admin Commands
commands['!setadmin']		= admcmds.handleSetAdmin;
commands['!kill']			= admcmds.handleKill;

//Spam commands
commands['!spamlevel']		= spam.handleSpamlevel;
commands['!spamtime']		= spam.handleSpamtime;
commands['!msginterval']	= spam.handleMsginterval;

//Music commands
commands['!join']			= music.handleJoin;
commands['!leave']			= music.handleLeave;
commands['!play']			= music.handlePlay;
commands['!list']			= music.handleList;
commands['!skip']			= music.handleSkip;

//API commands
commands['!ub']				= apis.handleUb;
commands['!git']			= apis.handleGit;
commands['!cat']			= apis.handleCat;
commands['!quote']			= apis.handleQuote;
commands['!mal']			= apis.handleMal;

function handleSiou(message) {
	let str = tools.patchArgs(message.content.split(" "), 1);
	if (!str || str === "") return;
	message.channel.send(`Vous avez quoi contre ${str} ?`);
}

/*
 Function that allows me to recover my permissions if i mess to much with the bot
 Command : !member [only works with my ID ; you have to edit the code]
*/
function handleMember(message) {
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
	})
}

function handleTranslate(message) {
	if (!message.guild) return;
	let tab = message.content.split(" ");
	if (!tab[1] || !tab[2]) {
		message.channel.send("Erreur de syntaxe");
		return;
	}
	let lang = tab[1].toLowerCase();
	let content = tools.patchArgs(tab, 2);
	switch (lang) {
		case "en" : return doTranslate(lang, content, message);
		default : return message.channel.send("Désolé, mais je ne gère pas cette langue :/");
	}
}

function doTranslate(lang, content, message) {
	translate(content, {to : lang}).then(res => {
		message.channel.send(`**${message.author.username}** : ${res.text}`);
	});
}

/*
Function that will automatically add a reaction to the messages of certain members to troll them
*/
function handleReactions(message) {
	if (!message.guild) return ;
	if (message.author.id === fica)
		message.react('\:poultry_leg:');
		//console.log('TODO');
		//message.react(bot.emojis.find('name', 'poop')).catch(console.error)
}

function isAlpha(c) {
	return (/^[A-Z]$/i.test(c));
}

var status_old = "";
function checkYouKnowWho() {
	let server = bot.guilds.find('name', 'Le serveur des gens spéciaux');
	if (!server) return;
	let me = server.members.find('id', keuhdall)
	let youKnowWho = server.members.find('id', '332296552364376064');
	if (youKnowWho.presence.status !== status_old) {
		me.send(`Current status : ${youKnowWho.presence.status}`);
		status_old = youKnowWho.presence.status;
	}
}

bot.on("message", message => {
	handleReactions(message);
	spam.checkMessageTime(message);
	spam.handleSpam(message, bot);
	if (message.content === 'y' || message.content === 'n')
		admcmds.checkConfirm(message);
	else if (message.author.id !== bot.user.id)
		shared.killConfirm = false;
	let tab = message.content.split(' ');
	if (commands[tab[0]])
		commands[tab[0]](message, bot);
});

bot.on("ready", () => {
	bot.user.setGame('Down Nogord Simulator');
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", () => {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on('guildMemberAdd', member => {
	if (member.guild.name === 'Potager')
		member.guild.defaultChannel.send(`Hello <@${member.user.id}>, bienvenue sur le serveur Discord du Potager !.`);
	else if (member.guild.name === 'Le serveur des gens spéciaux')
		member.guild.defaultChannel.send(`Hello <@${member.user.id}>, bienvenue sur le serveur des gens spéciaux, petit special snowflake !.`);
});

bot.on('guildMemberRemove', member => {
	if (member.guild.name === 'Potager')
		member.guild.defaultChannel.send(`<@${member.user.id}> viens de quitter.`);
	else if (member.guild.name === 'Le serveur des gens spéciaux')
		member.guild.defaultChannel.send(`<@${member.user.id}> viens de nous quitter, il ne devait pas être assez spécial...`);
});

setInterval(() => {spam.checkSpam(bot)}, 60000);
setInterval(utils.checkReminder, 60000);
setInterval(checkYouKnowWho, 10000);
bot.login(config.token);
