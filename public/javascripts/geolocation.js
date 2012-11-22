var Geolocation = {};

Geolocation.updatePosition = function(data) {
	console.log(data);
	Geolocation.position = data;
	var evt = document.createEvent('Event');
	evt.initEvent('locationUpdated', true, true);
	evt.position = data;
	document.dispatchEvent(evt);
};

if(navigator.geolocation) { 
	//	navigator.geolocation.getCurrentPosition(Geolocation.updatePosition, function(data){ console.log(data)});
		var timeoutVal = 10 * 1000;
			navigator.geolocation.watchPosition(
				Geolocation.updatePosition, 
				console.log,
				{ enableHighAccuracy: true, timeout: timeoutVal }
			);
}
else {
		alert("Geolocation is not supported by this browser");
}