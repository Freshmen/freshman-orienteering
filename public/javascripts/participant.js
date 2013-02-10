nokia.Settings.set("appId", "Mek1RWK8L0PLr48gT0al"); 
nokia.Settings.set("authenticationToken", "BU8plLql-XdJ0CmizJSsow");
var map = new nokia.maps.map.Display(
	document.getElementById("mapArea"), {
		components: [ 
		// Behavior collection
		new nokia.maps.map.component.Behavior(),
		new nokia.maps.map.component.ScaleBar()
		],
		// Zoom level for the map
		'zoomLevel': 10,
		// Map center coordinates
		'center': [52.539558, 13.404848] 
	}
);

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		
	}
}