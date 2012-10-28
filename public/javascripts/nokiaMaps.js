// Set up is the credentials to use the API:
nokia.Settings.set("appId", "Mek1RWK8L0PLr48gT0al"); 
nokia.Settings.set("authenticationToken", "BU8plLql-XdJ0CmizJSsow");
var map = new nokia.maps.map.Display(
      document.getElementById("mapArea"), {
      	components: [ 
      	             // Behavior collection
      	             new nokia.maps.map.component.Behavior(),
      	             new nokia.maps.map.component.ZoomBar(),
      	             new nokia.maps.map.component.TypeSelector(),
      	             new nokia.maps.map.component.ScaleBar(),
      	             new nokia.maps.positioning.component.Positioning()],
            // Zoom level for the map
            'zoomLevel': 10,
            // Map center coordinates
            'center': [52.539558, 13.404848] 
      }
);
var marker = new nokia.maps.map.StandardMarker(map.center, {
    draggable: true  // Make the marker draggable
});
map.objects.add(marker);
var updatePosition = function(position) {
      var coords = position.coords;
      var marker = 
          new nokia.maps.map.StandardMarker(coords);
      var accuracyCircle = 
          new nokia.maps.map.Circle(coords, coords.accuracy);
      map.objects.addAll([accuracyCircle, marker]);
      map.zoomTo(accuracyCircle.getBoundingBox(), false, "default");
};

document.addEventListener('locationUpdated', function(evt){
  updatePosition(evt.position);
}, false);