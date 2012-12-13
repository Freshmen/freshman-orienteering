define(["FsioBase"], function(FsioBase) {

    /**
     * @fileOverview
     *
     * FSIO Data API.
     */

    FsioData.prototype = new FsioBase(); // inherit
    FsioData.prototype.constructor = FsioData;

    /**
     * @class
     * @name FsioData
     * @augments FsioBase
     * @see Fsio#data
     */
    function FsioData(host, version, dac) {
        this.init(host, "data", version, dac);
    }

    /**
     * Upload data.
     *
     * @param {string} token       FSIO upload token.
     * @param {string} object_name The name of the object being uploaded.
     * @param {string} data        Data to upload.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioData.prototype.upload = function(
        token, object_name, data, complete, params, headers) {
        var path = "upload/" + object_name;
        if(params) {
            // query params for PUT
            path += "?" + $.param(params);
        }
        this.requestWithUploadToken(token, "PUT", path, complete, data,
                                    headers);
    };

    /**
     * Initialize partial upload. Upload ID is returned with 'upload-id'
     * response header.
     *
     * @param {string} token       FSIO upload token.
     * @param {string} object_name The name of the object being uploaded.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioData.prototype.partialUploadInit = function(
        token, object_name, complete, params, headers) {
        var path = "upload_partial/" + object_name;
        if(params) {
            // query params for POST
            path += "?" + $.param(params);
        }
        this.requestWithUploadToken(token, "POST", path, complete, null,
                                    headers);
    };

    /**
     * Query partial upload state. Bytes uploaded so far are returned with
     * 'bytes' key in response json.
     * Applications should normally use {@link #uploadPartially} to upload
     * data partially.
     *
     * @param {string} token       FSIO upload token.
     * @param {integer} upload_id  Upload ID received from
     * {@link #partialUploadInit}.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioData.prototype.partialUploadQuery = function(
        token, upload_id, complete, params, headers) {
        this.requestWithUploadToken(token, "GET",
                                    "upload_partial/" + upload_id,
                                    complete, params, headers);
    };

    /**
     * Upload next part. Use 'content-range' header to specify the part being
     * uploaded, e.g. {'content-range':'bytes 0-10000/100000'}.
     * Applications should normally use {@link #uploadPartially} to upload
     * data partially.
     *
     * @param {string} token       FSIO upload token.
     * @param {integer} upload_id  Upload ID received from
     * {@link #partialUploadInit}.
     * @param {string} data        Data to upload, size must match the
     * 'content-range' header.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioData.prototype.partialUpload = function(
        token, upload_id, data, complete, params, headers) {
        var path = "upload_partial/" + upload_id;
        if(params) {
            // query params for PUT
            path += "?" + $.param(params);
        }
        this.requestWithUploadToken(token, "PUT", path, complete, data,
                                    headers);
    };

    /**
     * Upload data partially, uses internally {@link #partialUploadQuery}
     * and {@link #partialUpload}.
     *
     * @param {string} token       FSIO upload token.
     * @param {integer} upload_id  Upload ID received from
     * {@link #partialUploadInit}.
     * @param {string} data        Data to upload.
     * @param {integer} max_chunk_size Max size of upload chunk in bytes.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioData.prototype.uploadPartially = function(
        token, upload_id, data, max_chunk_size, complete, params, headers) {
        var hdrs = headers ? headers : {};
        // loop until partial upload done or error occured
        (function loop(self) {
            // query first partial upload state
            self.partialUploadQuery(token, upload_id, function(
                jqXHR, textStatus) {
                if(jqXHR.status != 200) {
                    complete(jqXHR, textStatus);
                } else {
                    var start_pos = JSON.parse(jqXHR.responseText)["bytes"];
                    var chunk_size = Math.min(max_chunk_size,
                                              data.length - start_pos);
                    var end_pos = start_pos + chunk_size;
                    var range = "bytes " + start_pos + "-" + end_pos + "/" +
                        data.length;
                    console.log("Uploading with id " + upload_id +
                                  ", range: " + range);
                    hdrs["content-range"] = range;
                    // upload next part
                    self.partialUpload(token, upload_id, data.substring(start_pos, end_pos), function(jqXHR, textStatus) {
                        // done or error?
                        if(jqXHR.getResponseHeader("content-id") ||
                           jqXHR.status != 204) {
                            complete(jqXHR, textStatus);
                        } else {
                            // continue with upload
                            loop(self);
                        }
                    }, params, hdrs);
                }
            });
        })(this);
    };

    /**
     * Download data. To download the specified byte range of the file use
     * 'range' header, e.g. {'range': 'bytes=0-1000'}.
     *
     * @param {string} token       FSIO ticket.
     * @param {string} object_name The name of the object being downloaded.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioData.prototype.download = function(
        ticket, object_name, complete, params, headers) {
        this.requestWithTicket(ticket, "GET", "files/" + object_name,
                               complete, params, headers);
    };

    // Return the constructor function
    return FsioData;
});
