const config = require('./config.js');
const Discord = require('discord.js');
const util = require('util');
const ytdl = require('ytdl-core');
const request = require('request');
const striptags = require('striptags');
const S = require('string');
const xml2js = require('xml2js');
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
var dispatcher;
var queue = [];

commands['!help']			= handleHelp;
commands['!about']			= handleAbout;
commands['!clean']			= handleClean;
commands['!msg']			= handleMsg;
commands['!roll']			= handleRoll;
commands['!spamlevel']		= handleSpamlevel;
commands['!member']			= handleMember;
commands['!kill']			= handleKill;
commands['!spamtime']		= handleSpamtime;
commands['!msginterval']	= handleMsginterval;
commands['!reminder']		= handleReminder;
commands['!join']			= handleJoin;
commands['!leave']			= handleLeave;
commands['!play']			= handlePlay;
commands['!list']			= handleList;
commands['!skip']			= handleSkip;
commands['!ub']				= handleUb;
commands['!git']			= handleGit;
commands['!cat']			= handleCat;
commands['!quote']			= handleQuote;
commands['!mal']			= handleMal;

/*
Function that print a help message with the description of the commands
Command : !help
*/
function handleHelp(message) {
	if (!message.guild) return;
	let cmdHelp = `Voici la liste des commandes :\`\`\`
- !help : affiche ce message
- !about : donne des informations sur le bot
- !msg : affiche le n-ieme message du channel
- !clean [-c -t]: permet de clean les derniers messages	du channel courant. -c = count -t = time
- !roll [nombre de lancés]d[taille du dé]: permet de simuler un lancé de dés
- !reminder [heure] ["message"]: envoie un rappel contenant le message donné à l'heure donnée
- !git [username]: affiche le profil github d'un utilisateur donné
- !cat : affiche une image de chat trop mignon choisi au hasard
- !join : invite le bot dans votre channel vocal
- !leave : fait quitter le channel au bot
- !play [lien youtube] fait jouer une musique au bot s\'il est dans un channel vocal`;
	cmdHelp += `\`\`\``;
	message.channel.send(cmdHelp);
	if (isAdmin(message)) {
		message.author.send(`Psssst ! T'as aussi des commandes admin hyper swag !\`\`\`
- !spamlevel : permet de fixer le niveau de spam du serveur [0-3]
- !spamtime : permet de fixer le temps dans le groupe spammeur
- !msginterval : permet de fixer le temps minimum entre 2 messages (en ms ; uniquement actif pour un spamlevel >= 2)
- !kill : kill le bot\`\`\``);
	}
}

