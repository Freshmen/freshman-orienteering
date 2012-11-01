var Geolocation = {};

Geolocation.updatePosition = function(data) {
	Geolocation.position = data;
	var evt = document.createEvent('Event');
	evt.initEvent('locationUpdated', true, true);
	evt.position = data;
	document.dispatchEvent(evt);
};

if(navigator.geolocation) { 
	navigator.geolocation.getCurrentPosition(Geolocation.updatePosition, function(data){ console.log(data)});
}
