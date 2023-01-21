/**
 * DEFAULT CONFIGURATION FILE
 * YOU MUST COPY AND COMPLETE IT AS config.js
 */
global.DEBUG = false;

/**
 * Example config, either here or in desktop config file
 */
const config = {
	desktopConfigLocation: '/path/to/my/file', // Optional: null, undefined or string
	'discord': { // Optional
		'adminId': 'string',
		'botToken': 'string',
		'pmChannel': 'string'
	},
	'database': { // Mandatory
		'user': 'string',
		'host': 'string',
		'database': 'string',
		'password': 'string',
		'port': 'number'
	},
	subprocessesList: { // Optionnal, to start programs that are not lumen modules
		//"example": { init: somefunction, file: somefile, fileopt: [], options: [], onerr: function, onclose: function, onstdout: function, },
	}
};

export default config;