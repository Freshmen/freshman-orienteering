function mobileAddCheckpointMarker(map,checkpoint){
	// Create a marker and add it to the map
	var new_coord = [checkpoint.location.latitude, checkpoint.location.longitude];

	var new_marker = new nokia.maps.map.StandardMarker(new_coord, {
	    text: "CHP", // Small label
	    draggable: false,
	    brush: nokia.maps.util.Brush({"color": "#FFFFFF"})
	});

    // Assign click event
    new_marker.addListener( 'click',
            checkPointClickEvent); 

    // Assign mouseenter and mouseout events
    new_marker.addListener('mouseenter',
    	checkPointMouseEnter);

    new_marker.addListener('mouseout',
    	checkPointMouseOut);

    // Assign some data to the marker to know which is which
    //new_marker.set("brush", {"color": "#00f"});
    //new_marker.set("pen", {"color": "#222"});
    new_marker.set("textPen", {"color": "#22200"});
    new_marker.set("text",checkpoint.title);
    new_marker.set("value", checkpoint.order);
	map.objects.add(new_marker);

	return new_marker;
}

function checkPointClickEvent(){

	console.log("Checkpoint " + this.get("value") +  " clicked: " 
				+ this.get("text"));

	/*
	TODO: use this function to make changes on the application logic, 
	namely change the checkpoint to go next
	*/
}

function checkPointMouseEnter(){
	//console.log("enter");
	this.set("textPen", {"color": "#222"});
}

function checkPointMouseOut(){
	//console.log("out");
	this.set("textPen", {"color": "#eee"});
}