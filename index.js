const Discord = require('discord.js');
const {
    prefix,
    token,
} = require('./config.json');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

// Music queue
const queue = new Map();

client.once('ready', () => {
    console.log('Ready!');
});

client.once('reconnecting', () => {
    console.log('Reconnecting');
});

client.once('disconnect', () => {
    console.log('Disconnect');
})

client.on('message', async message => {
    // Get music queue for this server
    const serverQueue = queue.get(message.guild.id);
    // Check if is a bot message 
    if (message.author.bot) return;
    // Check if the message starts with prefix
    if (!message.content.startsWith(prefix)) return;
    // Save command
    var command = message.content.split(" ",1);
    // Save all the content after command
    var args = message.content.split(command);

    if (command == `${prefix}ping`) {
        message.channel.send('Leite!');
    } else if (command == `${prefix}delete`) {
        message.delete();i
    } else if (command == `${prefix}say`) {
        var text = args[1].trim();
        message.channel.send(text);
    } else if (command == `${prefix}edit`) {
        var text = args[1].trim();
        // Guarda o id da mensagem na variável
        var mID = text.split(" ",1);
        // Guarda o texto que é suposto colocar na mensagem com id mID
        var editM = args[1].split(mID);
        // Recolhe a mensagem através do mID e edita a usando o conteudo da variavel editM
        message.channel.fetchMessage(mID).then(message1 => message1.edit(editM));
    } else if (command == `${prefix}help`) {
        const embedHelp = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setTitle('**Leite Helps You**')
            .addField(`${prefix}ping`,'Check your ping')
            .addField(`${prefix}delete`,'Nothing special, just delete your message')
            .addField(`${prefix}say`,'Use !say (message) and Leite will say your message')
            .addField(`${prefix}edit`,'Use !edit (message id) (new message) and Leite will edit his message to what you want.')
            .addField(`${prefix}help`,'Here you are my leite lover!');

        message.channel.send(embedHelp);
    } else if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	} else {
		message.channel.send('You need to enter a valid command!')
	}
})

async function execute(message, serverQueue) {
    // Save args
	const args = message.content.split(' ');
    // Save voice channel
    const voiceChannel = message.member.voiceChannel;
    // if member is not on a voice channel
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
    // Check if have permissions to enter the voice channel
    const permissions = voiceChannel.permissionsFor(message.client.user);
    // If not
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I cant fill your voice channel with milk.');
	}
    // Save Song info
    const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
    };
    
    // if queue is empty it initialize
	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
        };
        // Create entry for server on queue
        queue.set(message.guild.id, queueContruct);
        // put the song on it
        queueContruct.songs.push(song);
        // Try to play it
		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
        }
        // if queue already exists it adds the song
    } else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    // get the queue for this server
	const serverQueue = queue.get(guild.id);
    // leaves if it is empty
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token); // Usa o token do json para fazer login no bot