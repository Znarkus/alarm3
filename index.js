var util = require('util'),
	express = require('express'),
	expressServer = express.createServer(),
	socketServer = require('socket.io').listen(expressServer),
	alarm = new require('./lib/alarm').Alarm(),
	player = new require('./lib/player').Player();

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

socketServer.sockets.on('connection', function (socket) {
	var next = alarm.getNext();
	
	socket.emit('init', { time: next ? next.format('HH:MM') : null });
	
	socket.on('set', function (data) {
		log('Set alarm: ' + data.time[0] + ':' + data.time[1]);
		
		alarm.setTime(data.time[0], data.time[1], function () {
			//console.log('NUUUUUUUUUUUUU!!!!!!!!!!!!!');
			log('Alarm triggered')
			player.play('sound/alarm.wav', { repeat: true });
		});
	});
	
	socket.on('stop', function (data) {
		log('Stop alarm');
		player.stop();
	});
	
	/*socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});*/
});