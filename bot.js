const config = require('./config.js');
	Discord = require('discord.js'),
	music = require('./music.js'),
	apis = require('./apis.js'),
	translate = require('google-translate-api'),
	fs = require('fs'),
	S = require('string'),
	bot = new Discord.Client(),
	fica = '166226448598695936',
	keuhdall = '100335365998538752';

let adminRolesFile = fs.readFileSync('./adminRolesFile.json', 'utf8');
var commands = [];
	adminRoles = [],
	spamMembers = [],
	spamRoleTime = 15,
	spamLevel = 0,
	msgInterval = 1000,
	killConfirm = false;
var tmpMsg,
	isSpam;


//Miscelanous commands
commands['!siou']			= handleSiou;
commands['!member']			= handleMember;

//Utility commands
commands['!adminlist']		= handleAdminList;
commands['!help']			= handleHelp;
commands['!about']			= handleAbout;
commands['!reminder']		= handleReminder;
commands['!roll']			= handleRoll;
commands['!clean']			= handleClean;
commands['!msg']			= handleMsg;

//Translation commands
commands['!t']				= handleTranslate;

//Admin Commands
commands['!setadmin']		= handleSetAdmin;
commands['!kill']			= handleKill;

//Spam commands
commands['!spamlevel']		= handleSpamlevel;
commands['!spamtime']		= handleSpamtime;
commands['!msginterval']	= handleMsginterval;

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

/*
 Function that grants admin privileges for the bot.
 If no role is set ; anyone can use this command to set an admin role, otherwise, only a person belonging to the aforementioned admin role can set a new admin role.
 Command : !setadmin [role name]
 */
function handleSetAdmin(message) {
	if (!message.guild) return ;
	if (adminRoles[message.guild.id] && isAdmin(message)) return;
	let arg = patchArgs(message.content.split(" "), 1);
	let role = arg !== "" ? message.guild.roles.find('name', arg) : null;
	if (!arg) {
		message.channel.send('Erreur : pas de role précisé')
		return ;
	} else if (!role) {
		message.channel.send(`Erreur : ce rôle n'éxiste pas fdp`);
		return ;
	}
	if (!adminRoles[message.guild.id])
		adminRoles[message.guild.id] = [];
	adminRoles[message.guild.id].push(role);
	let roleNames = "";
	for (let i = 0; i < adminRoles[message.guild.id].length; i++) {
		roleNames += adminRoles[message.guild.id][i].name;
		if (i < adminRoles[message.guild.id].length - 1)
			roleNames += " ; ";
	}
	fs.writeFile('./adminRolesFile.json', JSON.stringify(adminRoles));
	message.channel.send(`le role ${arg} a été ajouté, les roles admins sont : ${roleNames}`);
}

/*
 Function that gives the list of the admin roles on the server.
 Command : !adminlist
*/
function handleAdminList(message) {
	if (!message.guild) return ;
	if (!adminRoles[message.guild.id]) {
		message.channel.send("Il n'y a pas encore de role pouvant administer le bot, vous pouvez en ajouter en utilisant la commande !setadmin [role]");
		return ;
	} else {
	let roleNames = "";
		for (let i = 0; i < adminRoles[message.guild.id].length; i++) {
			roleNames += adminRoles[message.guild.id][i].name;
			if (i < adminRoles[message.guild.id].length - 1)
				roleNames += " ; ";
		}
		message.channel.send(`Voici la liste des roles pouvant administer le bot : ${roleNames}`);
	}
}

/*
Function that print a help message with the description of the commands
Command : !help
*/
function handleHelp(message) {
	if (!message.guild) return;
	let cmdHelp = `Voici la liste des commandes :
- **!help** : affiche ce message
- **!about** : donne des informations sur le bot
- **!msg** : affiche le n-ieme message du channel
- **!clean** **[**_-c -t_**]** : permet de clean les derniers messages du channel courant. -c = count -t = time
- **!roll** **[**_nombre de lancés_**]**d**[**_taille du dé_**]** : permet de simuler un lancé de dés
- **!reminder** **[**_heure_**]** **[**_message_**]** : envoie un rappel contenant le message donné à l'heure donnée
- **!git** **[**_username_**]** : affiche le profil github d'un utilisateur donné
- **!cat** : affiche une image de chat trop mignon choisi au hasard
- **!join** : invite le bot dans votre channel vocal
- **!leave** : fait quitter le channel au bot
- **!play** **[**_lien youtube_**]** : fait jouer une musique au bot s\'il est dans un channel vocal`;

	message.channel.send(cmdHelp);
	if (isAdmin(message)) {
		message.author.send(`Psssst ! T'as aussi des commandes admin hyper swag !
- **!spamlevel** : permet de fixer le niveau de spam du serveur [0-3]
- **!spamtime** : permet de fixer le temps dans le groupe spammeur
- **!msginterval** : permet de fixer le temps minimum entre 2 messages (en ms ; uniquement actif pour un spamlevel >= 2)
- **!kill** : kill le bot`);
	}
}

