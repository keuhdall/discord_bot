const shared = require('./shared.js'),
    tools = require('./tools.js'),
    fs = require('fs');

module.exports = {
/*
 Function that grants admin privileges for the bot.
 If no role is set, anyone can use this command to set an admin role. Otherwise, only a person belonging to the aforementioned admin role can set a new admin role.
 Command : !setadmin [role name]
 */
    handleSetAdmin : message => {
        if (!message.guild) return ;
        if (tools.getIndex(message.guild.id) !== -1 &&
            !tools.isAdmin(message)) return ;
        let arg = tools.patchArgs(message.content.split(" "), 1);
        let role = arg !== "" ? message.guild.roles.find('name', arg) : null;
        if (!arg) {
            message.channel.send('Erreur : pas de role précisé');
            return ;
        } else if (!role) {
            message.channel.send(`Erreur : ce rôle n'éxiste pas fdp`);
            return ;
        }
        if (tools.getIndex(message.guild.id) === -1) {
            shared.adminRoles.push({
                id: message.guild.id,
                roles: [role]
            });
        } else {
            let curr_roles = tools.getRoles(message.guild.id);
            curr_roles.push(role);
            shared.adminRoles[tools.getIndex(message.guild.id)] = {
                id : message.guild.id,
                roles: curr_roles
            }
        }
        let roleNames = "",
            index = tools.getIndex(message.guild.id);
        if (index === -1) return;
        for (let i = 0; i < shared.adminRoles[index].roles.length; i++) {
            roleNames += shared.adminRoles[index].roles[i].name;
            if (i < shared.adminRoles[index].roles.length - 1)
                roleNames += " ; ";
        }
        fs.writeFileSync('./adminlist.json', JSON.stringify(shared.adminRoles));
        message.channel.send(`le role ${arg} a été ajouté, les roles admins sont : ${roleNames}`);
    },

/*
 Function that will kill the bot. It'll have to be restarted through node.
 Command : !kill
*/
    handleKill : message => {
        if (!message.guild ) return ;
        if (!tools.isAdmin(message)) {
            message.channel.send('LOL t\'as cru que t\'allais me shutdown ? Retourne jouer dans ton caca sale plébéien.');
            return ;
        }
        shared.killConfirm[message.guild.id] = message.author.id;
        message.channel.send('Whoah, t\'es sûr de vouloir faire ça bro ?! [y/n]');
    },

    checkConfirm : message => {
        if (message.content === 'y' &&
            shared.killConfirm[message.guild.id] &&
            shared.killConfirm[message.guild.id] === message.author.id) {
            message.channel.send('Ok boss, j\'y vais, à la prochaine !')
            .then(msg => {
                bot.destroy();
            });
        } else if (message.content === 'n' &&
            shared.killConfirm[message.guild.id] &&
            shared.killConfirm[message.guild.id] === message.author.id) {
            message.channel.send('Ouf, merci !');
            delete shared.killConfirm[message.guild.id];
        }
    },

/*
 Function that will replace all "r"s by "w"s (just for fun)
 Command : !nigger [username]
 */
    handleNigger : message => {
        if (!message.guild) return ;
        if (!tools.isAdmin(message)) {
            message.channel.send("Désolé mais tu n'es pas digne d'utiliser cette commande jeune congoïde cosmopolite pharisien");
            return ;
        }
        let name = tools.patchArgs(message.content.split(" "), 1);
        if (!name || name === "") {
            message.send("Il faut préciser le pseudo de la personne à changer en congoïde !");
            return ;
        } else if (name === "LE KEUHDALLBOT MAGGLE") {
            message.channel.send("PERSONNE ne peut me changer en congoïde, PERSONNE !!!");
            return ;
        }
        if (shared.niggerTab[name]) {
            delete shared.niggerTab[name];
            message.channel.send(`${name} n'est plus un congoïde`);
        } else {
            shared.niggerTab[name] = true;
            message.channel.send(`${name} est maintenant un congoïde`);
        }
    },

    checkNigger : message => {
        if (shared.niggerTab[message.author.username]) {
            let content = message.content.replace(/r/g, "w").replace(/R/g, "W");
            message.channel.send(`**${message.author.username}** : ${content}`);
            message.delete();
        }
    },

    broadcastMessage : (bot, content) => {
        for (guild in bot.guilds) {
            bot.guilds[guild].defaultChannel.send(content);
        }
    }
}