
exports.Alarm = function () {
	
	var timer, next_date;
	
	function setDate(date, callback) {
		var next_timestamp = date.getTime();
		next_date = new Date(date.getTime());
		
		//console.log(date.format());
		clearTimeout(timer);
		timer = setTimeout(function(){
			timer = null;
			callback();
		}, next_timestamp - (new Date()).getTime());
	}
	
	function _getNextOccurrence(h, m){
		var d = new Date();
		
		d.setHours(h);
		d.setMinutes(m);
		d.setSeconds(0);
		
		if (d <= new Date()) {
			d.setDate(d.getDate() + 1);
		}
		
		return d;
	}
	
	function setTime(h, m, callback) {
		setDate(_getNextOccurrence(h, m), callback);
	}
	
	function getNext() {
		return next_date;
	}
	
	return {
		setTime: setTime,
		setDate: setDate,
		getNext: getNext
	}
};