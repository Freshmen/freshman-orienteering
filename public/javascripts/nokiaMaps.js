$().ready(function(){
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
	//prevent default behaviours
	map.removeComponent(map.getComponentById("zoom.DoubleClick"));

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

	/* We would like to add event listener on mouse click or finger tap so we check
	 * nokia.maps.dom.Page.browser.touch which indicates whether the used browser has a touch interface.
	 */
	var TOUCH = nokia.maps.dom.Page.browser.touch,
		CLICK = TOUCH ? "dbltap" : "dblclick";
	/* Attach an event listener to map display
	 * push info bubble with coordinate information to map
	 */
	map.addListener(CLICK, function (evt) {
		evt.preventDefault();
		var coord = map.pixelToGeo(evt.displayX, evt.displayY);
		notifiedWindow(coord);
	});
	/**
	 * is allow to add a marker
	 */
	function notifiedWindow(coord){
		// get an instance from notification centre
		var marker_notifier = initialiseNotification();
		// modify notification
		var confirmMsg = marker_notifier.notify({
			message: "Would you like to mark this point?",
			'type': "warning",
			buttons: [
				{'data-role': 'ok', text: 'Yes'},
				{'data-role': 'cancel', text: 'No', 'class': 'default'}
			],
			modal: true,
			ms: 10000,
			opacity : .7
		})
		.on('click:ok', function(){
			this.destroy();
			//add a marker to the coordinator
			addMarker(coord);
			//trigger notification
			marker_notifier.success('A new marker has been created');
		})
		.on('click:cancel', 'destroy');
	}
	/**
	 * add a marker to the location
	 */
	function addMarker(coord){
		// Create a marker and add it to the map
		var marker = new nokia.maps.map.StandardMarker(coord, {
		    text: "Hi!", // Small label
		    draggable: false  
		});
		map.objects.add(marker);
	}

	document.addEventListener('locationUpdated', function(evt){
	  updatePosition(evt.position);
	}, false);
});