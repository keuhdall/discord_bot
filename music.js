

const tools = require('./tools.js'),
    ytdl = require('ytdl-core'),
    streamOptions = { seek: 0, volume: 1 };

let botVoiceChannel = null,
    botConnection = null,
    queue = [];

let dispatcher;

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
/*
 Function that makes the bot join your voice channel
 Command : !join
*/
    handleJoin : message => {
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
    },

/*
 Function that makes the bor play a song provided through a youtube link
 Command : !play [link]
*/
    handlePlay : (message, bot) => {
        let tmp = queue[0] ? true : false;
        let tab = message.content.split(' ');
        let music = {};
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
                    sendMusicEmbed(message, music, bot);
                else
                    message.channel.send(`\`${music.title}\` a été ajouté à la file par \`${music.author}\``)
            }).catch(console.error());
            if (!queue[0]) {
                const stream = ytdl(music.url, {filter : 'audioonly'});
                dispatcher = botConnection.playStream(stream, streamOptions);
            }
            queue.push(music);
        }
        message.delete();
    },

    dispatcher:on('end', (end) => {
        console.log(end);
        queue.shift();
        if (queue[0]) {
            sendMusicEmbed(message, queue[0], bot);
            stream = ytdl(queue[0].url, {filter : 'audioonly'});
            dispatcher = botConnection.playStream(stream, streamOptions);
        }
    }),

/*
 Function that makes the bot leave the voice channel he is currently in
 Command : !leave
*/
    handleLeave : message => {
        if (!botVoiceChannel)
            message.channel.send('Il faut que je soit dans un channel vocal pour utilier cette commande');
        else {
            botVoiceChannel.leave();
            botVoiceChannel = null;
            botConnection = null;
        }
    },

/*
 Function that returns the music currently in the queue 
 Command : !list
 */
    handleList : message => {
        let titles = queue.map((a) => {return a.title;});
        message.channel.send(`Il y a actuellement ${queue.length} musique(s) dans la queue. Les titres sont les suivant : ${titles}`);
    },

/*
 Function that skip the current playing song 
 Command : !skip
 */
    handleSkip : message => {
        if (queue[0] && dispatcher) {
            dispatcher.end();
        }
    }
}
