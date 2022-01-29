/**
 * Modules
 */
import ConsoleHelper from './console.js';
global.log = ConsoleHelper.log;

import './config.js';

import Modules from './modules.js';

moduleList = ['Database', ...moduleList.map((elt) => 'modules/' + elt + '/main.server')];

if(global.config.discord.adminId && global.config.discord.botToken) {
	moduleList.unshift('Discord');
}

/**
 * Load
 */
async function autoLoad(callback) {
	// Load/Reload all modules & subprocess
	log('./initialising.MODULES.ALL', 'boot');
	await Modules.loadModules();

	Modules.watch('config');
	Modules.watch('modules');

	log('./initialising.SUBPROCESS.ALL', 'boot');
	Modules.loadSubprocesses();

	callback();
}

ConsoleHelper.consoleReset();

// Autoloading modules
log('./action.SYSTEM.REBOOT', 'boot');

if(debugMode) {
	log('./initialising.DEBUG.MODE', 'boot');
}

autoLoad(function() {
	log('SEEKING ADMIN ...');

	if(global.config.discord.adminId && global.config.discord.botToken) {
		Discord.connect(() => {
			Discord.sendMessage(
				'L.U.M.E.N online - awaiting orders'
			);
			log('ADMIN FOUND');
		});
	}
});

process.on('uncaughtException', err => {
	console.error('There was an uncaught error', err);
	process.exit(1); //mandatory (as per the Node.js docs)
});