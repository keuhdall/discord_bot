const shared = require('./shared.js'),
    ytdl = require('ytdl-core'),
    streamOptions = { seek: 0, volume: 1 };

let sendMusicEmbed = (message, music, bot) => {
    let time = {};
    time = tools.getTimeFormat(music.duration);
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
        let newTime = {};
        newTime.hours = time / 3600;
        newTime.hours = Math.trunc(newTime.hours);
        newTime.minutes = time / 60;
        newTime.minutes = Math.trunc(newTime.minutes);
        newTime.minutes %= 60;
        newTime.seconds = time % 3600;
        newTime.seconds %= 60;
        return (newTime);
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
    },

    playMusic : (connection, message) => {
        let server = shared.musicQueues[message.guild.id];
        let stream = ytdl(server.queue[0].url, {filter : 'audioonly'});
        sendMusicEmbed(message, server.queue[0], bot);
        server.dispatcher = connection.playStream(stream, streamOptions);
        server.queue.shift();
        server.dispatcher.on('end', (end) => {
            if (server.queue[0]) {
                playMusic(connection, message);
            }
        });
    }
}