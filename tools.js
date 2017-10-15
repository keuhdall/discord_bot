module.exports = {
/*
Function that check if the user that issued a message is admin or not.
*/
    isAdmin : (message, adminRoles) => {
        if (!message.guild) return;
        if (!adminRoles[message.guild.id])
            return false;
        for (let i = 0; i < adminRoles[message.guild.id].length; ++i) {
            if (message.member.roles.has(adminRoles[message.guild.id][i].id))
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

    getTimeFormat : time => {
        let newTime = new Object;
        newTime.hours = time / 3600;
        newTime.hours = Math.trunc(newTime.hours);
        newTime.minutes = time / 60;
        newTime.minutes = Math.trunc(newTime.minutes);
        newTime.minutes %= 60;
        newTime.seconds = time % 3600;
        newTime.seconds %= 60;
        return (newTime);
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