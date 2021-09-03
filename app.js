/**
 * Modules
 */
require('./console')();
require('./config');

global.Modules = require('./modules');

moduleList = ['Database', ...moduleList.map((elt) => 'modules/' + elt + '/main.server')];

if(discordAdminId && discordBotToken) {
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

consoleReset();

// Autoloading modules
log('./action.SYSTEM.REBOOT', 'boot');

if(debugMode) {
	log('./initialising.DEBUG.MODE', 'boot');
}

autoLoad(function() {
	log('SEEKING ADMIN ...');

	if(discordAdminId && discordBotToken) {
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