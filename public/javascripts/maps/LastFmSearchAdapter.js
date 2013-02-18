var LastFmSearchAdapter = {


     APP_KEY: "f605d48b90b0bff487b8f4a6ba3f949f",

     getErrorMessage: function(code) {
         switch(code) {
            case 11: return "Service Offline - This service is temporarily offline. Try again later.";
            case 16: return "There was a temporary error processing your request. Please try again";
            default: return "There was an error processing your request.";
        }
     },

    /**
     * Without a latitude and a longitude, the place cannot be shown on the map
     * This breaks all sorts of things, and, as this is a location-aware application,
     * it can be assumed to be the product of corrupted data and should be filtered out.
     * Uses the ECMA-5 array.filter() method.
     */
    filterEvents: function(events) {
        return events.filter(function(event) {
            return (event.venue.location["geo:point"]["geo:lat"] && event.venue.location["geo:point"]["geo:long"]);
        });
    },

    /**
     * Performs search for events based on passed parameters. Query can be an artist or location, the distinction is
     * made by passing the method parameter. If the search is successful then callback is called with results received
     * from last.fm server, otherwise the function calls errback with error message.
     * @param {String} query Artist or location name, depending on passed params
     * @param {Object} params Hash of parameters
     * @param {String} params.method Differentiates between artist and location search. Possible values:
     * "artist.getevents" and "geo.getevents"
     * @param {Number} params.latitude Latitude for location search
     * @param {Number} params.longitude Longitude for location search
     * @param {Function} callback Success callback
     * @param {Function} errback Error callback
     */
    search: function(query, params, callback, errback) {
        if (LastFmSearchAdapter.APP_KEY === "") {
			alert("Please use a valid Last.fm key");
			errback({message: "Please use a valid Last.fm key"})
		}
		var url = "http://ws.audioscrobbler.com/2.0/?" +
                  "method=" + params.method +
                  "&format=json" +
                  "&limit=25" +
                  "&api_key=" + LastFmSearchAdapter.APP_KEY;

        if (params.latitude && params.longitude) {
            url += "&lat=" + params.latitude + "&long=" + params.longitude;
        }

        if (query) {
            query = query.trim();
        }

        if (params.method === "geo.getevents") {
            if (query) {
                //query is optional
                url += "&location=" + encodeURIComponent(query);
            }
        } else {
            url += "&artist=" + encodeURIComponent(query);
        }
        url += "&callback";

        nokia.mh5.jsonp(url, function (results) {
            /**
             * In case of an error, pass that error to the errback function.
             * In this case, an "error" means an error in the jsonp function itself
             * such as a timeout.
             * Or in other words, an error returned from the server might take the following form:
             * @example
             * "results": {
             *    "error":"Sorry, something went wrong"
             * }
             * Pass this string through to the errback function
             */
            if (results.error) {
                errback({message: LastFmSearchAdapter.getErrorMessage(results.error)});
            } else {
                /**
                 * The only real requirement here is to create a mapping function which puts the
                 * data returned by the search service into the format which is required by the API.
                 * The complexity of the mapping funcion is a product of the similarity of your data
                 * to the format required by the API.
                 * In this example, keys such as "name", "website" and "phone number" are easily accessible
                 * from the search results data format.
                 * "Latitude" and "loingitude" need a bit more work
                 * and the whole "address" needs creating from several other fields
                 */
                var mapFunction = function (event) {
                    var latitude = parseFloat(event.venue.location["geo:point"]["geo:lat"]),
                        longitude = parseFloat(event.venue.location["geo:point"]["geo:long"]),
                        attendance = (event.attendance ? event.attendance : 0),
                        venue = event.venue,
                        icon = venue.image[2]["#text"],
                        name = venue.name,
                        address = [],
                        evl = venue.location,
                        eventImage, artist;

                    /**
                     * we can't tell in advance if the search data will contain street and city details
                     * so simply concatenating strings with commas could lead to trailing commas
                     * far better is to push everything into an array and then array.join() it.
                     */
                    if (evl.street) {
                        address.push(evl.street);
                    }
                    if (evl.city) {
                        address.push(evl.city);
                    }

                    address = address.join(", ");

                    /**
                     * In this example, the results set contains multiple image resolutions.
                     * We extract the "medium" sized ones.
                     */
                    if (event.image && event.image.length > 0) {
                        eventImage = event.image.filter(function(imageData) {
                            return (imageData.size === "medium");
                        })[0]["#text"];
                    }

                    artists = Array.isArray(event.artists.artist) ? event.artists.artist : [event.artists.artist];
                    for (var i = 0, len = artists.length; i < len; i++) {
                        artists[i] = {
                            name: artists[i]
                        };
                    }

                    return {
                        eventId:            event.id,
                        eventName:          event.title,
                        hasOwnerContent:    false,
                        address:            address,
                        mapIcon:            "img/marker.png",
                        eventImage:         eventImage,
                        latitude:           latitude,
                        longitude:          longitude,
                        name:               name,
                        website:            venue.website,
                        phone:              venue.phonenumber,
                        startDate:          event.startDate.split(" ").splice(0,4).join(" ") || "",
                        attendance:         attendance,
                        artists:            artists
                    };
                };
                /**
                 * the API requires the results list to be an array.
                 * In this example, the search service returns a results set as an array
                 * and a single result as an object.
                 * So.. if it's a single result, put it in an array of length 1
                 */
                results = results.events && results.events.event ? [].concat(results.events.event) : [];

                /**
                 * filter the results to exclude anything without a latitude and longitude
                 */
                results = LastFmSearchAdapter.filterEvents(results);
                callback({"results": results.map(mapFunction)});
            }

        });
    },

    /**
     * Returns artist's details.
     * @param {String} artistName Name of the artis
     * @param {Function} callback Function called after successful query, the result is passed as a parameter
     * @param {Function} errback Function called when error occurs, error message is passed as a parameter
     */
    getArtistInfo: function(artistName, callback, errback) {
        var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName +
                  "&format=json&api_key=" + LastFmSearchAdapter.APP_KEY + "&callback";
        artistName = encodeURIComponent(artistName);
        nokia.mh5.jsonp(url, function (result) {
            if(result.error){
                errback({message: LastFmSearchAdapter.getErrorMessage(results.error)});
            } else {
                callback(result.artist);
            }
        });
    },

    /**
     * Returns top albums for given artist.
     * @param {String} artistName Name of the artis
     * @param {Function} callback Function called after successful query, the result is passed as a parameter as an
     * array
     * @param {Function} errback Function called when error occurs, error message is passed as a parameter
     */
    getTopAlbums: function(artistName, callback, errback) {
        var url = "http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=" + artistName +
                  "&format=json&api_key=" + LastFmSearchAdapter.APP_KEY + "&callback";
        artistName = encodeURIComponent(artistName);
        nokia.mh5.jsonp(url, function (result) {
            if(result.error){
                errback({message: LastFmSearchAdapter.getErrorMessage(results.error)});
            } else {
                var albums = result.topalbums.album || [];
                if (!Array.isArray(albums)) {
                    albums = [albums];
                }
                callback(albums);
            }
        });
    }
};
