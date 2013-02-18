var https = require('https');
var moment = require('moment');

var api;

var updateEventTaskUrls = function() {
	api.events.getEvents(function(data){
		for (var i = 0; i < data.length; i++) {
			(function(event) { 
				var currentTime = moment();
				var eventStartTime = event.starttime;
				var timeDiff = currentTime.diff(eventStartTime, 'minutes');
				console.log(timeDiff);
				if(timeDiff < 0 && timeDiff > -30 ) {
					console.log(event.title);
					/* var options = {
						hostname: 'gami.fi',
						port: 80,
						path: '/api/v2/events/' + event._id + '/tickets',
					} */	
				}
				/*var options = {
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
					}
				}).on('error', function(e) {
					console.error(e);
				});
				console.log("New Event");
				console.log(event);*/
			})(data[i]);
		}
	});
}

exports.start = function(refapi, minutes) {
	api = refapi;
	updateEventTaskUrls();
	var interval = minutes * 60 * 1000; // minutes * seconds * milliseconds
	var timer = setInterval(updateEventTaskUrls, interval);
	return timer;
}
