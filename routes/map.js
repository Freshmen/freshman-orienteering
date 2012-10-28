/*
 * GET map view.
 */

var providers = {
	'GoogleMaps' : {
			'title' : 'Google Maps',
			'api': 'https://maps.googleapis.com/maps/api/js?sensor=true',
			'js' : '/javascripts/googleMaps.js'
	},
	'NokiaMaps' : {
			'title' : 'Nokia Maps',
			'api': 'http://api.maps.nokia.com/2.2.3/jsl.js',
			'js' : '/javascripts/nokiaMaps.js'
	},
	'OpenStreetMaps': {
			'title' : 'openStreetMap',
			'api': 'http://www.openlayers.org/api/OpenLayers.js',
			'js' : '/javascripts/openStreetMap.js'
	}
};


exports.show = function(req, res){
	console.log(req.query.provider);
	res.render('map', { 'provider': providers[req.query.provider] || providers['NokiaMaps']})
};