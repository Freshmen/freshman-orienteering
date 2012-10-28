var map, pos, lon, lat, zoom;

var zoom           = 12;
var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

var showMap = function(){
  map = new OpenLayers.Map('mapArea');
  var mapnik = new OpenLayers.Layer.OSM();
  map.addLayer(mapnik);
  pos = new OpenLayers.LonLat(13.404848, 52.539558)
                      .transform( fromProjection, toProjection);
  map.setCenter(pos, zoom);
}();

var updatePosition = function(position){

  lon = position.coords.longitude;
  lat = position.coords.latitude;

  var pos      = new OpenLayers.LonLat(lon, lat).transform( fromProjection, toProjection);

  var markers = new OpenLayers.Layer.Markers( "Markers" );
  map.addLayer(markers);
  markers.addMarker(new OpenLayers.Marker(pos));

  map.setCenter(pos, zoom);

};

document.addEventListener('locationUpdated', function(evt){
  updatePosition(evt.position);
}, false);
