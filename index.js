
require('./lib/date.format');

var util = require('util'),
	express = require('express'),
	expressServer = express.createServer(),
	socketServer = require('socket.io').listen(expressServer),
	alarm = new require('./lib/alarm').Alarm(),
	player = new require('./lib/player').Player(),
	nextAlarm = alarm.getNext(),
	logHistory = [],
	lastAlarmStr
	/*config = {
		plugins: ['verify']
	},
	plugins = {},*/
	/*verifyAwakeTimer, canVerifyAwake*/;

function log(text) {
	socketServer.sockets.emit('log', text);
	
	util.puts('[' + (new Date()).format() + '] ' + text);
	logHistory.push([text, new Date().getTime()]);
}

function soundAlarm() {
	player.play('sound/alarm.wav', { repeat: true });
}

/*function verifyAwake() {
	canVerifyAwake = false;
	clearTimeout(verifyAwakeTimer);
	log('Initiating awake verification');
	socketServer.sockets.emit('canVerifyAwakeIn', 60000);
	verifyAwakeTimer = setTimeout(function () {
		socketServer.sockets.emit('verifyAwake');
		canVerifyAwake = true;
		clearTimeout(verifyAwakeTimer);
		verifyAwakeTimer = setTimeout(function () {
			clearTimeout(verifyAwakeTimer);
			alarm.trigger();
		}, 60000);
	}, 60000);
}

function verifiedAwake() {
	if (canVerifyAwake) {
		clearTimeout(verifyAwakeTimer);
		log('Awake verified');
	}
}*/

function parseTime(string) {
	var time = string.split(':');
	
	if (time.length == 1) {
		time[1] = 0;
	}
	
	return time;
}

expressServer.configure(function () {
	expressServer.use(express.static(__dirname + '/html'));
	expressServer.use('/css', express.static(__dirname + '/css'));
	expressServer.use('/js', express.static(__dirname + '/lib'));
});

expressServer.listen(1337, function () {
	var addr = expressServer.address();
	util.puts('Server running on http://' + addr.address + ':' + addr.port);
});

socketServer.enable('browser client minification');  // send minified client
socketServer.enable('browser client etag');          // apply etag caching logic based on version number
socketServer.enable('browser client gzip');          // gzip the file
socketServer.set('log level', 1);                    // reduce logging
socketServer.set('transports', [                     // enable all transports (optional if you want flashsocket)
	'websocket',
	'flashsocket',
	'htmlfile',
	'xhr-polling',
	'jsonp-polling'
]);

alarm.setCallback(function () {
	nextAlarm = null;
	log('Triggered');
	socketServer.sockets.emit('triggered');
	soundAlarm();
});

socketServer.sockets.on('connection', function (socket) {
	socket.emit('init', {
		lastAlarmStr: lastAlarmStr,
		alarmSet: !!nextAlarm,
		triggered: player.playing(),
		//canVerifyAwake: canVerifyAwake,
		logHistory: logHistory
	});
	
	socket.on('set', function (data) {
		alarm.setTime.apply(alarm, parseTime(data.time));
		nextAlarm = alarm.getNext();
		lastAlarmStr = nextAlarm.format('HH:MM');
		log('Set to ' + lastAlarmStr);
		socketServer.sockets.emit('set', { string: lastAlarmStr });
	});
	
	socket.on('stop', function (data) {
		log('Stopped');
		socketServer.sockets.emit('stop');
		
		if (player.playing()) {
			player.stop();
			//verifyAwake();
		} else {
			alarm.cancel();
			nextAlarm = null;
		}
	});
	
	/*socket.on('awake', function (data) {
		verifiedAwake();
	});*/
	
	/*socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});*/
});