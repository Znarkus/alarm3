var childProcess = require('child_process');
var debug = require('debug')('player');

exports.Player = function () {
	var _process = null,
		_timeLimitTimer = null,
		_playing = false,
		_userStopped = false;

	function mplayerCommand(cmd) {
		if (_process !== null && _process.stdin.writable) {
			//console.log('cmd =', cmd);
			_process.stdin.write(cmd + '\n');
			return true;
		} else {
			return false;
		}
	}
	
	function playing() {
		//console.log('process =', !!_process);
		//return _process !== null;
		//console.log(_process !== null, _playing);
		return _playing;
	}
	
	function _callback(options, callbackKey, args) {
		if (options[callbackKey]) {
			(typeof options[callbackKey] == 'function'
				? [options[callbackKey]]
				: options[callbackKey]
			).forEach(function (callback) {
				callback.apply(this, args);
			});
		}
	}

	function play(file, options) {
		var cmd, self = this;
		
		options = options || {};
		
		if (!playing()) {
			cmd = 'mplayer';
			
			if (options.repeat) {
				cmd += ' -loop 0';
			}
			
			if (options.timeLimit) {
				//cmd += ' -endpos ' + options.timeLimit;
				clearTimeout(_timeLimitTimer);
				_timeLimitTimer = setTimeout(function () {
					_stop();
				}, options.timeLimit * 1000);
			}
			
			cmd += ' "' + file + '" -slave -quiet > /dev/null';
			debug(cmd);
			
			_process = childProcess.exec(cmd, function(error, stdout, stderr){
				//console.log(error, stdout, stderr);
				debug('[STDERR] %s', stderr);
				//util.puts('[CALLBACK]', error, stderr);
				clearTimeout(_timeLimitTimer);
				_process = null;
				_playing = false;
				
				//console.log('_playbackEndedCallback =', !!_playbackEndedCallback);
				_callback(options, 'stopCallback', [{ userStopped: _userStopped}]);
				_userStopped = false;
			});
			
			_callback(options, 'playCallback', [file, options]);
			
			_playing = true;
		}
	}
	
	function _isString(value) {
		return !!value.substring;
	}
	
	function playlist(list) {
		var position = 0,
			self = this;
		
		function next(p) {
			var args;
			
			if (p && p.userStopped) {
				return;
			}
			
			if (position > list.length - 1) {
				return;
			}
			
			args = _isString(list[position]) ? [list[position]] : list[position];
			
			if (!args[1]) {
				args[1] = { stopCallback: next };
			} else if (args[1].stopCallback) {
				args[1].stopCallback = [args[1].stopCallback];
				args[1].stopCallback.push(next);
			} else {
				args[1].stopCallback = next;
			}
			
			self.play.apply(self, args);
			position++;
		}
		
		next();
	}
	
	function _stop() {
		clearTimeout(_timeLimitTimer);
		_playing = false;
		mplayerCommand('quit');
		//_process.kill();
	}
	
	function stop() {
		_userStopped = true;
		_stop();
	}
	
	return {
		play: play,
		stop: stop,
		playing: playing,
		playlist: playlist
	};
};

