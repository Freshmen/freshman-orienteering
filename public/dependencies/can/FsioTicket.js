define(["FsioBase"], function(FsioBase) {

    /**
     * @fileOverview
     *
     * FSIO Ticket API.
     */

    FsioTicket.prototype = new FsioBase(); // inherit
    FsioTicket.prototype.constructor = FsioTicket;

    /**
     * @class
     * @name FsioTicket
     * @augments FsioBase
     * @see Fsio#ticket
     */
    function FsioTicket(host, version, dac) {
        this.init(host, "ticket", version, dac);
    }

    /**
     * Create ticket with OneID token and SEBE ticket. Ticket is returned with
     * 'Ticket' key in response json.
     *
     * @param {string} oneid_token OneID token.
     * @param {string} sebe_ticket SEBE ticket.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioTicket.prototype.createWithAuth =
        function(oneid_token, sebe_ticket, complete, params, headers) {
            headers = headers ? headers : {};
            headers["content-type"] = "application/json; charset=UTF-8";
            // json body for POST
            var data = JSON.stringify({
                "AuthenticationToken": oneid_token,
                "AuthorizationTicket": sebe_ticket
            });
            // query params for POST
            var path = params ? "?" + $.param(params) : "";
            this.request("POST", path, complete, data, headers);
        };

    /**
     * Create ticket with OneID token and SEBE ticket in browser's cookies.
     * Ticket is returned with 'Ticket' key in response json.
     *
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioTicket.prototype.createWithCookies =
        function(complete, params, headers) {
            headers = headers ? headers : {};
            headers["content-type"] = "";
            var path = "user";
            if(params) {
                // query params for POST
                path += "?" + $.param(params);
            }
            this.request("POST", path, complete, null, headers, true);
        };

    /**
     * Create upload token. Token is returned with 'Token' key in response json.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioTicket.prototype.createUploadToken = function(
        ticket, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "";
        var path = "upload";
        if(params) {
            // query params for POST
            path += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "POST", path, complete, null, headers);
    };

    /**
     * Delete ticket.
     *
     * @param {string} ticket      FSIO ticket to delete.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioTicket.prototype.deleteTicket =
        function(ticket, complete, params, headers) {
            headers = headers ? headers : {};
            headers["content-type"] = "";
            // query params for DELETE
            var path = params ? "?" + $.param(params) : "";
            this.requestWithTicket(ticket, "DELETE", path, complete, null,
                                   headers);
        };

    // Return the constructor function
    return FsioTicket;
});
