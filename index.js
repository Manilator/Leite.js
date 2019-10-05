const Discord = require('discord.js');
const config = require("./config.json")
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {

    var command = message.content.split(" ",1);
    var all = message.content.split(command);

    if (command == '!ping') {
        message.channel.send('Leite!');
    }
    else if (command == '!delete') {
        message.delete();
    }
    else if (command == '!say') {
        var text = all[1].trim();
        message.channel.send(text);
    }
    else if (command == '!edit') {
        var text = all[1].trim();
        // Guarda o id da mensagem na variável
        var mID = text.split(" ",1);
        // Guarda o texto que é suposto colocar na mensagem com id mID
        var editM = all[1].split(mID);
        // Recolhe a mensagem através do mID e edita a usando o conteudo da variavel editM
        message.channel.fetchMessage(mID).then(message1 => message1.edit(editM));
    }
    else if (command == '!help') {
        const embedHelp = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setTitle('Leite Helps You')
            .addField('!ping','Check your ping')
            .addField('!delete','Nothing special, just delete your message')
            .addField('!say','Use !say (message) and Leite will say your message')
            .addField('!edit','Use !edit (message id) (new message) and Leite will edit his message to what you want.')
            .addField('!help','Here you are my leite lover!');
        
        message.channel.send(embedHelp);
    }
})

client.login(config.token);//BOT_TOKEN is the Client Secret
