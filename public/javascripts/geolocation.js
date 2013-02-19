///// Initialize

var _Geolocation = {};

// Nokia maps apia positioning thing
_Geolocation.positioning =  new nokia.maps.positioning.Manager();

// Add a router and a observer
var router = new nokia.maps.routing.Manager();


_Geolocation.g_distanceToCurrentCheckpoint = -1;
_Geolocation.g_currentRoute = [];

_Geolocation.watching = false;
_Geolocation.g_footPrint = [];
_Geolocation.g_currentPosition = [];


// http://developer.here.net/javascript_api_explorer
_Geolocation.g_initialize = function(watchCallback) {
  if (_Geolocation.positioning) { 
  // Gets the current position, if available the first given callback function is executed else the second
  _Geolocation.positioning.getCurrentPosition(
    // If a position is provided by W3C geolocation API of the browser
    function (position) {
     _Geolocation.g_getCurrentPositionSuccess(position); // we retrieve the longitude/latitude from position
     _Geolocation.g_watchPosition(watchCallback);
     setZoom(map, 13); // 14 is default for street level
     centerMapToCoordinate(map, _Geolocation.g_currentPosition.coords.latitude, _Geolocation.g_currentPosition.coords.longitude);
    }, 
    // Something went wrong we wee unable to retrieve the GPS location
    function (error) {
      _Geolocation.g_showError(error);
      }
    );
  }
};

// Nokia maps wathc
_Geolocation.g_watchPosition = function(callback) {
  if (_Geolocation.positioning) { 
    _Geolocation.positioning.watchPosition(
      callback, 
      // Something went wrong we wee unable to retrieve the GPS location
      function (error) {
        _Geolocation.g_showError(error);
        }
      );
  }
}

// This is the callback for HTML5 geolocation watchPosition function
// It updates the current position in _Geolocation object
_Geolocation.g_watchPositionAction = function(position){
  _Geolocation.g_currentPosition = position;
  _Geolocation.g_footPrint.push(position);
  console.log("Watch success");
  //$("header h1").text(position.coords.latitude);

}

_Geolocation.g_getPosition = function(callback) {
  if (_Geolocation.positioning) { 
  _Geolocation.positioning.getCurrentPosition(
    function (position) {
     _Geolocation.g_getCurrentPositionSuccess(position); // we retrieve the longitude/latitude from position
    }, 
    function (error) {
      _Geolocation.g_showError(error);
      }
    );
  } 
};

_Geolocation.g_getCurrentPositionSuccess = function(position) {
  _Geolocation.g_currentPosition = position;
}

_Geolocation.g_fail = function(message) {
  alert(message);
}

// Function to show the route to the given marker
_Geolocation.g_showRoute = function(observedRouter, key, value){
  if(value == "finished"){
      var routes = observedRouter.getRoutes();
      var coords = [];

      // Lets go through the manouvers, we assume there is one leg
      for(var i = 0; i < routes[0].legs[0].maneuvers.length; i++){
        var lat = routes[0].legs[0].maneuvers[i].position.latitude;
        var lon = routes[0].legs[0].maneuvers[i].position.longitude;
        coords.push([lat, lon]);
      }
  
      //create the default map representation of a route
      var mapRoute = new nokia.maps.routing.component.RouteResultSet(routes[0]).container;
      // Without the markers
      //var mapRoute = new ovi.mapsapi.map.Polyline(routes[0].shape, { width: 3 });

      _Geolocation.g_distanceToCurrentCheckpoint = routes[0].totalLength;
      
      // if distance is smaller than 10 do not show the route
      if(_Geolocation.g_distanceToCurrentCheckpoint>100) {
        // Get bounding box for the route
        map.zoomTo(mapRoute.getBoundingBox(), true);

        // Hack the markers away
        mapRoute.objects.U[1].visibility = false;
        mapRoute.objects.U[2].visibility = false;
        map.objects.add(mapRoute);
        // Remove the old route
        map.objects.remove(_Geolocation.g_currentRoute);
        }

     if(_Geolocation.g_distanceToCurrentCheckpoint != -1)
        $('#distance').text("Distance to Checkpoint: " + _Geolocation.g_distanceToCurrentCheckpoint/1000 + " km");

      _Geolocation.g_currentRoute = mapRoute;

      } else if (value == "failed") {
        _Geolocation.g_distanceToCurrentCheckpoint = -1;
        alert("The routing request failed.");
      }
}

_Geolocation.g_showSessionRoute = function() {
  var coords = [];
  var len = _Geolocation.g_currentRoute.length;

  if(len == 0) {
    console.log("Route does not exist")
    return
  }

  for(var i = 0; i < len; i++)
  {
    var temp = _Geolocation.g_currentRoute[i];
    var lat = temp.coords.latitude;
    var lon = temp.coords.longitude;
    coords.push(new nokia.maps.geo.Coordinate(lat, lon));
  }

  var polyline = new nokia.maps.map.Polyline(coords, lineProps);
  map.objects.add(polyline);
}

router.addObserver("state", _Geolocation.g_showRoute);

// Function to specify route from current position to the given marker
_Geolocation.g_getRoute = function(marker) {
  // Definition of the type of the route
  var modes = [{
    type: "shortest", 
    transportModes: ["pedestrian"],
    options: "avoidTollroad",
    trafficMode: "default"
  }];

  // Add a waypoint to the route
  var waypoints = new nokia.maps.routing.WaypointParameterList();
  // Add current position
  waypoints.addCoordinate(new nokia.maps.geo.Coordinate(_Geolocation.g_currentPosition.coords.latitude, _Geolocation.g_currentPosition.coords.longitude));
  // Add the marker
  waypoints.addCoordinate(new nokia.maps.geo.Coordinate(marker.coordinate.latitude, marker.coordinate.longitude));
  // Call the calulation routine, callback is g_showRoute
  router.calculateRoute(waypoints, modes.slice(0));
}
  
_Geolocation.g_resetRoute = function() {
  map.objects.remove(_Geolocation.g_currentRoute);
  _Geolocation.g_currentRoute = [];
  _Geolocation.g_distanceToCurrentCheckpoint = -1;
}

// Error callback to parse the error number
_Geolocation.g_showError = function(error) {
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
