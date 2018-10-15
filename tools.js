const shared = require('./shared.js');

module.exports = {
    getRoles : id => {
        for (let i = 0; i < shared.adminRoles.length; i++) {
            if (shared.adminRoles[i].id === id)
                return shared.adminRoles[i].roles;
        }
        return null;
    },

    getIndex : id => {
        for (let i = 0; i < shared.adminRoles.length; i++) {
            if (shared.adminRoles[i].id === id)
                return i;
        }
        return -1;
    },

/*
Function that check if the user that issued a message is admin or not.
*/
    isAdmin : message => {
        if (!message.guild) return;
        let index = tools.getIndex(message.guild.id);
        if (index === -1)
            return false;
        for (let i = 0; i < shared.adminRoles[index].roles.length; ++i) {
            if (message.member.roles.has(shared.adminRoles[index].roles[i].id))
                return true;
        }
        return false;
    },

/*
 Function that returns the percentage of uppercase character in a string
*/
    getUppercasePercentage : content => {
        let countUppercase = 0;
        for (let i = 0; i < content.length; i++) {
            if (content[i] === content[i].toUpperCase() && isAlpha(content[i]))
                countUppercase++;
        }
        return ((countUppercase / content.length) * 100);
    },

/*
 Function that takes a timestamp as parameter and returns an object comtaining the hours, minutes and seconds of that timestamp
 */
    getTimeFormat : time => {
        return {
            'hours'     : Math.trunc(time / 3600),
            'minutes'   : Math.trunc(time / 60) % 60,
            'seconds'   : (time % 3600) % 60
        };
    },

    isAlpha : c => {
        return (/^[A-Z]$/i.test(c));
    },

    patchArgs : (args, index) => {
        let str = "";
        for (let i = index; i < args.length; i++) {
            str += args[i];
            if (i != args.length - 1)
                str += " ";
        }
        return str;
    }
}