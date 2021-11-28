import DiscordJS from 'discord.js';

global.discordClient = (typeof discordClient !== 'undefined') ? discordClient : new DiscordJS.Client({ intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.DIRECT_MESSAGES, DiscordJS.Intents.FLAGS.GUILD_MESSAGES] });
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
		const username = (message.channel.recipient) ? message.channel.recipient.username : '???';

		log('[Discord] ' + username + ': ' + message.cleanContent);

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
		} else if(words[0] === '!delete') {
			const foundMessage = await message.channel.messages.fetch(words[1]);

			console.log('Deleting ', words[1], foundMessage);

			if(foundMessage) {
				foundMessage.delete();
			}
		} else if(words[0] === '!purge') {
			let foundMessages = await message.channel.messages.fetch({ limit: 100 });
			foundMessages = foundMessages.filter((elt) => elt.cleanContent === 'L.U.M.E.N online - awaiting orders');

			console.log(`Purging pm - ${foundMessages.size} found`);

			if(foundMessages) {
				foundMessages.map((elt) => elt.delete());
			}
		}
	}
}