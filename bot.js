const config = require('./config.js');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const bot = new Discord.Client();
const kraive = '94011401940504576';
const fica = '166226448598695936';
const keuhdall = '100335365998538752';
const navet = '94045969099792384';

var commands = [];
var spamMembers = [];
var spamRoleTime = 15;
var spamLevel = 0;
var msgInterval = 1000;
var killConfirm = false;
var tmpMsg;
var isSpam;

commands['!help']			= handleHelp;
commands['!about']			= handleAbout;
commands['!nogord']			= handleNogord;
commands['!clean']			= handleClean;
commands['!msg']			= handleMsg;
commands['!roll']			= handleRoll;
commands['!spamlevel']		= handleSpamlevel;
commands['!member']			= handleMember;
commands['!kill']			= handleKill;
commands['!spamtime']		= handleSpamtime;
commands['!msginterval']	= handleMsginterval;
commands['!join']			= handleJoin;
commands['!leave']			= handleLeave;
commands['!play']			= handlePlay;

/*
Function that print a help message with the description of the commands
Command : !help
*/
function handleHelp(message) {
	message.channel.sendMessage(`Voici la liste des commandes :\`\`\`
- !help : affiche ce message
- !about : donne des informations sur le bot
- !msg : affiche le n-ieme message du channel
- !clean [-c -t]: permet de clean les derniers messages	du channel courant. -c = count -t = time
- !roll [nombre de lancés]d[taille du dé]: permet de simuler un lancé de dés
- !nogord : met kraive en PLS\`\`\``);
}

