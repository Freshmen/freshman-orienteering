var updateAllTickets = function(api) {
	api.tickets.getTickets(function(data){
		console.log("updating tickets");
		console.log(data.length + " tickets updated. (not really!)")
	});
}

exports.start = function(api, minutes) {
	updateAllTickets(api);
	var interval = minutes * 60 * 1000; // minutes * seconds * milliseconds
	var timer = setInterval(updateAllTickets, interval);
	return timer;
}