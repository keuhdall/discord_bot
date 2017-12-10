const tools = require('./tools.js'),
    shared = require('./shared.js'),
    ytdl = require('ytdl-core');

let botVoiceChannel = null,
    botConnection = null;

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
        let tmp = (shared.musicQueues[message.guild.id] &&
            shared.musicQueues[message.guild.id].queue[0]) ? true : false;
        let tab = message.content.split(' ');
        let music = {};
        if (!tab[1]) {
            message.channel.send('Il faut me passer un lien youtube !');
            return ;
        } else if (!botConnection) {
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
        }).catch(console.error());
        if (!shared.musicQueues[message.guild.id])
            shared.musicQueues[message.guild.id] = { queue : [] };
        shared.musicQueues[message.guild.id].queue.push(music);
        tools.playMusic(botConnection, message);
        //message.delete();
    },

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
