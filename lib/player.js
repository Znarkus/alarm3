var childProcess = require('child_process');

exports.Player = function () {
	var process = null;

	function mplayerCommand(cmd) {
		if (process !== null && process.stdin.writable) {
			process.stdin.write(cmd + '\n');
			return true;
		} else {
			return false;
		}
	}

	function play(file, options) {
		options = options || {};
		
		if (process === null) {
			var cmd = 'mplayer';
			
			if (options.repeat) {
				cmd += ' -loop 0';
			}
			
			cmd += ' ' + file + ' -slave -quiet > /dev/null';
			
			process = childProcess.exec(cmd, function(/*error, stdout, stderr*/){
				//util.puts('[CALLBACK]', error, stderr);
				process = null;
			});
		}
	}
	
	function stop() {
		mplayerCommand('quit');
	}
	
	return {
		play: play,
		stop: stop
	};
};

