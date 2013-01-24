var _Geolocation = {};

_Geolocation.watchPositionSuccess = function(data) {
    alert("default watchPositionSuccess");
};

_Geolocation.getCurrentPositionSuccess = function(data){
    alert("default getCurrentPositionSuccess");
};

_Geolocation.initialize = function(watchPositionSuccess, getCurrentPositionSuccess) {
    _Geolocation.watchPositionSuccess = watchPositionSuccess;
    _Geolocation.getCurrentPositionSuccess = getCurrentPositionSuccess;
};

_Geolocation.watchPosition = function() {
	if(navigator.geolocation) { 
	 //	navigator.geolocation.getCurrentPosition(Geolocation.updatePosition, function(data){ console.log(data)});
   	var timeoutVal = 10 * 1000;
	    navigator.geolocation.watchPosition(
			_Geolocation.watchPositionSuccess, 
			_Geolocation.showError,
			{ enableHighAccuracy: true, timeout: timeoutVal }
		);
	}
	else {
		alert("Geolocation is not supported by this browser");
	} 
};

_Geolocation.getCurrentPosition = function() {
    if(navigator.geolocation) { 
        navigator.getCurrentPosition(Geolocation.getCurrentPositionSuccess);
	}
	else {
		alert("Geolocation is not supported by this browser");
	} 
};

_Geolocation.showError = function(error) {
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
