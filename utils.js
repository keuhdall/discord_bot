const shared = require('./shared.js'),
    tools = require('./tools.js');

let reminder_tab = [];

module.exports = {
/*
 Function that gives the list of the admin roles on the server.
 Command : !adminlist
*/
    handleAdminList : message => {
        if (!message.guild) return ;
        if (shared.adminRoles[tools.getIndex(message.guild.id) === -1]) {
            message.channel.send("Il n'y a pas encore de role pouvant administer le bot, vous pouvez en ajouter en utilisant la commande !setadmin [role]");
            return ;
        } else {
        let roleNames = "";
        let index = tools.getIndex(message.guild.id);
            for (let i = 0; i < shared.adminRoles[index].length; i++) {
                roleNames += shared.adminRoles[index].roles[i].name;
                if (i < shared.adminRoles[index].roles.length - 1)
                    roleNames += " ; ";
            }
            message.channel.send(`Voici la liste des roles pouvant administer le bot : ${roleNames}`);
        }
    },

/*
Function that print a help message with the description of the commands
Command : !help
*/
    handleHelp : message => {
        if (!message.guild) return;
        let cmdHelp = `Voici la liste des commandes :
    - **!help** : affiche ce message
    - **!about** : donne des informations sur le bot
    - **!msg** : affiche le n-ieme message du channel
    - **!clean** **[**_-c -t_**]** : permet de clean les derniers messages du channel courant. -c = count -t = time
    - **!roll** **[**_nombre de lancés_**]**d**[**_taille du dé_**]** : permet de simuler un lancé de dés
    - **!reminder** **[**_heure_**]** **[**_message_**]** : envoie un rappel contenant le message donné à l'heure donnée
    - **!ub** **[**_keywords_**]** : lance une recherche Urban Dictionnary
    - **!git** **[**_username_**]** : affiche le profil github d'un utilisateur donné
    - **!cat** : affiche une image de chat trop mignon choisi au hasard
    - **!quote** : affiche une citation au hasard
    - **!mal** **[**_anime_**]** : affiche des informations sur un anime
    - **!mal profile** **[**_profil_**]** : affiche des informations sur un profil MyAnimeList
    - **!join** : invite le bot dans votre channel vocal
    - **!leave** : fait quitter le channel au bot
    - **!play** **[**_lien youtube_**]** : fait jouer une musique au bot s\'il est dans un channel vocal
    - **!adminlist** : affiche la liste des roles pouvant utiliser les commandes admin du bot`;

        message.channel.send(cmdHelp);
        if (tools.isAdmin(message)) {
            message.author.send(`Psssst ! T'as aussi des commandes admin hyper swag !
    - **!spamlevel** : permet de fixer le niveau de spam du serveur [0-3]
    - **!spamtime** : permet de fixer le temps dans le groupe spammeur
    - **!msginterval** : permet de fixer le temps minimum entre 2 messages (en ms ; uniquement actif pour un spamlevel >= 2)
    - **!kill** : kill le bot
    - **!setadmin** **[**_role_**]** : permet à un role d'utiliser les commandes admins du bot
    - **!nigger** **[**_nickname_**]** : transforme une personne en congoïde`);
        }
    },

    handleAbout : message => {
        message.channel.send(`Bot fait avec amour par <@${keuhdall}>, n'hesitez pas à me contacter pour plus de renseignements`);
    },

/*
 Function that will send a reminder to the author at the given time
 Command : !reminder [hours:minutes] ["message"]
*/
    handleReminder : message => {
        let tab = message.content.split(" ");
        let reminder_obj = new Object();
        if (!message.guild) return ;
        if (!tab[1]) {
            message.channel.send("Erreur : il n'y a pas de d'heure de précisé !");
            return;
        } else if (!tab[2]) {
            message.channel.send("Erreur : pas de message précisé");
            return;
        }
        let tab_time = tab[1].split(":");
        if (!tab_time[0] || !tab_time[1] || isNaN(tab_time[0]) || isNaN(tab_time[1]) || tab_time[0] < 0 || tab_time[0] > 23 || tab_time[1] < 0 || tab_time[1] > 59) {
            message.channel.send("Erreur : la date est mal formatée !");
            return;
        } else {
            let content = tools.patchArgs(tab, 2);
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
    },

    checkReminder : () => {
        let currentTime =  new Date();
        for (let i = 0; i < reminder_tab.length; ++i) {
            if (reminder_tab[i].hours == currentTime.getHours() + 2 && reminder_tab[i].minutes == currentTime.getMinutes()) {
                reminder_tab[i].message.reply(`Hey, voici ton reminder : ${reminder_tab[i].content}`);
                reminder_tab.splice(i, 1);
            }
        }
    },

/*
Function that will print random numbers
Command : !roll [numbers of rolls]d[size of the dice]
*/
    handleRoll : message => {
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
    },

/*
Function that clean messages
Command : !clean [option] [number]
Options : -c -t (-t not implented yet)
*/
    handleClean : message => {
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
                    let tmpArray = [];
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
    },

/*
Function that will display the n-th message
Command : !msg [index of the message you zqnt to display]
*/
    handleMsg : message => {
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
}