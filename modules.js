import { spawn } from 'child_process';
import fs from 'fs';

global.childList = { };

export default class Modules {
	static loadSubprocess(i) {
		if(typeof config.subprocessesList[i].init === 'function') {
			config.subprocessesList[i].init();
		}
		if(config.subprocessesList[i].options !== undefined) {
			config.subprocessesList[i].options = [];
		}

		if(config.subprocessesList[i].file !== undefined) {

			try {
				childList[i] = spawn(config.subprocessesList[i].file, config.subprocessesList[i].fileopt);

				if(typeof config.subprocessesList[i].onclose === 'function') {
					childList[i].on('close', config.subprocessesList[i].onclose);
				}

				if(typeof config.subprocessesList[i].onerr === 'function') {
					childList[i].stderr.on('data', config.subprocessesList[i].onerr);
				}

				if(typeof config.subprocessesList[i].onstdout === 'function') {
					childList[i].stdout.on('data', config.subprocessesList[i].onstdout);
				}
			} catch(e) {
				log('Failed to load/reload subprocess: ' + i + '\n' + e);
			}
		}
	}

	static loadSubprocesses() {
		for(const subprocessName in config.subprocessesList) {
			log('./initialising.SUBPROCESS.' + subprocessName, 'boot');
			Modules.loadSubprocess(subprocessName);
		}
	}

	static async reloadModule(moduleName) {
		try {
			if(global[moduleName] && typeof global[moduleName].stop === 'function') {
				await global[moduleName].stop();
			}

			delete global[moduleName];

			global[moduleName] = (await import('./' + moduleName + '.js?date=' + Date.now())).default; // TODO: find a better way, this isn't releasing memory ...

			if(global[moduleName] && typeof global[moduleName].init === 'function') {
				await global[moduleName].init();
			}
		} catch(e) {
			log('Failed to load/reload module: ' + moduleName + '\n');
			console.error(e);
		}

		Modules.watch(moduleName);
	}

	static async loadModules() {
		for(const moduleName of config.moduleList) {
			log('./initialising.MODULES.' + moduleName, 'boot');
			await Modules.reloadModule(moduleName);
		}
	}

	static watch(moduleName) {
		const watcher = fs.watch(moduleName + '.js', { persistent: false }, (curr, prev) => {
			watcher.close();

			log('./reloading.MODULES.' + moduleName, 'boot');

			Modules.reloadModule(moduleName);
		});
	}
}