function handleAbout(message) {
	message.channel.send(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas à me contacter pour plus de renseignements`);
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
					let tab_content = message.content.split("\"");
					if (tab_content[1]) {
						reminder_obj.message = message;
						reminder_obj.hours = tab_time[0];
						reminder_obj.minutes = tab_time[1];
						reminder_obj.content = tab_content[1];
						reminder_tab.push(reminder_obj);
						message.channel.send(`Ok ! je t'enverrai une notification à ${reminder_obj.hours}:${reminder_obj.minutes} avec le contenu suivant : ${reminder_obj.content}`);
					} else {
						message.channel.send("Erreur : le contenu du reminder doit être mis entre double quotes !");
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

var botVoiceChannel = null;
var botConnection = null;
/*
 Function that makes the bot join your voice channel
 Command : !join
*/
function handleJoin(message) {
	if (!message.guild) return ;
	if (!message.member.voiceChannel)
		message.channel.send('Vous devez d\'abord rejoindre un channel vocal pour utiliser cette commande');
	else {
		botVoiceChannel = message.member.voiceChannel;
		message.member.voiceChannel.join()
		.then(connection => {
			botConnection = connection;
		})
		.catch(console.error());
	}
}

function sendMusicEmbed(message, music) {
	let time = new Object();
	time = getTimeFormat(music.duration);
	message.channel.send('', {embed : {
		color: 65399,
		author: {
			name: `BOT ${message.guild.name} : MODE DJ`,
			icon_url: bot.user.avatarURL
		},
		title: 'Now playing :',
		fields: [{
			name: 'Titre : ',
			value: `${music.title}`
		}, {
			name: 'Durée :',
			value: `${time.hours} heures ${time.minutes} minutes et ${time.seconds} secondes`
		}, {
			name: 'Proposée par :',
			value: `${music.author}`
		}]
	}});
}

/*
 Function that makes the bor play a song provided through a youtube link
 Command : !play [link]
 */
function handlePlay(message) {
	let tmp = queue[0] ? true : false;
	let tab = message.content.split(' ');
	let music = new Object();
	if (!tab[1]) {
		message.channel.send('Il faut me passer un lien youtube !');
		return ;
	} else if (!botConnection) {
		message.channel.send('Il faut que je soit dans un channel vocal pour utilier cette commande');
		return ;
	} else {
		music.url = tab[1];
		music.author = message.author.username;
		ytdl.getInfo(tab[1])
		.then(info => {
			music.title = info.title;
			music.duration = info.length_seconds;
			if (!tmp)
				sendMusicEmbed(message, music);
			else
				message.channel.send(`\`${music.title}\` a été ajouté à la file par \`${music.author}\``)
		}).catch(console.error());
		if (!queue[0]) {
			const stream = ytdl(music.url, {filter : 'audioonly'});
			dispatcher = botConnection.playStream(stream, streamOptions);
		}
		queue.push(music);
		dispatcher.on('end', (end) => {
			console.log(end);
			queue.shift();
			if (queue[0]) {
				sendMusicEmbed(message, queue[0]);
				stream = ytdl(queue[0].url, {filter : 'audioonly'});
				dispatcher = botConnection.playStream(stream, streamOptions);
			}
		});
	}
	message.delete();
}

/*
 Function that makes the bot leave the voice channel he is currently in
 Command : !leave
*/
function handleLeave(message) {
	if (!botVoiceChannel)
		message.channel.send('Il faut que je soit dans un channel vocal pour utilier cette commande');
	else {
		botVoiceChannel.leave();
		botVoiceChannel = null;
		botConnection = null;
	}
}

function handleList(message) {
	let titles = queue.map((a) => {return a.title;});
	message.channel.send(`Il y a actuellement ${queue.length} musique(s) dans la queue. Les titres sont les suivant : ${titles}`);
}

function handleSkip(message) {
	if (queue[0] && dispatcher) {
		dispatcher.end();
	}
}

/*
 Function that will search the given keywords on urbandictionary
 Command : !ub ["your keywords here"]
*/
function handleUb(message) {
	if (!message.guild) return;
	let tab = message.content.split("\"");
	if (!tab[1]) {
		message.guild.send("Erreur de syntaxe");
		return;
	}
	let ub_url = "http://api.urbandictionary.com/v0/define?term=" + tab[1];
	let json_get;
	request.get(ub_url).on('data', data_get => {
		try {
			json_get = JSON.parse(data_get.toString());
		} catch (e) {
			console.error(e);
			return;
		}
		if (json_get.list[0])
			message.channel.send(`pemalink : ${json_get.list[0].permalink}`);
		else
			message.channel.send(`Oups ! Je n'ai rien trouvé pour le terme "${tab[1]}"`);
	});
}

/*
 Function that will display  the github profile of a given username
 Command : !git [uername]
*/
var tmp_json = "";
function handleGit(message) {
	if (!message.guild) return;
	let tab = message.content.split(" ");
	if (!tab[1]) {
		message.channel.send("Erreur de syntaxe, usage : !git [username]");
		return;
	}
	let git_url = "https://api.github.com/users/" + tab[1];
	let json_get;
	request.get({url: git_url, headers: {
		'User-Agent': 'keuhdall'}
	}).on('data', data_get => {
		try {
			if (!tmp_json)
				json_get = JSON.parse(data_get.toString());
			else {
				tmp_json += data_get.toString();
				json_get = JSON.parse(tmp_json);
			}
		} catch (e) {
			tmp_json += data_get.toString();
			return;
		}
		tmp_json = "";
		if (!json_get.login) {
			message.channel.send(`Erreur : il semble que l'utilisateur ${tab[1]} n'existe pas`);
			return;
		}
		message.channel.send('', {embed : {
			color: 65399,
			author: {
				name: `BOT ${message.guild.name} : GitHub assistant`,
				icon_url: json_get.avatar_url
			},
			title: `Profil de : ${json_get.name}`,
			url: json_get.html_url,
			fields: [{
				name: 'Description :',
				value: (json_get.bio ? json_get.bio : "Non précisé")
			},{
				name: 'Localisation :',
				value: (json_get.location ? json_get.location : "Non précisé")
			},{
				name: 'Company :',
				value: (json_get.company ? json_get.company : "Non précisé")
			}]
		}});
	});
}

/*
 Function that will send a random picture of a cute cat_url
 Command : !cat
*/
function handleCat(message) {
	if (!message.guild) return;
	let cat_url = "https://thecatapi.com/api/images/get?format=xml";
	request.get(cat_url).on('data', data_get => {
		let parse = xml2js.parseString;
		parse(data_get.toString(), (err, result) => {
			message.channel.send("Voici une une super image de chat trop mignon : " + result.response.data[0].images[0].image[0].url[0]);
		});
	});
}

function handleQuote(message) {
	if (!message.guild) return;
	//let quote_url = "http://quotesondesign.com/api/3.0/api-3.0.json";
	let quote_url = "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1"
	request.get(quote_url).on('data', data_get => {
		let json_get;
		try {
			json_get = JSON.parse(data_get.toString());
		} catch (e) {
			console.error(e);
			return;
		}
		message.channel.send(`${S((striptags(json_get[0].content))).unescapeHTML().s} - ${json_get[0].title}`);
	});
}

function handleMal(message) {
	if (!message.guild) return;
	let mal_url;
	let tab = message.content.split(' ');
	let search_type = 'anime';
	if (!tab[1]) {
		message.channel.send("Erreur : aucun argument précisé");
	} else if (tab[1] === "profil") {
		if (tab[2]) {
			mal_url = "https://myanimelist.net/malappinfo.php?u=" + tab[2];
			search_type = 'profile';
		} else {
			message.channel.send("Erreur : pas de profil précisé !");
			return ;
		}
	} else {
		mal_url = "https://myanimelist.net/api/anime/search.xml?q=" + tab[1];
	}
	request.get(mal_url, {
		'auth': {
			'user': config.mal_username,
			'pass': config.mal_password,
			'sendImmediately': false
		}
	}).on('data', data_get => {
		let parse = xml2js.parseString;
		parse(data_get.toString(), (err, result) => {
			if (search_type === 'anime')
			{
				message.channel.send(`${result.anime.entry.length} résultats trouvés. Meilleur résultat : `, {embed : {
					color: 65399,
					author: {
						name: `BOT ${message.guild.name} :  MyAnimeList assistant`,
						icon_url: `${result.anime.entry[0].image}`
					},
					title: result.anime.entry[0].english ? `${result.anime.entry[0].title} (title anglais : ${result.anime.entry[0].english})` :
															`${result.anime.entry[0].title} (title anglais : ${result.anime.entry[0].english})`,
					url: 'https://myanimelist.net/anime/' + result.anime.entry[0].id,
					fields: [{
						name: 'Episodes',
						value: `${result.anime.entry[0].episodes}`
					},{
						name: 'Score',
						value: `${result.anime.entry[0].score}`
					}]
				}});
				console.log(result.anime.entry[0]);
			} else {
				console.log(result);
			}
		})
	});
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
	if (!message.guild || message.guild.name !== 'Potager') return true;
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
	let me = server.members.find('id', keuhdall)
	if (!server) return;
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
		commands[tab[0]](message);
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
