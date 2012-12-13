define(["FsioBase"], function(FsioBase) {

    /**
     * @fileOverview
     *
     * FSIO Search API.
     */

    FsioSearch.prototype = new FsioBase(); // inherit
    FsioSearch.prototype.constructor = FsioSearch;

    /**
     * @class
     * @name FsioSearch
     * @augments FsioBase
     * @see Fsio#search
     */
    function FsioSearch(host, version, dac) {
        this.init(host, "search", version, dac);
    }

    /**
     * Returns a list of objects of any type that match a query.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioSearch.prototype.searchAll = function(
        ticket, complete, params, headers) {
        this.requestWithTicket(ticket, "GET", "", complete, params, headers);
    };

    // Return the constructor function
    return FsioSearch;
});