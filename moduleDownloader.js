import { execSync } from 'child_process';
import https from 'https';
import { createWriteStream } from 'fs';
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'path';

export default class ModuleDownloader {
	static download(file, url, resolve) {
		const options = {
			headers: { 'User-Agent': 'Lumen-server module downloader https://github.com/L-U-M-E-N/lumen-server' }
		};

		console.log(url);
		const request = https.get(url, options, (response) => {
			console.log('Status code: ', response.statusCode);
			if(response.statusCode === 302) {
				return ModuleDownloader.download(file, response.headers.location, resolve);
			}

			response.pipe(file);

			// after download completed close filestream
			file.on("finish", () => {
				file.close();
				console.log("Download Completed");
				resolve();
			});
		});
	}

	static async downloadModules() {
		log('./initialising.MODULES.DOWNLOAD', 'boot');

		const globalPackageConfig = JSON.parse(await readFile(path.join('package.json'), 'utf-8'));

		let directoryList = await readdir('modules');
		let modified = false;
		for(const currModule of config.modules) {
			if(!currModule.server) {
				continue;
			}

			// Module already exists
			const modulePath = path.join('modules', currModule.name);
			const packageConfigPath = path.join(modulePath, 'package.json');
			let packageConfig = {};
			if(directoryList.includes(currModule.name)) {
				packageConfig = JSON.parse(await readFile(packageConfigPath, 'utf-8'));

				if(packageConfig.version === currModule.version) {
					continue;
				}

				await rm(modulePath, { recursive: true, force: true });
			}

			// Download module
			const zipPath = path.join('modules', currModule.name + '.zip');
			await (new Promise((resolve, reject) => { 
				const file = createWriteStream(zipPath);
				const downloadURL = currModule.server_download_url.replace('%VERSION%', currModule.version);
				ModuleDownloader.download(file, downloadURL, resolve);
			}));

			// Extract module
			execSync(`unzip ${zipPath} -d ${modulePath}`);
			execSync(`mv ${modulePath.replace('\\', '/')}/*/*  ${modulePath}`);

			await rm(zipPath);

			// Set version
			packageConfig = JSON.parse(await readFile(packageConfigPath, 'utf-8'));
			packageConfig.version = currModule.version;

			// Apply dependency to global package.json
			if(packageConfig.dependencies) {
				for(const dependencyName in packageConfig.dependencies) {
					if(globalPackageConfig.dependencies[dependencyName]) {
						if(globalPackageConfig.dependencies[dependencyName] !== packageConfig.dependencies[dependencyName]) {
							throw new Error(`Error: dependendency "${dependencyName}" has not the same version between modules: ${globalPackageConfig.dependencies[dependencyName]} VS ${packageConfig.dependencies[dependencyName]}`);
						}
						continue;
					}

					console.log("Needs " + dependencyName + " v" + packageConfig.dependencies[dependencyName]);
					globalPackageConfig.dependencies[dependencyName] = packageConfig.dependencies[dependencyName];
				}
			}

			await writeFile(packageConfigPath, JSON.stringify(packageConfig, null, 2));

			modified = true;
		}

		if(modified) {
			await writeFile('package.json', JSON.stringify(globalPackageConfig, null, 2));
			execSync('npm i');
		}

		const configModuleList = config.modules.filter(x => x.server).map(x => x.name);
		for(const moduleName of directoryList) {
			console.log('moduleName:', moduleName);
			if(!configModuleList.includes(moduleName)) {
				const modulePath = path.join('modules', moduleName);
				await rm(modulePath, { recursive: true, force: true });
				modified = true;
			}
		}

		return modified;
	}
}