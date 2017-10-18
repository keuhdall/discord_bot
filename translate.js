const shared = require('./shared.js'),
	tools = require('./tools.js'),
	translate = require('google-translate-api');

let lanList = ["en", "es", "de", "pt"];

module.exports = {
/*
 Function that will translate a sentence from a language to another.
 Command : !t [lang] [content to translate] 
 */
	handleTranslate : message => {
		if (!message.guild) return;
		let tab = message.content.split(" ");
		if (!tab[1] || !tab[2]) {
			message.channel.send("Erreur de syntaxe");
			return;
		}
		let lang = tab[1].toLowerCase();
		let content = tools.patchArgs(tab, 2);
		switch (lang) {
			case "en": return doTranslate(lang, content, message);
			case "es": return doTranslate(lang, content, message);
			case "de": return doTranslate(lang, content, message);
			case "pt": return doTranslate(lang, content, message);
			default: return message.channel.send("Désolé, mais je ne gère pas cette langue :/");
		}
	},

	doTranslate: (lang, content, message) => {
		translate(content, { to: lang }).then(res => {
			message.channel.send(`**${message.author.username}** : ${res.text}`);
		});
	},

/*
 Function that displays the languages supported by the bot.
 Command : !langlist
 */
	handleLangList : message => {
		if (!message.guild) return;
		let langList_s = "";
		for (let i = 0; i < lanList.length; i++) {
			langList_s += ("**" + lanList[i] + "**");
			if (i != langList.length - 1)
				langList_s += "\n";
		}
		message.channel.send(`Les langues supportées sont les suivantes :
		${langList_s}`);
	}
}