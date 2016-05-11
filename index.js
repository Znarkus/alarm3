
require('./lib/date.format');

var util = require('util'),
	fs = require('fs'),
	http = require('http'),
	Path = require('path'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	// expressServer = express(),
	// io = require('socket.io').listen(expressServer.Http),
	alarm = new require('./lib/alarm').Alarm(),
	player = new require('./lib/player').Player(),
	nextAlarm = alarm.getNext(),
	logHistory = [],
	lastAlarmStr,
	config = {
		playlist: Path.resolve(__dirname, 'playlist.txt'),
		playlistShuffle: true,
		alarmFile: Path.resolve(__dirname, 'sound/alarm.mp3'),
		callbackUrls: {
			trigger: [
				//{ host: '10.0.0.1', port: 3000, path: '/morning' }
				{ hostname: '10.0.0.4', port: 8888, path: '/dim/75', method: 'POST' }
				//'http://10.0.0.1:3000/morning'
			]
		}
	}
	/*config = {
		plugins: ['verify']
	},
	plugins = {},*/
	/*verifyAwakeTimer, canVerifyAwake*/;

function log(text) {
	io.sockets.emit('log', text);

	console.log('[' + (new Date()).format() + '] ' + text);
	logHistory.push([text, new Date().getTime()]);
}

function shuffle(array) {
    var tmp, current, top = array.length;

    if (top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}

function playlist(callback) {
	fs.exists(config.playlist, function (exists) {
		if (exists) {
			fs.readFile(config.playlist, 'utf-8', function (err, data) {
				data = data.split('\n');

				if (config.playlistShuffle) {
					data = shuffle(data);
				}

				callback(data);
				/*.some(function (filename) {
					if (fs.existsSync(filename)) {
						player.play(filename);
						return true;
					}
				});*/
				//player()
			});
		} else {
			callback([]);
		}
	});
}

function playCallback(file) {
	log('Playing ' + file);
}

function soundAlarm() {
	player.play(config.alarmFile, { repeat: true });
	/*playlist(function (list) {
		var newList = [];

		if (list.length > 0) {
			list.forEach(function (f) {
				newList.push([f, { playCallback: playCallback }]);
				newList.push([config.alarmFile, { repeat: true, timeLimit: 30, playCallback: playCallback }]);
			});
		} else {
			newList.push([config.alarmFile, { repeat: true, timeLimit: 30, playCallback: playCallback }]);
		}

		player.playlist(newList);
	});*/
}

/*function verifyAwake() {
	canVerifyAwake = false;
	clearTimeout(verifyAwakeTimer);
	log('Initiating awake verification');
	io.sockets.emit('canVerifyAwakeIn', 60000);
	verifyAwakeTimer = setTimeout(function () {
		io.sockets.emit('verifyAwake');
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

// expressServer.configure(function () {
	app.use(express.static(__dirname + '/html'));
	app.use('/css', express.static(__dirname + '/css'));
	app.use('/js', express.static(__dirname + '/lib'));
	app.use('/jslib/fastclick', express.static(__dirname + '/node_modules/fastclick/lib'));
	app.use('/jslib/moment', express.static(__dirname + '/node_modules/moment/min'));
	app.use('/jslib/jquery', express.static(__dirname + '/bower_components/jquery'));
	app.use('/jslib/string', express.static(__dirname + '/bower_components/stringjs/lib'));
// });

// Every 20 min to keep awake
setInterval(() => 1, 1000 * 60 * 20);

// server.listen(app.get('port'));
server.listen(1337, function () {
	console.log('Server running on port 1337');
});

// io.enable('browser client minification');  // send minified client
// io.enable('browser client etag');          // apply etag caching logic based on version number
// io.enable('browser client gzip');          // gzip the file
// io.set('log level', 1);                    // reduce logging
// io.set('transports', [                     // enable all transports (optional if you want flashsocket)
// 	'websocket',
// 	'flashsocket',
// 	'htmlfile',
// 	'xhr-polling',
// 	'jsonp-polling'
// ]);

alarm.setCallback(function () {
	nextAlarm = null;
	log('Triggered');
	io.sockets.emit('triggered');
	soundAlarm();

	if (config && config.callbackUrls && config.callbackUrls.trigger) {
		config.callbackUrls.trigger.forEach(function (url) {
			http
				.request(url)
				.on('error', err => {
					console.error('Callback URL error:', err);
				})
				.end();
		});
	}
});

io.sockets.on('connection', function (socket) {
	socket.emit('init', {
		lastAlarmStr: lastAlarmStr,
		alarmSet: !!nextAlarm,
		triggered: player.playing(),
		//canVerifyAwake: canVerifyAwake,
		logHistory: logHistory,
		now: new Date().getTime()
	});

	socket.on('set', function (data) {
		alarm.setTime.apply(alarm, parseTime(data.time));
		nextAlarm = alarm.getNext();
		lastAlarmStr = nextAlarm.format('HH:MM');
		log('Set to ' + lastAlarmStr);
		io.sockets.emit('set', {
			string: lastAlarmStr,
			now: new Date().getTime(),
			nextAlarm: nextAlarm.getTime()
		});
	});

	socket.on('test', function (data) {
		soundAlarm();
		log('Testing');
		io.sockets.emit('test');
	});

	socket.on('stop', function (data) {
		log('Stopped');
		io.sockets.emit('stop');

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

//soundAlarm();
