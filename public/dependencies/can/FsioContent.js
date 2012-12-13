define(["FsioBase"], function(FsioBase) {

    /**
     * @fileOverview
     *
     * FSIO Content API.
     */

    FsioContent.prototype = new FsioBase(); // inherit
    FsioContent.prototype.constructor = FsioContent;

    /**
     * @class
     * @name FsioContent
     * @augments FsioBase
     * @see Fsio#content
     */
    function FsioContent(host, version, dac) {
        this.init(host, "content", version, dac);
    }

    /**
     * Get user account info
     *
     * @param {string} ticket      FSIO ticket.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.getUserAccountInfo = function(
        ticket, complete, params, headers) {
        this.requestWithTicket(ticket, "GET", "account", complete,
                               params, headers);
    };

    /**
     * Retrieve information for a file for the user.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the file.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.getFileInfo = function(
        ticket, path, complete, params, headers) {
        this.requestWithTicket(ticket, "GET", "files/" + path, complete,
                               params, headers);
    };

    /**
     * Deletes a file or folder matching the path.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the file to delete.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.deleteFile = function(
        ticket, path, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "";
        var deletepath = "files/" + path;
        if(params) {
            // query params for DELETE
            deletepath += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "DELETE", deletepath, complete,
                               null, headers);
    };

    /**
     * Restore soft-deleted file.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the file to restore.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.restoreFile = function(
        ticket, path, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "";
        var restorepath = "files/" + path;
        if(params) {
            // query params for PUT
            restorepath += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "PUT", restorepath, complete,
                               null, headers);
    };

    /**
     * Move or rename a file or a folder.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} from        Full path of the file or folder to move.
     * @param {string} to          Full path of the new file or folder.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.moveFile = function(
        ticket, from, to, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "application/json; charset=UTF-8";
        // json body for request
        var data = JSON.stringify({
            "Key": "/files/" + to
        });
        var path = "files/" + from;
        if(params) {
            // query params for POST
            path += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "POST", path, complete,
                               data, headers);
    };

    /**
     * Create a renamed clone from an existing file or a past version of an
     * existing file.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the new file.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.cloneFile = function(
        ticket, path, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "";
        var clonepath = "files/" + path;
        if(params) {
            // query params for PUT
            clonepath += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "PUT", clonepath, complete,
                               null, headers);
    };

    /**
     * Create a folder.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the folder to create.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.createFolder = function(
        ticket, path, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "";
        var createpath = "files/" + path;
        if(params) {
            // query params for POST
            createpath += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "POST", createpath, complete,
                               null, headers);
    };

    /**
     * Retrieve the contents of a folder, including any other folders that it
     * contains.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the folder to retrieve.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.listFolder = function(
        ticket, path, complete, params, headers) {
        this.getFileInfo(ticket, path, complete, params, headers);
    };

    /**
     * Returns the most recent file upload events for the user.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.getUserTimeline = function(
        ticket, complete, params, headers) {
        this.requestWithTicket(ticket, "GET", "timeline", complete, params,
                               headers);
    };

    /**
     * Set description and/or user metadata for a file.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {string} path        Full path of the file.
     * @param {string} description Description of the entry.
     * @param {object} metadata    Key-value pairs of user-specified metadata.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.setFileMetadata = function(
        ticket, path, description, metadata, complete, params, headers) {
        headers = headers ? headers : {};
        headers["content-type"] = "application/json; charset=UTF-8";
        var json = {};
        if(null !== description)
            json.Description = description;
        if(null !== metadata)
            json.UserMetadata = metadata;
        var data = JSON.stringify(json);
        var setpath = "files/" + path;
        if(params) {
            // query params for POST
            setpath += "?" + $.param(params);
        }
        this.requestWithTicket(ticket, "POST", setpath, complete,
                               data, headers);
    };

    /**
     * Retrieve file level metadata stored by FSIO for one or more files.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {integer[]} file_ids File IDs.
     * The maximum amount of IDs allowed is 100.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.getFileMetadata = function(
        ticket, file_ids, complete, params, headers) {
        this.requestWithTicket(ticket, "GET",
                               "metadata/file/" + file_ids.join(),
                               complete, params, headers);
    };

    /**
     * Retrieves journal entries. The tracked operations are object creation,
     * deletion, renaming, and changing of the object's content. Changes to an
     * object's metadata are not tracked, with the exception of renames.
     *
     * @param {string} ticket      FSIO ticket.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioContent.prototype.getJournalEntries = function(
        ticket, complete, params, headers) {
        this.requestWithTicket(ticket, "GET", "journal", complete, params,
                               headers);
    };

    // Return the constructor function
    return FsioContent;
});