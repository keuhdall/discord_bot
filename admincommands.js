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
        if (shared.adminRoles[message.guild.id] &&
            shared.adminRoles[message.guild.id].roles &&
            !tools.isAdmin(message)) return;
        let arg = tools.patchArgs(message.content.split(" "), 1);
        let role = arg !== "" ? message.guild.roles.find('name', arg) : null;
        if (!arg) {
            message.channel.send('Erreur : pas de role précisé');
            return ;
        } else if (!role) {
            message.channel.send(`Erreur : ce rôle n'éxiste pas fdp`);
            return ;
        }
        if (!shared.adminRoles[message.guild.id])
            shared.adminRoles[message.guild.id] = {};
        if (!shared.adminRoles[message.guild.id].roles)
            shared.adminRoles[message.guild.id].roles = [];
        shared.adminRoles[message.guild.id].roles.push(role);
        let roleNames = "";
        for (let i = 0; i < shared.adminRoles[message.guild.id].roles.length; i++) {
            roleNames += shared.adminRoles[message.guild.id].roles[i].name;
            if (i < shared.adminRoles[message.guild.id].roles.length - 1)
                roleNames += " ; ";
        }
        fs.writeFileSync('./adminRolesFile.json', JSON.stringify(shared.adminRoles));
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
        shared.killConfirm = true;
        message.channel.send('Whoah, t\'es sûr de vouloir faire ça bro ?! [y/n]');
    },

    checkConfirm : message => {
        if (message.content === 'y' && shared.killConfirm && tools.isAdmin(message)) {
            message.channel.send('Ok boss, j\'y vais, à la prochaine !').
            then(msg => {
                bot.destroy();
            });
        } else if (message.content === 'n' && shared.killConfirm && tools.isAdmin(message)) {
            message.channel.send('Ouf, merci !');
            shared.killConfirm = false;
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
    }
}