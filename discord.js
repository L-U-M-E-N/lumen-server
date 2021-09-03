global.discordClient = (typeof discordClient !== 'undefined') ? discordClient : new (require('discord.js')).Client();
global.discordAdmin = (typeof discordAdmin !== 'undefined') ? discordAdmin : null;

module.exports = {
	/**
	 * Connect to discord server, and listen messages
	 */
	connect: (callback) => {
		discordClient.on('ready', () => {
			log('Connected to discord server bot');
			discordClient.user.setActivity('Monitoring the world');

			discordClient.fetchUser(discordAdminId)
				.then(user => {
					discordAdmin = user;

					callback();
				});
		});

		discordClient.on('message', (message) => Discord.recievedMessage(message));

		discordClient.on('error', console.error);

		discordClient.login(discordBotToken);

		return discordClient;
	},

	sendMessage: (message, callback) => {
		if(discordAdmin) {
			discordAdmin.send(message);
		}

		if(callback) {
			callback();
		}
	},
	recievedMessage: (message) => {
		log('[Discord] ' + message.channel.recipient.username + ': ' + message.cleanContent);

		if(message.cleanContent.charAt(0) === '!') {
			Discord.sendCommand(message);
		}
	},

	sendCommand: async (message) => {
		const words = message.cleanContent.split(' ');
		if(words[0] === '!pm') {
			const recipient = await discordClient.fetchUser(words[1]);

			if(!!recipient) {
				words.shift();
				words.shift();

				recipient.sendMessage(words.join(' '));
			}
		}
	}
};