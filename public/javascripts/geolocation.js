var Geolocation = {};


Geolocation.showError = function(error) {
  switch(error.code) 
    {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
    };
};


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
				Geolocation.showError,
				{ enableHighAccuracy: true, timeout: timeoutVal }
			);
}
else {
		alert("Geolocation is not supported by this browser");
}