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
};

GAMIFY.Geo.prototype.showCheckpoints = function(checkpoints) {
    console.log("Adding checkpoints:");
    console.log(checkpoints);
}
