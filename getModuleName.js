export default function getModuleName(depth = 0) {
	const paths = (new Error().stack.split('at ')[depth + 2]).trim().split('/modules/');
	let moduleName = 'core';
	if(paths[1]) { // This is a module
		moduleName = paths[1].split('/');
		moduleName = moduleName[0].replace('lumen-module', '').replace('lumen', '').replace('module', '');

		while(moduleName.startsWith('-')) {
			moduleName = moduleName.slice(1, moduleName.length);
		}
		moduleName = moduleName.trim();
	}

	return moduleName;
}