function handleAbout(message) {
	message.channel.send(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas à me contacter pour plus de renseignements`);
}

function handleSiou(message) {
	let str = patchArgs(message.content.split(" "), 1);
	if (!str || str === "") return;
	message.channel.send(`Vous avez quoi contre ${str} ?`);
}

/*
Function that clean messages
Command : !clean [option] [number]
Options : -c -t (-t not implented yet)
*/
function handleClean(message) {
	if (!message.guild) return ;
	let authorizedRole;
	if (message.guild.name === "Potager")
		authorizedRole = message.guild.roles.find('name', 'Légume');
	let tab = message.content.split(" ");
	if (tab[1] === "-c" && tab[2] && !isNaN(tab[2])) {
		if (message.guild.name === "Potager" && !message.member.roles.has(authorizedRole.id)) {
			message.channel.send('Hep hep hep, t\'as pas le droit.');
			return ;
		}
		if (tab[2] > 50) tab[2] = 50;
		tab[2]++;
		message.channel.fetchMessages({limit : tab[2]})
		.then(messages => {
			message.channel.bulkDelete(messages);
			message.channel.send(`${tab[2] - 1} Messages effacés avec succès par ${message.author.username}.`);
		})
		.catch(console.error());
	}
	else if ( tab[1] === "-t" && tab[2] && !isNaN(tab[2]))
	{
		return ;//WIP
		if (!message.member.roles.has(authorizedRole.id)) {
			message.channel.send('Hep hep hep, t\'as pas le droit.');
			return ;
		}
		if (tab[2] > 30) tab[2] = 30;
		tab[2] *= 60000;
		let countMsg = 2;
		let tmpFetchMsg = message;
		while (tmpFetchMsg.createdTimestamp > message.createdTimestamp - tab[2])
		{
			console.log(tmpFetchMsg.content);
			message.channel.fetchMessages({limit : countMsg})
			.then(messages => {
				console.log('passe');
				process.exit(1);
				let tmpArray = new Array();
				tmpArray = messages.array();
				console.log('length : ' + tmpArray.length);
				tmpFetchMsg = tmpArray[tmpArray.length - 1];
			})
			.catch(console.error());
			++countMsg;
			console.log(countMsg);
		}
		message.channel.fetchMessages({limit : countMsg})
		.then(messages => {
			message.channel.bulkDelete(messages);
			message.channel.send(`${tab[2] - 1} Messages effacés avec succès par ${message.author.username}.`);
		})
		.catch(console.error());
		//message.delete();
	}
	else
		message.channel.send('Erreur de syntaxe dans la commande, tapez !help pour plus d\'informations');
}

/*
Function that will display the n-th message
Command : !msg [index of the message you zqnt to display]
*/
function handleMsg(message) {
	let tab = message.content.split(" ");
	if (!tab[1] || !message.guild) return ;
	tab[1]++;
	message.channel.fetchMessages({limit : tab[1]})
	.then(messages => {
		let msg = messages.array();
		message.channel.send(`${msg[tab[1] - 1].content}`);
	})
	.catch(console.error());
}

/*
Function that will print random numbers
Command : !roll [numbers of rolls]d[size of the dice]
*/
function handleRoll(message) {
	let tmp_cmd = message.content.split(' ');
	if (!tmp_cmd[1] || !message.guild) return ;
	let tmp_dice = tmp_cmd[1].split('d');
	let values = new Array();
	for (let i = 0; i < tmp_dice[0]; i ++)
		values.push(Math.floor(Math.random() * tmp_dice[1]) + 1);
	let str = 'Resultats : ';
	for (let j = 0; j < values.length; j++)
	{
		str += values[j];
		if (j != values.length - 1)
			str += ' ; ';
	}
	message.channel.send(`${str}`);
}

/*
 Function that allows an admin to change the tolerance level of the bot towards spam.
 Command : !spamlevel [level] (optionnal)
*/
function handleSpamlevel(message) {
	if (!message.guild) return ;
	let tab = message.content.split(" ");
	if (isAdmin(message))
	{
		if (!tab[1])
			message.channel.send(`Le niveau de spam est actuellement réglé à ${spamLevel}`);
		else {
			if (!isNaN(tab[1]) && tab[1] >= 0 && tab[1] <= 3) {
				spamLevel = tab[1];
				message.channel.send(`Le niveau de spam a bien été réglé à ${spamLevel}`);
			} else
				message.channel.send(`Erreur : le niveau de spam doit être réglé entre 0 et 3. ${tab[1]} n'est pas une valeur correcte`);
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

/*
 Function that will kill the bot. It'll have to be restarted through node.
 Command : !kill
*/
function handleKill(message) {
	if (!message.guild ) return ;
	if (!isAdmin(message)) {
		message.channel.send('LOL t\'as cru que t\'allais me shutdown ? Retourne jouer dans ton caca sale plébéien.');
		return ;
	}
	killConfirm = true;
	message.channel.send('Whoah, t\'es sûr de vouloir faire ça bro ?! [y/n]');
}

function checkConfirm(message)
{
	if (message.content === 'y' && killConfirm && isAdmin(message)) {
		message.channel.send('Ok boss, j\'y vais, à la prochaine !').
		then(msg => {
			bot.destroy();
		});
	} else if (message.content === 'n' && killConfirm && isAdmin(message)) {
		message.channel.send('Ouf, merci !');
		killConfirm = false;
	}
}

/*
 Function that allows an admin to edit the time in the spamRole
 Command : !spamtime [time] (optionnal)
*/
function handleSpamtime(message) {
	if (!message.guild) return ;
	let tab = message.content.split(" ");
	if (!isAdmin(message)) {
		message.channel.send('T\'as pas le droit.');
		return ;
	} else {
		if (tab[1]) {
			if (!isNaN(tab[1])) {
				spamRoleTime = tab[1];
				message.channel.send(`Le temps dans le groupe spammeur a été fixé à ${spamRoleTime} minute(s)`);
			} else
				message.channel.send('Erreur de syntaxe');
		} else
			message.channel.send(`Le temps dans le groupe spammeur est actuellement fixé à ${spamRoleTime} minute(s)`);
	}
}

/*
 Function that sets the meximum interval of time between 2 messages for the same author
 Command : !msginterval [interval] (optionnal)
*/
function handleMsginterval(message) {
	if (!message.guild) return ;
	let tab = message.content.split(" ");
	if (!isAdmin(message)) {
		message.channel.send('T\'as pas le droit.');
		return ;
	} else {
		if (!tab[1]) {
			message.channel.send(`L'interval entre 2 messages est actuellement fixé à ${msgInterval} millisecondes`);
		} else {
			if (!isNaN(tab[1])) {
				msgInterval = tab[1];
				message.channel.send(`L'interval entre 2 messages a été fixé à ${msgInterval} millisecondes`);
			} else
				message.channel.send('Erreur de syntaxe');
		}
	}
}

function checkReminder() {
	let currentTime =  new Date();
	for (let i = 0; i < reminder_tab.length; ++i) {
		if (reminder_tab[i].hours == currentTime.getHours() + 2 && reminder_tab[i].minutes == currentTime.getMinutes()) {
			reminder_tab[i].message.reply(`Hey, voici ton reminder : ${reminder_tab[i].content}`);
			reminder_tab.splice(i, 1);
		}
	}
}

var reminder_tab = new Array();
/*
 Function that will send a reminder to the author at the given time
 Command : !reminder [hours:minutes] ["message"]
*/
function handleReminder(message) {
	let tab = message.content.split(" ");
	let reminder_obj = new Object();
	if (message.guild) {
		if (tab[1]) {
			if (tab[2]) {
				let tab_time = tab[1].split(":");
				if (!tab_time[0] || !tab_time[1] || isNaN(tab_time[0]) || isNaN(tab_time[1]) || tab_time[0] < 0 || tab_time[0] > 23 || tab_time[1] < 0 || tab_time[1] > 59) {
					message.channel.send("Erreur : la date est mal formatée !");
					return;
				} else {
					let content = patchArgs(message.content.split(" "), 2);
					if (content !== "") {
						reminder_obj.message = message;
						reminder_obj.hours = tab_time[0];
						reminder_obj.minutes = tab_time[1];
						reminder_obj.content = content;
						reminder_tab.push(reminder_obj);
						message.channel.send(`Ok ! je t'enverrai une notification à ${reminder_obj.hours}:${reminder_obj.minutes} avec le contenu suivant : ${reminder_obj.content}`);
					} else {
						message.channel.send("Erreur : pas de contenu, ou alors le contenu est mal formaté (gros boulet)");
						return;
					}
				}
			} else {
				message.channel.send("Erreur : pas de message précisé");
				return;
			}
		} else {
			message.channel.send("Erreur : il n'y a pas de d'heure de précisé !");
			return;
		}
	}
}

function handleTranslate(message) {
	if (!message.guild) return;
	let tab = message.content.split(" ");
	if (!tab[1] || !tab[2]) {
		message.channel.send("Erreur de syntaxe");
		return;
	}
	let lang = tab[1].toLowerCase();
	let content = patchArgs(tab, 2);
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
		console.log('TODO');
		//message.react(bot.emojis.find('name', 'poop')).catch(console.error)
}

/*
 Function that prevent spam. Will chenge user's role and deprive him from his permissions.
*/
function handleSpam(message) {
	if (!message.guild || message.guild.name !== 'Potager') return ;
	if (message.author.id === bot.user.id || isAdmin(message)) return ;
	message.channel.fetchMessages({limit : 4})
	.then(messages => {
		let spamRole = Array();
		spamRole.push(message.guild.roles.find('name', 'Spammeur'));
		let msg = messages.array();
		let same = true;
		for (let i = 1; i < 4; i++) {
			if (message.content !== msg[i].content)
				same = false;
		}
		switch (parseInt(spamLevel))
		{
			case 0:
				break ;
			case 1:
				if (same === true) {
					let spammer = {member:message.member, time:0, oldRoles:message.member.roles};
					spamMembers.push(spammer);
					message.member.setRoles(spamRole);
					message.author.send(`T'en a pas marre de spam éspèce d'idiot ? Tu vas te calmer ${spamRoleTime} minute(s) avant de pouvoir parler à nouveau.`);
				}
				break ;
			case 2:
				if (same === true || isSpam === true) {
					let spammer = {member:message.member, time:0, oldRoles:message.member.roles};
					spamMembers.push(spammer);
					message.member.setRoles(spamRole);
					message.author.send(`T'en a pas marre de spam éspèce d'idiot ? Tu vas te calmer ${spamRoleTime} minute(s) avant de pouvoir parler à nouveau.`);
				}
				break ;
			case 3:
				if (same === true || isSpam === true || (message.content.length >=5 && getUppercasePercentage(message.content) >= 50)) {
					let spammer = {member:message.member, time:0, oldRoles:message.member.roles};
					spamMembers.push(spammer);
					message.member.setRoles(spamRole);
					message.author.send(`T'en a pas marre de spam éspèce d'idiot ? Tu vas te calmer ${spamRoleTime} minute(s) avant de pouvoir parler à nouveau.`);
				}
				break ;
			default:
				console.log('ERROR : the tolerance level has been set to a a wtong value');
				console.log(`Current tolerance level : ${spamLevel}`);
				break ;
		}
	}).catch(console.error());
}

/*
 Function called every minutes that will check if the members belonging to spamRole are able to recover their real role
*/
function checkSpam() {
	let potager = bot.guilds.find('name', 'Potager');
	let spamRole = [];
	if (!potager) return ;
	spamRole.push(potager.roles.find('name', 'Spammeur'));
	for (let i = 0; i < spamMembers.length; i++) {
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
	if (!message.guild) return;
	if (!adminRoles[message.guild.id])
		return false;
	for (let i = 0; i < adminRoles[message.guild.id].length; ++i) {
		if (message.member.roles.has(adminRoles[message.guild.id][i].id))
			return true;
	}
	return false;
}

function isAlpha(c) {
	return (/^[A-Z]$/i.test(c));
}

function patchArgs(args, index) {
	let str = "";
	for (let i = index; i < args.length; i++) {
		str += args[i];
		if (i != args.length - 1)
			str += " ";
	}
	return str;
}

/*
 Function that returns the percentage of uppercase character in a string
*/
function getUppercasePercentage (content) {
	let countUppercase = 0;
	for (let i = 0; i < content.length; i++) {
		if (content[i] === content[i].toUpperCase() && isAlpha(content[i]))
			countUppercase++;
	}
	return ((countUppercase / content.length) * 100);
}

function getTimeFormat(time) {
	let newTime = new Object;
	newTime.hours = time / 3600;
	newTime.hours = Math.trunc(newTime.hours);
	newTime.minutes = time / 60;
	newTime.minutes = Math.trunc(newTime.minutes);
	newTime.minutes %= 60;
	newTime.seconds = time % 3600;
	newTime.seconds %= 60;
	return (newTime);
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
	checkMessageTime(message);
	handleSpam(message);
	if (message.content === 'y' || message.content === 'n')
		checkConfirm(message);
	else if (message.author.id !== bot.user.id)
		killConfirm = false;
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

setInterval(checkSpam, 60000);
setInterval(checkReminder, 60000);
setInterval(checkYouKnowWho, 10000);
bot.login(config.token);
