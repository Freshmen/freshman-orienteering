var map;
var initialize = function() {
  var mapOptions = {
    zoom: 10,
    center: new google.maps.LatLng(52.539558, 13.404848),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('mapArea'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

var updatePosition = function(position) {
  var pos = new google.maps.LatLng(position.coords.latitude,
                                        position.coords.longitude);
  var marker = new google.maps.Marker({
        map: map,
        position: pos
  });
  var circle = new google.maps.Circle({
    map: map,
    radius: position.coords.accuracy, 
    fillColor: '#AA0000',
    strokeColor: '#AA0000',
    strokeOpacity: 0.4
  });
  circle.bindTo('center', marker, 'position');
  map.setCenter(pos);
  map.setZoom(13);
};

document.addEventListener('locationUpdated', function(evt){
  updatePosition(evt.position);
}, false);