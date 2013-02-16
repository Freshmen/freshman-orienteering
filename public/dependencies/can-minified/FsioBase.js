define(["FsioVersion"], function(ver) {

    /**
     * @fileOverview
     *
     * Abstract base class for all FSIO namespaces.
     */

    /**
     * Base class constructor. Shouldn't be instantiated directly
     * but via subclassing.
     *
     * @constructor
     * @name FsioBase
     * @protected
     */
    function FsioBase() {}

    // global headers for all requests
    FsioBase.global_headers = {};

    FsioBase.prototype.init = function(host, name, version, dac) {
        this.host = host;
        this.dac = dac;
        this.prefix = "/" + name + "/" + version + "/";
    };

    FsioBase.prototype.request = function(
        type, path, complete, data, headers, withCredentials) {
        headers = headers ? headers : {};
        if(this.dac)
            headers["x-dac"] = this.dac;
        // append global headers
        for(var p in FsioBase.global_headers)
            headers[p] = FsioBase.global_headers[p];
        var settings = {
            url: this.host + this.prefix + path,
            type: type,
            data: data, // query params with GET
            headers: headers,
            complete: [function(jqXHR, textStatus) {
                console.log("in <==\nstatus: " +
                              jqXHR.status +
                              "\nheaders: " +
                              jqXHR.getAllResponseHeaders());
            }, complete],
            beforeSend: function(jqXHR, settings) {
                console.log("out ==> ", settings);
            },
            cache: false,
            xhrFields: {
                withCredentials: withCredentials ? withCredentials : false
            }
        };
        $.ajax(settings);
    };

    FsioBase.prototype.requestWithTicket =
        function(ticket, type, path, complete, data, headers) {
            headers = headers ? headers : {};
            headers["x-application-ticket"] = ticket;
            this.request(type, path, complete, data, headers);
        };

    FsioBase.prototype.requestWithUploadToken =
        function(token, type, path, complete, data, headers) {
            headers = headers ? headers : {};
            headers["x-upload-token"] = token;
            headers["content-type"] = headers["content-type"] ?
                headers["content-type"] : "application/octet-stream";
            this.request(type, path, complete, data, headers);
        };

    // Return the construtor function
    return FsioBase;
});
