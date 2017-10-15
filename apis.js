const config = require('./config.js'),
    tools = require('./tools.js'),
    request = require('request'),
    xml2js = require('xml2js'),
    striptags = require('striptags');

var tmp_json = "";

module.exports = {
/*
Function that will search the given keywords on urbandictionary
Command : !ub ["your keywords here"]
*/
    handleUb : (message) => {
        if (!message.guild) return;
        let tab = message.content.split("\"");
        if (!tab[1]) {
            message.guild.send("Erreur de syntaxe");
            return;
        }
        let ub_url = "http://api.urbandictionary.com/v0/define?term=" + tab[1];
        let json_get;
        request.get(ub_url).on('data', data_get => {
            try {
                json_get = JSON.parse(data_get.toString());
            } catch (e) {
                console.error(e);
                return;
            }
            if (json_get.list[0])
                message.channel.send(`pemalink : ${json_get.list[0].permalink}`);
            else
                message.channel.send(`Oups ! Je n'ai rien trouvé pour le terme "${tab[1]}"`);
        });
    },

/*
Function that will display  the github profile of a given username
Command : !git [username]
*/
    handleGit : (message) => {
        if (!message.guild) return;
        let tab = message.content.split(" ");
        if (!tab[1]) {
            message.channel.send("Erreur de syntaxe, usage : !git [username]");
            return;
        }
        let git_url = "https://api.github.com/users/" + tab[1];
        let json_get;
        request.get({url: git_url, headers: {
            'User-Agent': 'keuhdall'}
        }).on('data', data_get => {
            try {
                if (!tmp_json)
                    json_get = JSON.parse(data_get.toString());
                else {
                    tmp_json += data_get.toString();
                    json_get = JSON.parse(tmp_json);
                }
            } catch (e) {
                tmp_json += data_get.toString();
                return;
            }
            tmp_json = "";
            if (!json_get.login) {
                message.channel.send(`Erreur : il semble que l'utilisateur ${tab[1]} n'existe pas`);
                return;
            }
            message.channel.send('', {embed : {
                color: 65399,
                author: {
                    name: `BOT ${message.guild.name} : GitHub assistant`,
                    icon_url: json_get.avatar_url
                },
                title: `Profil de : ${json_get.name}`,
                url: json_get.html_url,
                fields: [{
                    name: 'Description :',
                    value: (json_get.bio ? json_get.bio : "Non précisé")
                },{
                    name: 'Localisation :',
                    value: (json_get.location ? json_get.location : "Non précisé")
                },{
                    name: 'Company :',
                    value: (json_get.company ? json_get.company : "Non précisé")
                }]
            }});
        });
    },

/*
Function that will send a random picture of a cute cat_url
Command : !cat
*/
    handleCat : (message) => {
        if (!message.guild) return;
        let cat_url = "https://thecatapi.com/api/images/get?format=xml";
        request.get(cat_url).on('data', data_get => {
            let parse = xml2js.parseString;
            parse(data_get.toString(), (err, result) => {
                message.channel.send("Voici une une super image de chat trop mignon : " + result.response.data[0].images[0].image[0].url[0]);
            });
        });
    },

    handleQuote : (message) => {
        if (!message.guild) return;
        //let quote_url = "http://quotesondesign.com/api/3.0/api-3.0.json";
        let quote_url = "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1"
        request.get(quote_url).on('data', data_get => {
            let json_get;
            try {
                json_get = JSON.parse(data_get.toString());
            } catch (e) {
                console.error(e);
                return;
            }
            message.channel.send(`${S((striptags(json_get[0].content))).unescapeHTML().s} - ${json_get[0].title}`);
        });
    },

    handleMal : (message, bot) => {
        if (!message.guild) return;
        let mal_url;
        let tab = message.content.split(' ');
        let search_type = 'anime';
        if (!tab[1]) {
            message.channel.send("Erreur : aucun argument précisé");
        } else if (tab[1] === "profil") {
            if (tab[2]) {
                mal_url = "https://myanimelist.net/malappinfo.php?u=" + tools.patchArgs(tab, 2).replace(" ", "+");
                search_type = 'profile';
            } else {
                message.channel.send("Erreur : pas de profil précisé !");
                return ;
            }
        } else {
            mal_url = "https://myanimelist.net/api/anime/search.xml?q=" + tools.patchArgs(tab, 1).replace(" ", "+");
        }
        request.get(mal_url, {
            'auth': {
                'user': config.mal_username,
                'pass': config.mal_password,
                'sendImmediately': false
            }
        }).on('data', data_get => {
            let parse = xml2js.parseString;
            parse(data_get.toString(), (err, result) => {
                if (search_type === 'anime')
                {
                    message.channel.send(`${result.anime.entry.length} résultats trouvés. Meilleur résultat : `, {embed : {
                        color: 65399,
                        author: {
                            name: `BOT ${message.guild.name} :  MyAnimeList assistant`,
                            icon_url: `${result.anime.entry[0].image}`
                        },
                        title: result.anime.entry[0].english ? `${result.anime.entry[0].title} (title anglais : ${result.anime.entry[0].english})` :
                                                                `${result.anime.entry[0].title} (title anglais : ${result.anime.entry[0].english})`,
                        url: 'https://myanimelist.net/anime/' + result.anime.entry[0].id,
                        fields: [{
                            name: 'Episodes',
                            value: `${result.anime.entry[0].episodes}`,
                            inline: true
                        },{
                            name: 'Score',
                            value: `${result.anime.entry[0].score}`,
                            inline: true
                        }]
                    }});
                    console.log(result.anime.entry[0]);
                } else {
                    if (!result.myinfo) {
                        message.channel.send("Erreur : pas de profil trouvé !");
                        return ;
                    }
                    message.channel.send(`Voici le profil de ${result.myinfo.user_name}`, {embed : {
                        color: 65399,
                        author: {
                            name: `BOT ${message.guild.name} : MyAnimeList assistant`,
                            icon_url: bot.user.avatarURL
                        },
                        title: `Profil de : ${result.myinfo.user_name}`,
                        url: 'https://myanimelist.net/animelist' + result.myinfo.user_name,
                        fields: [{
                            name: 'Animes en cours :',
                            value: `{result.myinfo.user_watching}`,
                        },{
                            name: 'Animes terminés :',
                            value: `${result.myinfo.user_completed}`,
                            inline: true
                        },{
                            name: 'Animes en pause :',
                            value: `${result.myinfo.user_onhold}`,
                        },{
                            name: 'Animes abandonnés :',
                            value: `${result.myinfo.user_dropped}`,
                            inline: true
                        },{
                            name: 'Animes à regarder :',
                            value: `${result.myinfo.user_plantowatch}`
                        },{
                            name: 'Jours passés à regarder des animes :',
                            value: `${result.myinfo.user_days_spent_watching}`
                        }]
                    }});
                    console.log(result);
                }
            });
        });
    }
}