function handleAbout(message) {
	message.channel.sendMessage(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas a me contacter pour plus de renseignements`);
}

function handleNogord(message) {
	message.channel.sendMessage(`Qui n'a pas down Nogord ? <@${kraive}>`);
}

/*
Function that clean messages
Command : !clean [option] [number]
Options : -c -t (-t not implented yet)
*/
function handleClean(message) {
	if (!message.guild) return ;
	let authorizedRole = message.guild.roles.find('name', 'Légume');
	var tab = message.content.split(" ");
	if (tab[1] === "-c" && tab[2] && !isNaN(tab[2])) {
		if (!message.member.roles.has(authorizedRole.id)) {
			message.channel.sendMessage('Hep hep hep, t\'as pas le droit.');
			return ;
		}
		if (tab[2] > 50) tab[2] = 50;
		tab[2]++;
		message.channel.fetchMessages({limit : tab[2]})
		.then(messages => {
			message.channel.bulkDelete(messages);
		})
		.catch(console.error());
		message.channel.sendMessage(`${tab[2] - 1} Messages effacés avec succès par ${message.author.username}.`);
	}
	else if ( tab[1] === "-t" && tab[2] && !isNaN(tab[2]))
	{
		if (!message.member.roles.has(authorizedRole.id)) {
			message.channel.sendMessage('Hep hep hep, t\'as pas le droit.');
			return ;
		}
		if (tab[2] > 30) tab[2] = 30;
		tab[2] *= 60000;
		console.log(message.channel.createdAt.toString());

		message.channel.fetchMessages({after : 1})
	}
	else
		message.channel.sendMessage('Erreur de syntaxe dans la commande, tapez !help pour plus d\'informations');
}

/*
Function that will display the n-th message
Command : !msg [index of the message you zqnt to display]
*/
function handleMsg(message) {
	var tab = message.content.split(" ");
	if (!tab[1] || !message.guild) return ;
	tab[1]++;
	message.channel.fetchMessages({limit : tab[1]})
	.then(messages => {
		var msg = messages.array();
		message.channel.sendMessage(`${msg[tab[1] - 1].content}`);
	})
	.catch(console.error());
}

/*
Function that will print random numbers
Command : !roll [numbers of rolls]d[size of the dice]
*/
function handleRoll(message) {
	var tmp_cmd = message.content.split(' ');
	if (!tmp_cmd[1] || !message.guild) return ;
	var tmp_dice = tmp_cmd[1].split('d');
	var values = new Array();
	for (var i = 0; i < tmp_dice[0]; i ++)
		values.push(Math.floor(Math.random() * tmp_dice[1]) + 1);
	var str = 'Resultats : ';
	for (var j = 0; j < values.length; j++)
	{
		str += values[j];
		if (j != values.length - 1)
			str += ' ; ';
	}
	message.channel.sendMessage(`${str}`);
}

/*
 Function that allows an admin to change the tolerance level of the bot towards spam.
 Command : !spamlevel [level] (optionnal)
*/
function handleSpamlevel(message) {
	if (!message.guild) return ;
	var tab = message.content.split(" ");
	if (isAdmin(message))
	{
		if (!tab[1])
			message.channel.sendMessage(`Le niveau de spam est actuellement réglé à ${spamLevel}`);
		else {
			if (!isNaN(tab[1]) && tab[1] >= 0 && tab[1] <= 3) {
				spamLevel = tab[1];
				message.channel.sendMessage(`Le niveau de spam a bien été réglé à ${spamLevel}`);
			} else
				message.channel.sendMessage(`Erreur : le niveau de spam doit être réglé entre 0 et 3. ${tab[1]} n'est pas une valeur correcte`);
		}
	}
}

/*
 Function that allows me to recover my permissions if i mess to much with the bot
 Command : !member [only works with my ID ; you have to edit the code]
*/
function handleMember(message) {
	let potager = bot.guilds.find('name', 'Potager');
	let vegetable = potager.roles.find('name', 'Légume');
	let memberKeuhdall = potager.fetchMember(message.author)
	.then(member => {
		let fairRole = Array();
		fairRole.push(vegetable);
		if (message.author.id === keuhdall)
			member.setRoles(fairRole);
	})
}

/*
 Function that will kill the bot. It'll have to be restarted through node.
 Command : !kill
*/
function handleKill(message) {
	if (!message.guild ) return ;
	if (!isAdmin(message)) {
		message.channel.sendMessage('LOL t\'as cru que t\'allais me shutdown ? Retourne jouer dans ton caca sale plébéien.');
		return ;
	}
	killConfirm = true;
	message.channel.sendMessage('Whoah, t\'es sûr de vouloir faire ça bro ?! [y/n]');
}

function checkConfirm(message)
{
	if (message.content === 'y' && killConfirm && isAdmin(message)) {
		message.channel.sendMessage('Ok boss, j\'y vais, à la prochaine !').
		then(msg => {
			bot.destroy();
		});
	} else if (message.content === 'n' && killConfirm && isAdmin(message)) {
		message.channel.sendMessage('Ouf, merci !');
		killConfirm = false;
	}
}

/*
 Function that allows an admin to edit the time in the spamRole
 Command : !spamtime [time] (optionnal)
*/
function handleSpamtime(message) {
	if (!message.guild) return ;
	var tab = message.content.split(" ");
	if (!isAdmin(message)) {
		message.channel.sendMessage('T\'as pas le droit.');
		return ;
	} else {
		if (tab[1]) {
			if (!isNaN(tab[1])) {
				spamRoleTime = tab[1];
				message.channel.sendMessage(`Le temps dans le groupe spammeur a été fixé à ${spamRoleTime} minute(s)`);
			} else
				message.channel.sendMessage('Erreur de syntaxe');
		} else
			message.channel.sendMessage(`Le temps dans le groupe spammeur est actuellement fixé à ${spamRoleTime} minute(s)`);
	}
}

/*
 Function that sets the meximum interval of time between 2 messages for the same author
 Command : !msginterval [interval] (optionnal)
*/
function handleMsginterval(message) {
	if (!message.guild) return ;
	var tab = message.content.split(" ");
	if (!isAdmin(message)) {
		message.channel.sendMessage('T\'as pas le droit.');
		return ;
	} else {
		if (!tab[1]) {
			message.channel.sendMessage(`L'interval entre 2 messages est actuellement fixé à ${msgInterval} millisecondes`);
		} else {
			if (!isNaN(tab[1])) {
				msgInterval = tab[1];
				message.channel.sendMessage(`L'interval entre 2 messages a été fixé à ${msgInterval} millisecondes`);
			} else
				message.channel.sendMessage('Erreur de syntaxe');
		}
	}
}

/*
Function that will automatically add a reaction to the messages of certain members to troll them
*/
function handleReactions(message) {
	if (!message.guild) return ;
	if (message.author.id === fica)
		console.log('TODO');
		//message.react(bot.emojis.find('name', 'poop')).catch(console.error)
	else if (message.author.id === kraive)
		message.react(message.guild.emojis.find('name', 'nogpls')).catch(console.error);
}

/*
 Function that prevent spam. Will chenge user's role and deprive him from his permissions.
*/
function handleSpam(message) {
	if (!message.guild) return ;
	if (message.author.id === bot.user.id || isAdmin(message)) return ;
	message.channel.fetchMessages({limit : 4})
	.then(messages => {
		let spamRole = Array();
		spamRole.push(message.guild.roles.find('name', 'Spammeur'));
		var msg = messages.array();
		var same = true;
		for (var i = 1; i < 4; i++) {
			if (message.content !== msg[i].content)
				same = false;
		}
		switch (parseInt(spamLevel))
		{
			case 0:
				break ;
			case 1:
				if (same === true) {
					var spammer = {member:message.member, time:0, oldRoles:message.member.roles};
					spamMembers.push(spammer);
					message.member.setRoles(spamRole);
					message.author.sendMessage(`T'en a pas marre de spam éspèce d'idiot ? Tu vas te calmer ${spamRoleTime} minute(s) avant de pouvoir parler à nouveau.`);
				}
				break ;
			case 2:
				if (same === true || isSpam === true) {
					var spammer = {member:message.member, time:0, oldRoles:message.member.roles};
					spamMembers.push(spammer);
					message.member.setRoles(spamRole);
					message.author.sendMessage(`T'en a pas marre de spam éspèce d'idiot ? Tu vas te calmer ${spamRoleTime} minute(s) avant de pouvoir parler à nouveau.`);
				}
				break ;
			case 3:
				if (same === true || isSpam === true || (message.content.length >=5 && getUppercasePercentage(message.content) >= 50)) {
					var spammer = {member:message.member, time:0, oldRoles:message.member.roles};
					spamMembers.push(spammer);
					message.member.setRoles(spamRole);
					message.author.sendMessage(`T'en a pas marre de spam éspèce d'idiot ? Tu vas te calmer ${spamRoleTime} minute(s) avant de pouvoir parler à nouveau.`);
				}
				break ;
			default:
				console.log('ERROR : the tolerance level has been set to a a wtong value');
				console.log(`Current tolerance level : ${spamLevel}`);
				break ;
		}
	}).catch(console.error());
}

var botVoiceChannel = null;
var botConnection = null;
/*
 Function that makes the bot join your voice channel
 Commamd : !join
*/
function handleJoin(message) {
	if (!message.guild) return ;
	if (!message.member.voiceChannel)
		message.channel.sendMessage('Vous devez d\'abord rejoindre un channel vocal pour utiliser cette commande');
	else {
		botVoiceChannel = message.member.voiceChannel;
		message.member.voiceChannel.join()
		.then(connection => {
			botConnection = connection;
		})
		.catch(console.error());
	}
}

/*
 Function that makes the bor play a song provided through a youtube link
 Command : !play [link]
 */
function handlePlay(message) {
	var tab = message.content.split(' ');
	if (!tab[1]) {
		message.channel.sendMessage('Il faut me passer un lien youtube !');
		return ;
	}
	if (!botConnection)
		message.channel.sendMessage('Il faut que je soit dans un channel vocal pour utilier cette commande');
	else {
		const stream = ytdl(tab[1], {filter : 'audioonly'});
		botConnection.playStream(stream, streamOptions);
	}
}

/*
 Function that makes the bot leave the voice channel he is currently in
 Command : !leave
*/
function handleLeave(message) {
	if (!botVoiceChannel)
		message.channel.sendMessage('Il faut que je soit dans un channel vocal pour utilier cette commande');
	else {
		botVoiceChannel.leave();
		botVoiceChannel = null;
		botConnection = null;
	}
}

/*
 Function called every minutes that will check if the members belonging to spamRole are able to recover their real role
*/
function checkSpam() {
	let potager = bot.guilds.find('name', 'Potager');
	let spamRole = [];
	spamRole.push(potager.roles.find('name', 'Spammeur'));
	for (var i = 0; i < spamMembers.length; i++) {
			spamMembers[i].time++;
		if (spamMembers[i].time > spamRoleTime) {
			spamMembers[i].member.setRoles(spamMembers[i].oldRoles);
			spamMembers.splice(i, 1);
		}
	}
}

/*
 Function that check if the user that issued a message is admin or not.
*/
function isAdmin(message) {
	let Moi = message.guild.roles.find('name', 'Moi');
	let Keukeu = message.guild.roles.find('name', 'Keukeu <3');
	if (message.member.roles.has(Moi.id) || message.member.roles.has(Keukeu.id))
		return true;
	else
		return false
}

function isAlpha(c) {
	return (/^[A-Z]$/i.test(c));
}

/*
 Function that returns the percentage of uppercase character in a string
*/
function getUppercasePercentage (content) {
	let countUppercase = 0;
	for (var i = 0; i < content.length; i++) {
		if (content[i] === content[i].toUpperCase() && isAlpha(content[i]))
			countUppercase++;
	}
	return ((countUppercase / content.length) * 100);
}

function checkMessageTime(message)
{
	if (!tmpMsg) {
		tmpMsg = message;
		isSpam = false;
		return ;
	}
	if (tmpMsg.author === message.author) {
		if (message.createdTimestamp - tmpMsg.createdTimestamp < msgInterval) {
			isSpam = true;
		} else {
			isSpam = false;
		}
	}
	tmpMsg = message;
}

bot.on("message", message => {
	handleReactions(message);
	checkMessageTime(message);
	handleSpam(message);
	if (message.content === 'y' || message.content === 'n')
		checkConfirm(message);
	else if (message.author.id !== bot.user.id)
		killConfirm = false;
	var tab = message.content.split(' ');
	if (commands[tab[0]])
		commands[tab[0]](message);
});

bot.on("ready", function () {
	bot.user.setGame('Présidentielles 2017');
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1);
});

bot.on('guildMemberAdd', ({user, guild}) => {
	guild.defaultChannel.sendMessage(`Hello <@${user.id}>, bienvenue sur le serveur Discord du Potager !.`);
});

bot.on('guildMemberRemove', ({user, guild}) => {
	guild.defaultChannel.sendMessage(`<@${user.id}> viens de quitter.`);
});

setInterval(checkSpam, 60000);
bot.login(config.token);
