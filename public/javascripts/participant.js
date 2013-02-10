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
		'zoomLevel': 15,
		// Map center coordinates
		'center': [52.539558, 13.404848] 
	}
);

var userMarker;

var showPosition = function(pos) {
	var position = [pos.coords.latitude, pos.coords.longitude]
	userMarker = new nokia.maps.map.StandardMarker(
		position, 
		{ draggable: false }
	);
	map.objects.add(userMarker);
	map.setCenter(position);
	document.getElementById("message-bottom").innerText = "";
}

if (navigator.geolocation) {
	document.getElementById("message-bottom").innerText = "Getting your location";
	navigator.geolocation.getCurrentPosition(showPosition);
}