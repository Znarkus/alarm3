'use strict';

const delay = 1000 * 3600 * 8;
const date = new Date();

date.setTime(new Date().getTime() + delay);
console.log('Alarm set to', date.toString());

setTimeout(function () {
	console.log('Alarm!', new Date());
}, delay);