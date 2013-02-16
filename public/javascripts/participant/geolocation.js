/**
* geolocation.js
* This file contiants all javascrit needed 
* to interact with the map in the application
*/


window.GAMIFY = window.GAMIFY || {};

GAMIFY.Geo = function(mapContainer) {

  if (nokia || nokia.Settings) {
    nokia.Settings.set("appId", "Mek1RWK8L0PLr48gT0al"); 
    nokia.Settings.set("authenticationToken", "BU8plLql-XdJ0CmizJSsow");
  } else {
    console.log("Could not initialize Nokia Maps.");
  }

  this.mapContainer = mapContainer;
  this.map = new nokia.maps.map.Display(mapContainer, {
    // initial center and zoom level of the map
    center: [52.51, 13.4],
    zoomLevel: 10,
    components: [
    // add the behavior component to allow panning / zooming of the map
      new nokia.maps.map.component.Behavior()
    ]
  }); 
  this.positioning = new nokia.maps.positioning.Manager();
  this.router = new nokia.maps.routing.Manager();
  this.displayUserLocation();
  this.updateUserLocation();
};

GAMIFY.Geo.prototype.addCheckpoints = function(checkpointList) {
  this.checkpoints = [];   
  var checkpointContainer = new nokia.maps.map.Container();
  for (var i=0; i < checkpointList.length; i++) {
    var checkpoint = checkpointList[i];
    if(checkpoint.location) {
      checkpoint.location.latitude = Number(checkpoint.location.latitude); 
      checkpoint.location.longitude = Number(checkpoint.location.longitude);      
    }
    var coords = [checkpoint.location.latitude, checkpoint.location.longitude]; 
    var markerOptions = {};
    if (checkpoint.visited) {
      markerOptions.brush = { color: "#ddd"};
    }
    if (Number(checkpoint.order)) {
      markerOptions.text = checkpoint.order;
    }
    var standardMarker = new nokia.maps.map.StandardMarker(coords, markerOptions);
    checkpointContainer.objects.add(standardMarker);

    this.checkpoints.push(checkpoint);
  }
  this.map.objects.add(checkpointContainer);
  this.map.zoomTo(checkpointContainer.getBoundingBox(),false,true);
}

GAMIFY.Geo.prototype.displayUserLocation = function() {
  var that = this;
  this.positioning.getCurrentPosition(function(position) {
    var coords = position.coords;
    that.userMarker = 
      new nokia.maps.map.StandardMarker(coords, {
        text: "You",
        textPen: {
          strokeColor: "#333"
        },
        brush: {
          color: "#FFF"
        },
        pen: {
          strokeColor: "#333"
        }
      });
    that.userMarker.enableDrag();
    that.map.objects.add(that.userMarker);
  });
}

GAMIFY.Geo.prototype.updateUserLocation = function() {
  var that = this;
  this.positioning.watchPosition(function(position) {
    that.userMarker.set("coordinate", position.coords);
    that.map.update(-1, true);
  });
}

GAMIFY.Geo.prototype.setStartPosition = function(location) {
  var that = this;
  var coords = {};
  coords.latitude = Number(location.latitude);
  coords.longitude = Number(location.longitude);
  var markersIconsUrl = "/images/markers.png";

  var anchor = new nokia.maps.util.Point(16, 30),
    finishIcon = new nokia.maps.gfx.BitmapImage(markersIconsUrl, null, 30, 34, 34, 0),
    finishMarker = new nokia.maps.map.Marker(coords, {
      icon: finishIcon,
      anchor: anchor
    });

  this.map.objects.add(finishMarker);

}

GAMIFY.Geo.prototype.centerOnUser = function() {
  this.map.set("center", this.userMarker.get("coordinate"));
}

GAMIFY.Geo.prototype.checkin = function() {
  console.log("checkin clicked");
  var closest;
  var distance = 1000;
  for (var i=0; i<this.checkpoints.length; i++) {
    var checkpoint = this.checkpoints[i];
    var coords = new nokia.maps.geo.Coordinate(checkpoint.location.latitude, checkpoint.location.longitude);
    var dist = this.userMarker.get("coordinate").distance(coords);
    if (dist < distance) {
      distance = dist;
      closest = checkpoint;
    }
  }
  if (distance > 50) {
    alert("You are not close enough to any checkpoint");
  } else {
    console.log("Closest:");
    console.log(closest);
    console.log("Distance:");
    console.log(distance);
    
    window.location += "/" + checkpoint._id;
  }
}
