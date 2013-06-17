var process, start,
	childProcess = require('child_process');

function log(text) {
	console.log((new Date().getTime() - start) + 'ms: ' + text);
}

function sendCmd(cmd) {
	process.stdin.write(cmd + '\n');
	log('Command: ' + cmd);
}

process = childProcess.exec('mplayer -idle -slave -really-quiet -msglevel global=5', function () {	// 2>/dev/null
	log('Finished');
});

process.stdout.on('data', function (a) {
	console.log(a);
});

start = new Date().getTime();

setTimeout(function () {
	sendCmd('get_time_pos');
	sendCmd('loadfile "resources/5000ms.wav"');
	sendCmd('get_time_pos');
	var a = setInterval(function () {
		sendCmd('get_time_pos');
	}, 10);
}, 1000);


setTimeout(function () {
	sendCmd('stop');
}, 3000);

