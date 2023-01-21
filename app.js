/**
 * Global methods/classes
 */
import getModuleName from './getModuleName.js';
global.getModuleName = getModuleName;

import ConsoleHelper from './console.js';
global.log = ConsoleHelper.log;

import configManager from './configManager.js';
Object.defineProperty(global, 'config', {
	get() {
		return configManager();
	}
});

/**
 * Modules
 */
import Modules from './modules.js';
global.reloadModule = Modules.reloadModule;

config.moduleList = ['Database', ...config.moduleList.map((elt) => 'modules/' + elt + '/main.server')];

if(config.discord && config.discord.adminId && config.discord.botToken) {
	config.moduleList.unshift('Discord');
}

/**
 * Load
 */
async function autoLoad(callback) {
	// Load/Reload all modules & subprocess
	log('./initialising.MODULES.ALL', 'boot');
	await Modules.loadModules();

	Modules.watch('modules');

	log('./initialising.SUBPROCESS.ALL', 'boot');
	Modules.loadSubprocesses();

	callback();
}

ConsoleHelper.consoleReset();

// Autoloading modules
log('./action.SYSTEM.REBOOT', 'boot');

if(DEBUG) {
	log('./initialising.DEBUG.MODE', 'boot');
}

autoLoad(function() {
	log('SEEKING ADMIN ...');

	if(config.discord.adminId && config.discord.botToken) {
		Discord.connect(() => {
			Discord.sendMessage(
				'L.U.M.E.N online - awaiting orders'
			);
			Discord.registerCommands();
			log('ADMIN FOUND');
		});
	}
});

process.on('uncaughtException', err => {
	console.error('There was an uncaught error', err);
	process.exit(1); //mandatory (as per the Node.js docs)
});