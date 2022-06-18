import DiscordJS from 'discord.js';

import getModuleName from './getModuleName.js';

global.discordClient = (typeof discordClient !== 'undefined') ? discordClient : new DiscordJS.Client({ intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.DIRECT_MESSAGES, DiscordJS.Intents.FLAGS.GUILD_MESSAGES] });
global.discordAdmin = (typeof discordAdmin !== 'undefined') ? discordAdmin : null;

if(!global.discordCommands) {
	global.discordCommands = {};
}
if(!global.discordButtons) {
	global.discordButtons = {};
}

discordCommands['pm'] = {
	moduleName: 'core',
	description: 'PM an user',
	fn: async(discordClient, interaction) => {
		const recipient = interaction.options.getUser('user');

		if(!!recipient) {
			recipient.send(interaction.options.getString('message'));
		}

		interaction.reply({
			content: 'Sent !',
			ephemeral: true
		});
	},
	options: [
		{
			name: 'user',
			type: 'USER',
			description: 'The user to ping',
			required: true,
		},
		{
			name: 'message',
			type: 'STRING',
			description: 'The message to send',
			required: true
		}
	]
};

discordCommands['delete'] = {
	moduleName: 'core',
	description: 'Delete a specific message',
	fn: async(discordClient, interaction) => {
		const messageId = interaction.options.getString('message');
		const foundMessage = await interaction.channel.messages.fetch(messageId);

		console.log('Deleting ', messageId, foundMessage);

		if(foundMessage) {
			try {
				foundMessage.delete();
				interaction.reply({ content: 'Done !', ephemeral: true });
			} catch(e) {
				interaction.reply({ content: e.message, ephemeral: true });
			}
		}
	},
	options: [{
		name: 'message',
		type: 'STRING',
		description: 'Message id',
		required: true
	}]
};

discordCommands['purge'] = {
	moduleName: 'core',
	description: 'Purge messages following a specific pattern, default: "L.U.M.E.N online - awaiting orders"',
	fn: async(discordClient, interaction) => {
		try {
			let foundMessages = await interaction.channel.messages.fetch({ limit: 100 });
			let purgeString = interaction.options.getString('content') || 'L.U.M.E.N online - awaiting orders';

			foundMessages = foundMessages.filter((elt) => elt.cleanContent.includes(purgeString));

			let msg = `Purging pm - ${foundMessages.size} found`;
			console.log(msg);
			interaction.reply({ content: msg, ephemeral: true });

			if(foundMessages) {
				foundMessages.map((elt) => {
					try {
						elt.delete();
					} catch(e) {
						interaction.reply({ content: e.message, ephemeral: true });
					}
				});
			}
		} catch(e) {
			interaction.reply({ content: e.message, ephemeral: true });
		}
	},
	options: [
		{
			name: 'content',
			type: 'STRING',
			description: 'Message content to search for',
		}
	]
};

export default class Discord {
	/**
	 * Connect to discord server, and listen messages
	 */
	static connect(callback) {
		discordClient.on('ready', async() => {
			log('Connected to discord server bot');
			discordClient.user.setActivity('Monitoring the world');

			discordClient.users.fetch(config.discord.adminId)
				.then(user => {
					discordAdmin = user;

					callback();
				});
		});

		discordClient.on('messageCreate', (message) => Discord.recievedMessage(message));

		discordClient.on('error', console.error);

		discordClient.on('interactionCreate', Discord.interactionCreated);

		discordClient.login(config.discord.botToken);

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
	}

	static interactionCreated(interaction) {
		if(interaction.channel.id !== config.discord.pmChannel || interaction.user.id !== config.discord.adminId) {
			log(`[Discord] Someone tried to execute outside of Elanis/LUMEN channel ! ${interaction.user.id}`)
			return;
		}

		if(interaction.isCommand() && discordCommands[interaction.commandName]) {
			try {
				discordCommands[interaction.commandName].fn(discordClient, interaction);
			} catch(err) {
				console.log(err);
			}
		}

		if(interaction.isButton() && discordButtons[interaction.component.customId]) {
			try {
				discordButtons[interaction.component.customId].fn(discordClient, interaction);
			} catch(err) {
				console.log(err);
			}
		}
	}

	static registerCmd(commandName, fn, commandData = {}) {
		const moduleName = getModuleName(1);

		if(discordCommands[commandName] && discordCommands[commandName].moduleName !== moduleName) {
			log(`Discord command ${commandName} already registered in module ${discordCommands[commandName].moduleName}`, 'error');
			return;
		}

		discordCommands[commandName] = {
			moduleName,
			fn,
			...commandData
		};

		console.log(discordCommands[commandName]);
	}

	static registerBtn(commandName, fn) {
		const moduleName = getModuleName(1);

		if(discordButtons[commandName] && discordButtons[commandName].moduleName !== moduleName) {
			log(`Discord command ${commandName} already registered in module ${discordButtons[commandName].moduleName}`, 'error');
			return;
		}

		discordButtons[commandName] = {
			moduleName,
			fn
		};
	}

	static registerCommands() {
		const commandsList = Object.keys(discordCommands).map((cmd) => ({
			name: cmd,
			description: discordCommands[cmd].moduleName + ' - ' + (discordCommands[cmd].description || '?'),
			options: discordCommands[cmd].options || []
		}));

		const command = discordClient.application?.commands.set(commandsList);
	}
}
