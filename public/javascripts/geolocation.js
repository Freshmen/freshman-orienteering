var Geolocation = {};

Geolocation.updatePosition = function(data) {
	Geolocation.position = data;
	var evt = document.createEvent('Event');
	evt.initEvent('locationUpdated', true, true);
	evt.position = data;
	document.dispatchEvent(evt);
};

if(navigator.geolocation) { 
	// TESTING WatchPosition - Vidhuran
	//	navigator.geolocation.getCurrentPosition(Geolocation.updatePosition, function(data){ console.log(data)});
	var watchId = navigator.geolocation.watchPosition(Geolocation.updatePosition, function(data){ console.log(data)},{enableHighAccuracy:true, maximumAge:30000, timeout:27000});
}
