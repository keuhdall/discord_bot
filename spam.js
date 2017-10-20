const tools = require('./tools.js');

let spamMembers = [],
    spamRoleTime = 15,
    spamLevel = 0,
    msgInterval = 1000;

let tmpMsg,
	isSpam;

module.exports = {
/*
Function that allows an admin to change the tolerance level of the bot towards spam.
Command : !spamlevel [level] (optionnal)
*/
    handleSpamlevel : message => {
        if (!message.guild) return ;
        let tab = message.content.split(" ");
        if (tools.isAdmin(message))
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
    },

/*
Function that allows an admin to edit the time in the spamRole
Command : !spamtime [time] (optionnal)
*/
    handleSpamtime : message => {
        if (!message.guild) return ;
        let tab = message.content.split(" ");
        if (!tools.isAdmin(message)) {
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
    },

/*
Function that sets the meximum interval of time between 2 messages for the same author
Command : !msginterval [interval] (optionnal)
*/
    handleMsginterval : message => {
        if (!message.guild) return ;
        let tab = message.content.split(" ");
        if (!tools.isAdmin(message)) {
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
    },

/*
 Function called every minutes that will check if the members belonging to spamRole are able to recover their real role
*/
    checkSpam : bot => {
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
    },

/*
 Function that prevent spam. Will chenge user's role and deprive him from his permissions.
*/
    handleSpam : (message, bot) => {
        if (!message.guild || message.guild.name !== 'Potager') return ;
        if (message.author.id === bot.user.id || tools.isAdmin(message)) return ;
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
                    if (same === true || isSpam === true || (message.content.length >=5 && tools.getUppercasePercentage(message.content) >= 50)) {
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
    },

    checkMessageTime : message => {
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
}