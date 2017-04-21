const config = require('./config.js');
const Discord = require('discord.js');
const bot = new Discord.Client();
const kraive = '94011401940504576';
const fica = '166226448598695936';
const keuhdall = '100335365998538752';
const navet = '94045969099792384';
var spamMembers = [];
var spamRoleTime = 15;

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

/*
 Function called every minutes that will check if the members belonging to spamRole are able to recover their real role
 */
function checkSpam() {
	let potager = bot.guilds.find('name', 'Potager');
	let spamRole = [];
	spamRole.push(potager.roles.find('name', 'Spammeur de merde'));
	for (var i = 0; i < spamMembers.length; i++) {
			spamMembers[i].time++;
		if (spamMembers[i].time > spamRoleTime) {
			spamMembers[i].member.setRoles(spamMembers[i].oldRoles);
			spamMembers.splice(i, 1);
		}
	}
}

function isAdmin(message) {
	let Moi = message.guild.roles.find('name', 'Moi');
	let Keukeu = message.guild.roles.find('name', 'Keukeu <3');
	if (message.member.roles.has(Moi.id) || message.member.roles.has(Keukeu.id))
		return true;
	else
		return false
}

/*
Function that print a help message with the description of the commands
Command : !help
*/
bot.on("message", message => {
	if (!message.guild) return ;
	if (message.content === "!help")
		message.channel.sendMessage(`Voici la liste des commandes :\`\`\`
- !help : affiche ce message
- !about : donne des informations sur le bot
- !msg : affiche le n-ieme message du channel
- !clean [-c -t]: permet de clean les derniers messages	du channel courant. -c = count -t = time
- !roll [nombre de lancés]d[taille du dé]: permet de simuler un lancé de dés
- !nogord : met kraive en PLS\`\`\``);
	else if (message.content === "!about")
		message.channel.sendMessage(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas a me contacter pour plus de renseignements`);
	else if (message.content === "!nogord")
		message.channel.sendMessage(`Qui n'a pas down Nogord ? <@${kraive}>`);
});

/*
Function that clean messages
Command : !clean [option] [number]
Options : -c -t (-t not implented yet)
*/
bot.on("message", message => {
		if (!message.guild) return ;
		let authorizedRole = message.guild.roles.find('name', 'Légume');
		var tab = message.content.split(" ");
		if (tab[0] !== "!clean") return ;
		if (tab[1] === "-c" && tab[2]) {
			//if (message.author.id !== navet && message.author.id !== keuhdall) {
			if (!message.member.roles.has(authorizedRole.id)) {
				message.channel.sendMessage('Hep hep hep, t\'as pas les droits sale retard.');
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
		else if ( tab[1] === "-t" && tab[2])
		{
			if (!message.member.roles.has(authorizedRole.id)) {
				message.channel.sendMessage('Hep hep hep, t\'as pas les droits sale retard.');
				return ;
			}
			if (tab[2] > 30) tab[2] = 30;
			console.log(message.channel.createdAt.toString());
			//message.channel.fetchMessages({after : })
		
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
		if (tab[0] !== "!msg" || !tab[1] || !message.guild) return ;
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
	if (!message.guild) return ;
	if (message.author.id === fica)
		console.log('TODO');
		//message.react(bot.emojis.find('name', 'poop')).catch(console.error)
	else if (message.author.id === kraive)
		message.react(message.guild.emojis.find('name', 'nogpls')).catch(console.error);
});

/*
Function that will print random numbers
Command : !roll [numbers of rolls]d[size of the dice]
*/
bot.on("message", message => {
	var tmp_cmd = message.content.split(' ');
	if (tmp_cmd[0] !== '!roll' || !tmp_cmd[1] || !message.guild) return ;
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
});

/*
 Function that prevent spam. Will chenge user's role and deprive him from his permissions.
 */
bot.on("message", message => {
	if (!message.guild) return ;
	if (message.author.id === bot.user.id || isAdmin(message)) return ;
	message.channel.fetchMessages({limit : 4})
	.then(messages => {
		let spamRole = Array();
		spamRole.push(message.guild.roles.find('name', 'Spammeur de merde'));
		var msg = messages.array();
		var same = true;
		for (var i = 1; i < 4; i++) {
			if (message.content !== msg[i].content)
				same = false;
		}
		if (same === true) {
			var spammer = {member:message.member, time:0, oldRoles:message.member.roles};
			spamMembers.push(spammer);
			message.member.setRoles(spamRole);
			message.author.sendMessage('T\'en a pas marre de spam espèce de sous-race ? Continues comme ça et je te fout la PLS de ta vie batard !');
		}
	}).catch(console.error());
});

/*
 Function that allows me to recover my permissions is i mess to much with the bot
 Command : !member [only works with my ID ; you have to edit the code]
 */
bot.on("message", message => {
	let potager = bot.guilds.find('name', 'Potager');
	let vegetable = potager.roles.find('name', 'Légume');
	let memberKeuhdall = potager.fetchMember(message.author)
	.then(member => {
		let fairRole = Array();
		fairRole.push(vegetable);
		if (message.content === '!member' && message.author.id === keuhdall)
			member.setRoles(fairRole);
	})
});

/*
 Function that will kill the bot. It'll have to be restarted through node.
 Command : !kill
 */
var killConfirm = false;
bot.on("message", message => {
	if (!message.guild || message.author.id === bot.user.id) return ;
	if (message.content === '!kill') {
		if (!isAdmin(message)) {
			message.channel.sendMessage('LOL t\'as cru que t\'allais me shutdown ? Retourne jouer dans ton caca sale plébien.');
			return ;
		}
		killConfirm = true;
		message.channel.sendMessage('Whoah, t\' sûr de vouloir faire ça bro ?! [y/n]');
	} else if (message.content === 'y' && killConfirm && isAdmin(message)) {
		message.channel.sendMessage('Ok boss, j\'y vais, à la prochaine !').
		then(msg => {
			bot.destroy();
		});
	} else if (message.content === 'n' && killConfirm && isAdmin(message)) {
		message.channel.sendMessage('Ouf, merci !');
		killConfirm = false;
	} else {
		killConfirm = false;
		return ;
	}
});

/*
 Function that allows an admin to edit the time in the spamRole
 Command : !spamtime [option] [time (optionnal)]
 Options : -d (display) Will display the current spamRoleTime ; -e (edit) Will edit the current spamRoleTime with the one given.
 */
bot.on("message", message => {
	if (!message.guild) return ;
	var tab = message.content.split(" ");
	if (tab[0] === '!spamtime')
	{
		if (!isAdmin(message)) {
			message.channel.sendMessage('T\'as pas le droit. Dégage.');
			return ;
		} else {
			if (tab[1] === '-e') {
				if (tab[2]) {
					spamRoleTime = tab[2];
					message.channel.sendMessage(`Le temps dans le groupe spammeur a été fixé à ${spamRoleTime} minute(s)`);
				} else
					message.channel.sendMessage('T\'as oublié de préciser le nouveau temps, boss');
			} else if (tab[1] === '-d')
				message.channel.sendMessage(`Le temps dans le groupe spammeur est actuellement fixé à ${spamRoleTime} minute(s)`);
			else
				message.channel.sendMessage('Erreur de syntaxe');
		}
	}
});

setInterval(checkSpam, 60000);
bot.login(config.token);
