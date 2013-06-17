var Player = require('../lib/player.js').Player;

process.chdir(__dirname);	// Very important!

exports.play = function (test) {
	var p = new Player();
	
	test.expect(2);
	p.play('resources/100ms.wav');
	test.ok(p.playing(), "playing");
	
	setTimeout(function () {
		test.ok(!p.playing(), "finished playing");
		test.done();
	}, 1000);
};

exports.loop = function (test) {
	var p = new Player();
	
	test.expect(2);
	p.play('resources/100ms.wav', { repeat: true });
	
	setTimeout(function () {
		test.ok(p.playing(), "still playing");
		p.stop();
		
		setTimeout(function () {
			test.ok(!p.playing(), "stopped playing");
			test.done();
		}, 10);
	}, 400);
};

exports.timeLimit = function (test) {
	var p = new Player();
	
	test.expect(2);
	p.play('resources/100ms.wav', { repeat: true, timeLimit: 0.25 });
	
	setTimeout(function () {
		test.ok(p.playing(), "still playing");
		
		setTimeout(function () {
			test.ok(!p.playing(), "stopped playing");
			test.done();
		}, 20);
	}, 240);
};

exports.playlist = function (test) {
	var p, playlist, playlistIndex = 0;
	
	p = new Player();
	playlist = [
		['resources/100ms.wav', { playCallback: playCallback, stopCallback: stopCallback }],
		['resources/100ms.wav', { playCallback: playCallback, stopCallback: stopCallback, repeat: true, timeLimit: 0.5 }],
		['resources/100ms.wav', { playCallback: playCallback, stopCallback: stopCallback }]
	];
	
	test.expect(11);	// 3 * 3 + 2
	
	p.playlist(playlist);
	
	test.ok(p.playing(), "playing");
	
	function playCallback(file, options) {
		test.equal(file, playlist[playlistIndex][0]);
		
		//if (playlist[playlistIndex][1]) {
			test.equal(options.repeat, playlist[playlistIndex][1].repeat);
			test.equal(options.timeLimit, playlist[playlistIndex][1].timeLimit);
		//}
		
		playlistIndex++;
	}
	
	function stopCallback() {
		if (playlistIndex > playlist.length - 1) {
			//setTimeout(function () {
				test.ok(!p.playing(), "stopped playing");
				test.done();
			//}, 110);
		}
	}
};

exports.stopTimeLimit = function (test) {
	var p = new Player();
	
	test.expect(2);
	p.play('resources/100ms.wav', { repeat: true, timeLimit: 0.25 });
	test.ok(p.playing(), "playing");
	
	setTimeout(function () {
		p.stop();
		
		setTimeout(function () {
			test.ok(!p.playing(), "stopped playing");
			test.done();
		}, 10);
	}, 150);
};

exports.stop = function (test) {
	var p = new Player();
	
	test.expect(2);
	p.play('resources/100ms.wav');
	test.ok(p.playing(), "playing");
	
	setTimeout(function () {
		p.stop();
		test.ok(!p.playing(), "stopped playing");
		test.done();
	}, 10);
};

exports.stopPlaylist = function (test) {
	var p = new Player();
	
	test.expect(2);
	
	p.playlist([
		['resources/100ms.wav', { repeat: true, timeLimit: 0.7, playCallback: playCallback }],
		'resources/100ms.wav'
	]);
	
	test.ok(p.playing(), "playing");
	
	function playCallback() {
		p.stop();
		
		setTimeout(function () {
			test.ok(!p.playing(), "stopped playing");
			test.done();
		}, 750);	// Check so it doesn't continue with the playlist
	}
};

exports.playInvalid = function (test) {
	var p = new Player();
	
	test.expect(2);
	p.play('player.js'/*, {
		playCallback: function () {
			console.log('play');
		},
		stopCallback: function () {
			console.log('stop');
		}
	}*/);
	
	test.ok(p.playing(), "playing");
	
	setTimeout(function () {
		test.ok(!p.playing(), "finished playing");
		test.done();
	}, 300);
};

/*exports.playlistInvalid = function (test) {
	var p, playlist, playlistIndex = 0;
	
	p = new Player();
	playlist = [
		['player.js', { playCallback: playCallback, stopCallback: stopCallback }],
		//['player.js', { playCallback: playCallback, stopCallback: stopCallback, repeat: true, timeLimit: 0.5 }],
		['player.js', { playCallback: playCallback, stopCallback: stopCallback }]
	];
	
	test.expect(11);	// 3 * 3 + 2
	
	p.playlist(playlist);
	
	test.ok(p.playing(), "playing");
	
	function playCallback(file, options) {
		test.equal(file, playlist[playlistIndex][0]);
		
		//if (playlist[playlistIndex][1]) {
			test.equal(options.repeat, playlist[playlistIndex][1].repeat);
			test.equal(options.timeLimit, playlist[playlistIndex][1].timeLimit);
		//}
		
		playlistIndex++;
	}
	
	function stopCallback() {
		if (playlistIndex > playlist.length - 1) {
			//setTimeout(function () {
				test.ok(!p.playing(), "stopped playing");
				test.done();
			//}, 110);
		}
	}
};*/