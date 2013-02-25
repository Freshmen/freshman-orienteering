var map;
//A boolean value to check if more markers are allowed
var eventMarked = false;
//A boolean value to check if the event has been created
var eventCreated = false;
var eventMarker;

$().ready(function() {
	// Set up is the credentials to use the API:
	nokia.Settings.set("appId", "Mek1RWK8L0PLr48gT0al"); 
	nokia.Settings.set("authenticationToken", "BU8plLql-XdJ0CmizJSsow");
	map = new nokia.maps.map.Display(
	      document.getElementById("mapArea"), {
	      	components: [ 
	      	             // Behavior collection
	      	             new nokia.maps.map.component.Behavior(),
	      	             //new nokia.maps.map.component.ZoomBar(),
	      	             new nokia.maps.map.component.ScaleBar()],
	            // Zoom level for the map
	            'zoomLevel': 10,
	            // Map center coordinates
	            'center': [52.539558, 13.404848] 
	      }
	);
	//prevent default behaviours
	map.removeComponent(map.getComponentById("zoom.DoubleClick"));

	var marker = null;
	marker = new nokia.maps.map.StandardMarker(map.center, {
	    draggable: true  // Make the marker draggable
	});

	var accuracyCircle = null;

	map.objects.add(marker);

    var watchPositionSuccess = function(data) {
        var evt = document.createEvent('Event');
        evt.initEvent('locationUpdated', true, true);
        evt.position = data;
        document.dispatchEvent(evt);
    };

     _Geolocation.g_initialize(watchPositionSuccess);

     // Callback for location update from geolocation.watchPosition
    document.addEventListener('locationUpdated', function(evt){
	  updatePosition(evt.position);
	  _Geolocation.g_watchPositionAction(evt.position);

	  if(_Geolocation.g_distanceToCurrentCheckpoint != -1)
	  	$('#distance').text("Distance to Checkpoint: " + _Geolocation.g_distanceToCurrentCheckpoint/1000 + " km");
	}, false);

    //_Geolocation.initialize(watchPositionSuccess, getCurrentPositionSuccess);
    //_Geolocation.watchPosition();

    var infoBubbles = null;
    var updatePosition = function(position) {
        removePreviousPosition();
        
	    var contentString = '<div id="content">' +
            '<p> Coordinates:' + position.coords + '</p>' +
            '<p> Timestamp:' + position.timestamp + '</p>' +
            '<p> Accuracy:' + position.coords.accuracy + '</p></div>';

        
        infoBubbles = new nokia.maps.map.component.InfoBubbles();

        var TOUCH = nokia.maps.dom.Page.browser.touch,
            CLICK = TOUCH ? "tap" : "click";
        
        var coords = new nokia.maps.geo.Coordinate(position.coords.latitude, position.coords.longitude);
        marker = new nokia.maps.map.StandardMarker(coords);
        marker.addListener(
            'click',
            function (evt) {
                infoBubbles.addBubble(contentString, marker.coordinate);
            }
        );
        
        var accuracy = position.coords.accuracy;
        accuracyCircle = new nokia.maps.map.Circle(coords, accuracy);

        map.addComponent(infoBubbles);
        map.objects.add(marker);

        if (accuracy < 20) map.objects.add(accuracyCircle);
        //map.zoomTo(accuracyCircle.getBoundingBox(), false, "default");
	};

	
	/* We would like to add event listener on mouse click or finger tap so we check
	 * nokia.maps.dom.Page.browser.touch which indicates whether the used browser has a touch interface.
	 */
	var DBLTOUCH = nokia.maps.dom.Page.browser.touch,
		DBLCLICK = DBLTOUCH ? "dbltap" : "dblclick";
	var TOUCH = nokia.maps.dom.Page.browser.touch,
		CLICK = TOUCH ? "tap" : "click";
	/* Attach an event listener to map display
	 * push info bubble with coordinate information to map
	 */
	map.addListener(DBLCLICK, function (evt) {
		evt.preventDefault();
		var coord = getCoord(map, evt.displayX, evt.displayY);
		notifiedWindow(coord);
	});
	
	/**
	 * is allow to add a marker
	 */
	function notifiedWindow(coord){
		// get an instance from notification centre
		var marker_notifier = initialiseNotification();
		// modify notification
		if (eventMarked == false && eventCreated == false){
		/**	var confirmMsg = marker_notifier.notify({
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
			**/	//add a marker to the coordinator
				eventMarker = addEventMarker(map,coord);
				//trigger notification
				marker_notifier.success('A new marker has been created');
				//initialise events for the marker
				//initEvent(eventMarker);
				//Fill event coordinates on desktop site
				$('#location').val(coord);
				eventCoord = coord;

		/**	})
			.on('click:cancel', 'destroy');
		**/	//don't allow more markers to be added
			eventMarked = true;
		}
		else if (eventCreated == false && eventMarked == true){
			eventMarker.destroy()
			eventMarker = addEventMarker(map,coord);
			//trigger notification
			marker_notifier.success('A new marker has been created');
			//initialise events for the marker
			//initEvent(eventMarker);
			//Fill event coordinates on desktop site
			$('#location').val(coord);
		}
		else if (eventCreated == true && eventMarked == true) {
			var confirmMsg = marker_notifier.notify({
				message: "Would you like to add a checkpoint here?",
				'type': "info",
				buttons: [
					{'data-role': 'ok', text: 'Yes'},
					{'data-role': 'cancel', text: 'No', 'class': 'default'}
				],
				modal: true,
				ms: 10000,
			})
			.on('click:ok', function(){
				this.destroy();
				//add a marker to the coordinator
				var new_marker = addCheckpointMarker(map,coord);
				//trigger notification
				marker_notifier.success('A new marker has been created');
				//initialise events for the marker
				//initEvent(new_marker);
				//Fill event coordinates on desktop site
				createCheckpoint(new_marker);
			})
			.on('click:cancel', 'destroy');

		}
	}
	
	/**
	 * marker events
	 */
	function initEvent(new_marker){
		new_marker.addListener(CLICK,manageEvent,false);
	}

	/**
	 * manage new events
	 */
	function manageEvent(){
		var current_marker = this;
		// get an instance from notification centre
		var marker_notifier = initialiseNotification();
		// modify notification
		var confirmMsg = marker_notifier.notify({
			message: "Would you like to?",
			'type': "warning",
			buttons: [
				{'data-role': 'edit', text: 'Edit'},
				{'data-role': 'remove', text: 'Remove'},
				{'data-role': 'cancel', text: 'No', 'class': 'default'}
			],
			modal: true,
			ms: 10000,
			opacity : .7
		})
		.on('click:edit', function(){
			this.destroy();
			editCheckPoint(current_marker);
		})
		.on('click:remove', function(){
			this.destroy();
			removeCheckPoint(current_marker);
			//empty location field on desktop site
			$('#location').val('');
			//allow more markers to be added
			allowMarkers = true;
		})
		.on('click:cancel', 'destroy');
	}
	/**
	 * when a user click on a marker, he can edit the checkpoint
	 */
	function editCheckPoint(current_marker){
		
	}
	/**
	 * when a user click on a marker, he can remove the marker
	 */
	function removeCheckPoint(current_marker){
		map.objects.remove(current_marker);
	}
	/*
	 * Function to remove exist accuracyCircle from map
	 */
	function removeCircle() {

		if(accuracyCircle){
			map.objects.remove(accuracyCircle);
		}
		
		accuracyCircle = null;
	} 
	/*
	 * Function to remove exist marker from map
	 */
	function removeMarker() {

		if(marker){
			map.objects.remove(marker);
		}
		
		marker = null;
	}

    function removePreviousPosition() {
        if(accuracyCircle){
			map.objects.remove(accuracyCircle);
		}
		
		accuracyCircle = null;

        if(marker){
			map.objects.remove(marker);
		}
		
		marker = null;

        if (infoBubbles){
            map.removeComponent(infoBubbles);
        }
        infoBubbles = null;        
    }

});

function getCoord(map, lat, long){
	var new_coord = map.pixelToGeo(lat, long);
	return new_coord;
}
/**
 * add a marker to the location
 */

function addEventMarker(map, new_coord){
	var new_marker = new nokia.maps.map.StandardMarker(new_coord, {
	    text: "EVT", // Small label
	    draggable: false
	});
	map.objects.add(new_marker);
	return new_marker;
}

function addCheckpointMarker(map, new_coord){
	// Create a marker and add it to the map
	var new_marker = new nokia.maps.map.StandardMarker(new_coord, {
	    text: "CHP", // Small label
	    draggable: false,
	    brush: nokia.maps.util.Brush({"color": "#FFFFFF"})
	});
	map.objects.add(new_marker);
	return new_marker;
}

// Function to set the zoom level of the map
function setZoom(map, zoomLevel){
	if(map.minZoomLevel > zoomLevel || map.maxZoomLevel < zoomLevel){
		console.log("Invalid zoom level" + zoomLevel);
		console.log("Max: " +  map.maxZoomLevel);
		console.log("Min: " +  map.minZoomLevel);
		return;
	}
	map.setZoomLevel(zoomLevel);
}

function centerMapToCoordinate(map, lat, lon){
	map.setCenter([lat, lon]);
}
