const shared = require('./shared.js'),
    tools = require('./tools.js');

module.exports = {
/*
 Function that grants admin privileges for the bot.
 If no role is set, anyone can use this command to set an admin role. Otherwise, only a person belonging to the aforementioned admin role can set a new admin role.
 Command : !setadmin [role name]
 */
    handleSetAdmin : message => {
        if (!message.guild) return ;
        if (shared.adminRoles[message.guild.id] && tools.isAdmin(message)) return;
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
            shared.adminRoles[message.guild.id] = [];
        shared.adminRoles[message.guild.id].push(role);
        let roleNames = "";
        for (let i = 0; i < shared.adminRoles[message.guild.id].length; i++) {
            roleNames += shared.adminRoles[message.guild.id][i].name;
            if (i < shared.adminRoles[message.guild.id].length - 1)
                roleNames += " ; ";
        }
        //fs.writeFile('./adminRolesFile.json', JSON.stringify(shared.adminRoles));
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

    handleNigger : message => {
        if (!message.guild) return ;
        let tab = message.content.split(" ");
        if (!tab[1]) {
            message.send("Il faut préciser le pseudo de la personne à changer en congoïde !");
            return ;
        }
        if (shared.niggerTab[tab[1]]) {
            delete shared.niggerTab[tab[1]];
            message.channel.send(`${tab[1]} n'est plus un congoïde`);
        } else {
            shared.niggerTab[message.author.username] = true;
            message.channel.send(`${tab[1]} est maintenant un congoïde`);
        }
    },

    checkNigger : message => {
        if (shared.niggerTab[message.author.username])
            message.content.replace("r", "w");
    }
}