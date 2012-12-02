var Geolocation = {};

Geolocation.watchPositionSuccess = function(data) {
    alert("default watchPositionSuccess");
};

Geolocation.getCurrentPositionSuccess = function(data){
    alert("default getCurrentPositionSuccess");
};

Geolocation.initialize = function(watchPositionSuccess, getCurrentPositionSuccess) {
    Geolocation.watchPositionSuccess = watchPositionSuccess;
    Geolocation.getCurrentPositionSuccess = getCurrentPositionSuccess;
};

Geolocation.watchPosition = function() {
	if(navigator.geolocation) { 
	 //	navigator.geolocation.getCurrentPosition(Geolocation.updatePosition, function(data){ console.log(data)});
   	var timeoutVal = 10 * 1000;
	    navigator.geolocation.watchPosition(
			Geolocation.watchPositionSuccess, 
			Geolocation.showError,
			{ enableHighAccuracy: true, timeout: timeoutVal }
		);
	}
	else {
		alert("Geolocation is not supported by this browser");
	} 
};

Geolocation.getCurrentPosition = function() {
    if(navigator.geolocation) { 
        navigator.getCurrentPosition(Geolocation.getCurrentPositionSuccess);
	}
	else {
		alert("Geolocation is not supported by this browser");
	} 
};

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
