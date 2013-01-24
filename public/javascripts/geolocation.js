///// Initialize

var _Geolocation = {};

_Geolocation.currentRoute = [];
_Geolocation.currentPosition = [];

_Geolocation.initialize = function(watchCallback) {
    _Geolocation.watchPosition(watchCallback);
    _Geolocation.getCurrentPosition();
};

// Sets a constant watcher to the user location
_Geolocation.watchPosition = function(callback) {
	if(navigator.geolocation) { 
  	var timeoutVal = 2*1000;
    var maxAge = 20*1000;
    // The html native geolocation
	  navigator.geolocation.watchPosition(
    callback, 
		//_Geolocation.watchPositionSuccess,
    _Geolocation.showError,
    {enableHighAccuracy:true, maximumAge:30000, timeout:2000}
		//{ enableHighAccuracy: true, maximumAge:20*1000, timeout: 200 }
		);
	}
	else {
		alert("Geolocation is not supported by this browser");
	} 
};

// Clears the watch of current position
_Geolocation.clearWatch = function() {
  navigator.geolocation.clearWatch();
}

// This is the callback for HTML5 geolocation watchPosition function
// It updates the current position in _Geolocation object
_Geolocation.watchPositionAction = function(position){
  _Geolocation.currentPosition = position;
  _Geolocation.currentRoute.push(position);
  //$("header h1").text(position.coords.latitude);

}

_Geolocation.getCurrentPosition = function() {
    if(navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(_Geolocation.getCurrentPositionSuccess);
	}
	else {
		alert("Geolocation is not supported by this browser");
	} 
};

_Geolocation.getCurrentPositionSuccess = function(position) {
  console.log("position retrieved")
  _Geolocation.currentPosition = position;
}


// Error callback to parse the error number
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
