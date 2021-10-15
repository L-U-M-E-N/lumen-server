import { Client } from 'discord.js';

global.discordClient = (typeof discordClient !== 'undefined') ? discordClient : new Client();
global.discordAdmin = (typeof discordAdmin !== 'undefined') ? discordAdmin : null;

export default class Discord {
	/**
	 * Connect to discord server, and listen messages
	 */
	static connect(callback) {
		discordClient.on('ready', async() => {
			log('Connected to discord server bot');
			discordClient.user.setActivity('Monitoring the world');

			discordClient.users.fetch(discordAdminId)
				.then(user => {
					discordAdmin = user;

					callback();
				});
		});

		discordClient.on('message', (message) => Discord.recievedMessage(message));

		discordClient.on('error', console.error);

		discordClient.login(discordBotToken);

		return discordClient;
	}

	static sendMessage(message, callback) {
		if(discordAdmin) {
			discordAdmin.send(message);
		}

		if(callback) {
			callback();
		}
	}
	static recievedMessage(message) {
		log('[Discord] ' + message.channel.recipient.username + ': ' + message.cleanContent);

		if(message.cleanContent.charAt(0) === '!') {
			Discord.sendCommand(message);
		}
	}

	static async sendCommand(message) {
		if(message.channel.id !== discordPMChannel) {
			return;
		}

		const words = message.cleanContent.split(' ');
		if(words[0] === '!pm') {
			const recipient = await discordClient.users.fetch(words[1]);

			if(!!recipient) {
				words.shift();
				words.shift();

				recipient.send(words.join(' '));
			}
		}
	}
}