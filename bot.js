const config = require('./config.js');
	Discord = require('discord.js'),
	shared = require('./shared.js'),
	tools = require('./tools.js'),
	utils = require('./utils.js'),
	admcmds = require('./admincommands.js'),
	spam = require('./spam.js'),
	misc = require('./misc.js'),
	music = require('./music.js'),
	apis = require('./apis.js'),
	translate = require('./translate.js'),
	fs = require('fs'),
	bot = new Discord.Client(),
	fica = '166226448598695936',
	siu = '296175225517768705',
	keuhdall = '100335365998538752';

//let adminRolesFile = fs.readFileSync('./adminRolesFile.json', 'utf8');
let commands = [];

//Miscelanous commands
commands['!siu']			= misc.handleSiu;
commands['!wellan']			= misc.handleWellan;
commands['!lasergame']		= misc.handleLasergame;
commands['!member']			= misc.handleMember;

//Utility commands
commands['!adminlist']		= utils.handleAdminList;
commands['!help']			= utils.handleHelp;
commands['!about']			= utils.handleAbout;
commands['!reminder']		= utils.handleReminder;
commands['!roll']			= utils.handleRoll;
commands['!clean']			= utils.handleClean;
//commands['!msg']			= utils.handleMsg;

//Translation commands
commands['!t']				= translate.handleTranslate;
commands['!langlist']		= translate.handleLangList;

//Admin Commands
commands['!nigger']			= admcmds.handleNigger;
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
commands['!poll']			= apis.handlePoll;

/*
Function that will automatically add a reaction to the messages of certain members to troll them
*/
function handleReactions(message) {
	if (!message.guild) return ;
	//if (message.author.id === fica || message.author.id === siu)
	//	message.react('🍗');
}

bot.on("message", message => {
	handleReactions(message);
	spam.checkMessageTime(message);
	admcmds.checkNigger(message);
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
	bot.user.setActivity('Agneugneugneu');
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", () => {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on('guildMemberAdd', member => {
	console.log(`User ${member.nickname} joined server ${member.guild.nane}`);
});

bot.on('guildMemberRemove', member => {
	console.log (`User ${member.nickname} left server ${member.guild.name}`);
});

bot.on('error', e => console.error(e));

bot.on('warn', e => console.error(e));

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled promise rejection for " + promise + ". Reason : " + reason);
});

setInterval(() => {spam.checkSpam(bot)}, 60000);
setInterval(utils.checkReminder, 60000);
bot.login(config.token);
