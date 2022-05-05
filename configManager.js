import fs from 'fs';

import rawConfig from './config.js';
import getModuleName from './getModuleName.js';

// Load config from desktop config file if needed
const desktopConfigLocation = rawConfig['desktopConfigLocation'];
if(desktopConfigLocation) {
	const moduleConfigs = JSON.parse(fs.readFileSync(desktopConfigLocation, 'utf8'));
	for(const id in moduleConfigs) {
		rawConfig[id] = moduleConfigs[id];
	}
}

// Load modules list
const modulesDir = 'modules/';
rawConfig.moduleList = fs.readdirSync(modulesDir).filter((elt) => fs.statSync(modulesDir + elt).isDirectory());

export default function configManager() {
	const moduleName = getModuleName(2);

	if(moduleName === 'core') {
		return rawConfig;
	}

	return rawConfig[moduleName];
}