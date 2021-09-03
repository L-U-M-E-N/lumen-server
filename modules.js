const { spawn } = require('child_process');
const fs = require('fs');

global.childList = { };

module.exports = class Modules {
	static loadSubprocess(i) {
		if(typeof subprocessesList[i].init === 'function') {
			subprocessesList[i].init();
		}
		if(subprocessesList[i].options !== undefined) {
			subprocessesList[i].options = [];
		}

		if(subprocessesList[i].file !== undefined) {

			try {
				childList[i] = spawn(subprocessesList[i].file, subprocessesList[i].fileopt);

				if(typeof subprocessesList[i].onclose === 'function') {
					childList[i].on('close', subprocessesList[i].onclose);
				}

				if(typeof subprocessesList[i].onerr === 'function') {
					childList[i].stderr.on('data', subprocessesList[i].onerr);
				}

				if(typeof subprocessesList[i].onstdout === 'function') {
					childList[i].stdout.on('data', subprocessesList[i].onstdout);
				}
			} catch(e) {
				log('Failed to load/reload subprocess: ' + i + '\n' + e);
			}
		}
	}

	static loadSubprocesses() {
		for(const subprocessName in subprocessesList) {
			log('./initialising.SUBPROCESS.' + subprocessName, 'boot');
			Modules.loadSubprocess(subprocessName);
		}
	}

	static async reloadModule(moduleName) {
		try {
			if(global[moduleName] && typeof global[moduleName].stop === 'function') {
				await global[moduleName].stop();
			}

			delete require.cache[require.resolve('./' + moduleName)];
			delete global[moduleName];

			global[moduleName] = require('./' + moduleName);

			if(global[moduleName] && typeof global[moduleName].init === 'function') {
				await global[moduleName].init();
			}
		} catch(e) {
			log('Failed to load/reload module: ' + moduleName + '\n' + e);
		}

		Modules.watch(moduleName);
	}

	static async loadModules() {
		for(const moduleName of moduleList) {
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
};