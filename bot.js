const Discord = require('discord.js');
const config = require("./config.json")
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {

    var command = message.content.split(" ",1);
    var all = message.content.split(command);
    var text = all[1].trim();

    if (command == '!ping') {
        message.channel.send('Leite!');
    }
    else if (command == '!delete') {
        message.delete();
    }
    else if (command == '!say') {
        message.channel.send(text);
    }
    else if (command == '!edit') {
        // Guarda o id da mensagem na variável
        var mID = text.split(" ",1);
        // Guarda o texto que é suposto colocar na mensagem com id mID
        var editM = all[1].split(mID);
        // Recolhe a mensagem através do mID e edita a usando o conteudo da variavel editM
        message.channel.fetchMessage(mID).then(message1 => message1.edit(editM));
    }
})

client.login(config.token);//BOT_TOKEN is the Client Secret
