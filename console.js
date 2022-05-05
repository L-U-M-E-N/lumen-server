export default class ConsoleHelper {
	/**
	 * Gets the date time.
	 *
	 * @return     {string}  The date time.
	 */
	static getDateTime() {
		const date = new Date();

		let hour = date.getHours();
		hour = (hour < 10 ? '0' : '') + hour;

		let min  = date.getMinutes();
		min = (min < 10 ? '0' : '') + min;

		let sec  = date.getSeconds();
		sec = (sec < 10 ? '0' : '') + sec;

		const year = date.getFullYear();

		let month = date.getMonth() + 1;
		month = (month < 10 ? '0' : '') + month;

		let day  = date.getDate();
		day = (day < 10 ? '0' : '') + day;

		return day + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
	}

	/**
	 * Color a text
	 *
	 * @param      {string}  text    The text to log
	 * @return     {string}  text    The colored text
	 */
	static redText(string) {
		return '\u001b[31m'+string+'\u001b[39m';
	}
	static greenText(string) {
		return '\u001b[32m'+string+'\u001b[39m';
	}
	static yellowText(string) {
		return '\u001b[33m'+string+'\u001b[39m';
	}
	static blueText(string) {
		return '\u001b[36m'+string+'\u001b[39m';
	}

	static consoleReset () {
		return process.stdout.write('\x1Bc');
	}
	/**
	 * Output someting in the console
	 *
	 * @param      {string}  text    The text to log
	 * @param      {<type>}             type    The type of text (for color)
	 */
	static log (msg, type) {
		let text = msg;
		switch(type) {
			case 'warn':
				text = ConsoleHelper.redText('WARNING:') + ConsoleHelper.yellowText(text);
				break;
			case 'error':
				text = ConsoleHelper.redText('ERROR:') + ConsoleHelper.redText(text);
				break;
			case 'fail':
				text = ConsoleHelper.yellowText(text);
				break;
			case 'success':
				text = ConsoleHelper.greenText(text);
				break;
			case 'info':
				text = ConsoleHelper.blueText(text);
				break;
			case 'boot':
				text = ConsoleHelper.yellowText('[!]') + ':' + text;
				break;
			default:
		}

		text = ` ${getModuleName(1).padEnd(20, ' ')} ${ConsoleHelper.logdate()} ${text}`;

		console.log(text);
	}
	/**
	 * Retourner la date en jaune
	 *
	 * @return     {string}  text    Date en jaune
	 */
	static logdate() {
		return ConsoleHelper.yellowText(ConsoleHelper.getDateTime());
	}
}
