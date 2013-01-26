var https = require('https');

var api;

var updateAllTickets = function() {
	api.tickets.getTickets(function(data){
		console.log("updating " + data.length + " tickets");
		for (var i = 0; i < data.length; i++) {
			(function(ticket) { 
				var options = {
					hostname: 'devapi-fip.sp.f-secure.com',
					port: 443,
					path: '/content/1_0_0/account?fields=Quota',
					headers : {
						'x-apikey' : 'l7xx4b2071526ae34e7fb2d33ff02bb82503',
						'x-dac' : 'DAC_699_WINDOWSPC',
						'x-application-ticket' : ticket.ticket
					}
				};
				var req = https.get(options, function(res) {
					if (res.statusCode == 401) {
						api.tickets.deleteTicket(ticket._id, function(){
							console.log('Expired ticket deleted.');
						});
					} else if (res.statusCode == 200) {
						console.log("updated ticket: " + ticket._id);
					}
				}).on('error', function(e) {
					console.error(e);
				});
			})(data[i]);
		}
	});
}

exports.start = function(refapi, minutes) {
	api = refapi;
	updateAllTickets();
	var interval = minutes * 60 * 1000; // minutes * seconds * milliseconds
	var timer = setInterval(updateAllTickets, interval);
	return timer;
}