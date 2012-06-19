var util = require('util'),
	express = require('express'),
	expressServer = express.createServer(),
	socketServer = require('socket.io').listen(expressServer),
	alarm = new require('./lib/alarm').Alarm(),
	player = new require('./lib/player').Player(),
	nextAlarm = alarm.getNext(),
	verifyAwakeTimer;

require('./lib/date.format');

function log(text){
	util.puts('[' + (new Date()).format() + '] ' + text);
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

function soundAlarm() {
	player.play('sound/alarm.wav', { repeat: true });
}

function verifyAwake() {
	var canReset = false;
	clearTimeout(verifyAwakeTimer);
	verifyAwakeTimer = setTimeout(function () {
		socketServer.sockets.emit('verifyAwake');
		socketServer.sockets.on('awake', function (data) {
			console.log('AWAKE!');
		});
		
		canReset = true;
		clearTimeout(verifyAwakeTimer);
		verifyAwakeTimer = setTimeout(function () {
			soundAlarm();
		}, 60000);
	}, 60000);
}

socketServer.sockets.on('connection', function (socket) {
	socket.emit('init', {
		time: nextAlarm ? nextAlarm.format('HH:MM') : null,
		triggered: player.playing()
	});
	
	socket.on('set', function (data) {
		alarm.setTime(data.time[0], data.time[1], function () {
			log('Triggered');
			socketServer.sockets.emit('triggered');
			soundAlarm();
		});
		
		nextAlarm = alarm.getNext();
		log('Set to ' + nextAlarm.format('HH:MM'));
		socketServer.sockets.emit('set', { next: nextAlarm });
	});
	
	socket.on('stop', function (data) {
		if (player.playing()) {
			log('Stopped');
			socketServer.sockets.emit('stop');
			player.stop();
			//verifyAwake();
			
		}
	});
	
	/*socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});*/
});