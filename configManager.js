import fs from 'fs';

import rawConfig from './config.js';
import getModuleName from './getModuleName.js';

let config = JSON.parse(JSON.stringify(rawConfig));
let desktopConfigWatcher;

// Load config from desktop config file if needed
function loadConfig() {
	const desktopConfigLocation = config['desktopConfigLocation'];
	if(desktopConfigLocation) {
		const originalRawConfig = JSON.parse(JSON.stringify(config));

		function loadDesktopConfigLocation() {
			config = JSON.parse(JSON.stringify(originalRawConfig));

			const moduleConfigs = JSON.parse(fs.readFileSync(desktopConfigLocation, 'utf8'));
			for(const id in moduleConfigs) {
				config[id] = moduleConfigs[id];
			}

			desktopConfigWatcher = fs.watch(config['desktopConfigLocation'], { persistent: false }, (curr, prev) => {
				desktopConfigWatcher.close();

				log('./reloading.CONFIG.Desktop', 'boot');

				loadDesktopConfigLocation();
			});	
		}

		loadDesktopConfigLocation();
	}

	const configWatcher = fs.watch('config.js', { persistent: false }, async(curr, prev) => {
		desktopConfigWatcher.close();
		configWatcher.close();

		log('./reloading.CONFIG.Global', 'boot');

		config = (await import('./config.js?' + Date.now())).default;

		loadConfig();
	});
}

loadConfig();

// Load modules list
const modulesDir = 'modules/';
config.moduleList = fs.readdirSync(modulesDir).filter((elt) => fs.statSync(modulesDir + elt).isDirectory());

export default function configManager() {
	const moduleName = getModuleName(2);

	if(moduleName === 'core') {
		return config;
	}

	return config[moduleName];
}