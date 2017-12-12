const tools = require('./tools.js'),
    shared = require('./shared.js'),
    ytdl = require('ytdl-core'),
    streamOptions = { seek: 0, volume: 1 };

let botVoiceChannel = [],
    botConnection = [];

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

let playMusic = (connection, message) => {
    console.log('1');
    let server = shared.musicQueues[message.guild.id];
    sendMusicEmbed(message, server.queue[0], bot);
    if (!server.dispatcher)
        server.dispatcher = connection.playStream(ytdl(server.queue[0].url, {filter : 'audioonly'}), streamOptions);
    server.dispatcher.on('end', (end) => {
        console.log('2');
        server.dispatcher = null;
        server.queue.shift();
        if (server.queue[0]) {
            console.log('3');
            playMusic(connection, message);
        }
    });
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
            botVoiceChannel[message.guild.id] = message.member.voiceChannel;
            message.member.voiceChannel.join()
            .then(connection => {
                botConnection[message.guild.id] = connection;
            })
            .catch(console.error());
        }
    },

/*
 Function that makes the bor play a song provided through a youtube link
 Command : !play [link]
*/
    handlePlay : (message, bot) => {
        let tmp = (shared.musicQueues[message.guild.id] &&
            shared.musicQueues[message.guild.id].queue[0]) ? true : false;
        let tab = message.content.split(' ');
        let music = {};
        if (!tab[1]) {
            message.channel.send('Il faut me passer un lien youtube !');
            return ;
        } else if (!botConnection[message.guild.id]) {
            message.channel.send('Il faut que je soit dans un channel vocal pour utilier cette commande');
            return ;
        }
        music.url = tab[1];
        music.author = message.author.username;
        ytdl.getInfo(tab[1])
        .then(info => {
            music.title = info.title;
            music.duration = info.length_seconds;
            if (tmp)
                message.channel.send(`\`${music.title}\` a été ajouté à la file par \`${music.author}\``)
            if (!shared.musicQueues[message.guild.id])
                shared.musicQueues[message.guild.id] = { queue : [] };
            shared.musicQueues[message.guild.id].queue.push(music);
            if (!shared.musicQueues[message.guild.id].dispatcher)
                playMusic(botConnection[message.guild.id], message);
        }).catch(console.error());
        //message.delete();
    },

/*
 Function that makes the bot leave the voice channel he is currently in
 Command : !leave
*/
    handleLeave : message => {
        if (!botVoiceChannel[message.guild.id])
            message.channel.send('Il faut que je soit dans un channel vocal pour utilier cette commande');
        else {
            botVoiceChannel[message.guild.id].leave();
            delete botVoiceChannel[message.guild.id];
            delete botConnection[message.guild.id];
        }
    },

/*
 Function that returns the music currently in the queue 
 Command : !list
 */
    handleList : message => {
        let server = shared.musicQueues[message.guild.id];
        let titles = server.queue.map((a) => {return a.title;});
        message.channel.send(`Il y a actuellement ${server.queue.length} musique(s) dans la queue. Les titres sont les suivant : ${titles}`);
    },

/*
 Function that skip the current playing song 
 Command : !skip
 */
    handleSkip : message => {
        if (shared.musicQueues[message.guild.id].dispatcher)
            shared.musicQueues[message.guild.id].dispatcher.end();
    }
}
