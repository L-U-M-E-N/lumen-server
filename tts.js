import proc from 'child_process';

export default {
	/**
	 * Invoke a Text to speech in powershell
	 *
	 * @class      PS_TTS_Invoke
	 * @scope	   private - Do not use it directly, use say or saySSML
	 * @param      string  commands  The commands (automatically generated)
	 * @param      string  text      Text given by client
	 */
	PS_TTS_Invoke: function(commands,text) {
		const options = { shell: true };
		let childD = proc.spawn('powershell', commands, options);
		childD.stdin.setEncoding('ascii');
		childD.stderr.setEncoding('ascii');
		childD.stdin.end(text);

		childD.stderr.once('data', function(data) {
			// we can't stop execution from this function
			console.log(new Error(data));
		});
		childD.addListener('exit', function (code, signal) {
			if (code === null || signal !== null) {
				return console.log(new Error('Could not talk, had an error [code: ' + code + '] [signal: ' + signal + ']'));
			}

			childD = null;
		});
	},

	/**
	 * Ask to say a text by TTS
	 *
	 * @param      string    text    The text needs to be spoken (raw text only)
	 */
	say: function(text) {
		this.PS_TTS_Invoke(
			[ 'Add-Type -AssemblyName System.speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Speak([Console]::In.ReadToEnd())' ],
			text);
	},

	/**
	 * Ask to say a text by TTS
	 *
	 * @param      string    text    The text needs to be spoken (SSML only)
	 */
	saySSML: function(text) {
		this.PS_TTS_Invoke(
			[ 'Add-Type -AssemblyName System.speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.SpeakSsml([Console]::In.ReadToEnd())' ],
			text);
	}
};