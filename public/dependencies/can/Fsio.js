define(["FsioVersion", "FsioBase", "FsioTicket", "FsioContent", "FsioData", "FsioSearch", "FsioUeb"], function(
    ver, FsioBase, FsioTicket, FsioContent, FsioData, FsioSearch, FsioUeb) {

    /**
     * @fileOverview
     *
     * FSIO client.
     */

    var FSIO_API_VERSION = "1_0_0";

    /**
     * Creates an instance of Fsio client.
     *
     * @constructor
     * @name Fsio
     * @this {Fsio}
     * @param {string} uid         User ID.
     * @param {string} psk         Pre-shared key (not used currently).
     * @param {string} ticket_host FSIO Ticket API host.
     * @param {string} ticket_dac  FSIO Ticket API DAC.
     * @param {string} api_host    FSIO API host.
     * @param {string} api_dac     FSIO API DAC.
     * @param {string} data_host   FSIO Data host.
     * @param {string} data_dac    FSIO Data API DAC.
     * @param {string} ueb_host    FSIO UEB host.
     * @param {object} [global_headers] Global headers. Used with all requests.
     * @property {FsioTicket} ticket FSIO Ticket API.
     * @property {FsioContent} content FSIO Content API.
     * @property {FsioData} data FSIO Data API.
     * @property {FsioSearch} search FSIO Search API.
     * @property {FsioUeb} ueb FSIO Notification API.
     */
    function Fsio(uid,
                  psk, // not used
                  ticket_host, ticket_dac,
                  api_host, api_dac,
                  data_host, data_dac,
                  ueb_host,
                  global_headers) {
        this.ticket = new FsioTicket(ticket_host, FSIO_API_VERSION, ticket_dac);
        this.content = new FsioContent(api_host, FSIO_API_VERSION, api_dac);
        this.data = new FsioData(data_host, FSIO_API_VERSION, data_dac);
        this.search = new FsioSearch(api_host, FSIO_API_VERSION, api_dac);
        this.ueb = new FsioUeb(ueb_host, FSIO_API_VERSION, uid);
        FsioBase.global_headers = global_headers;
    }

    /** Get version. */
    Fsio.prototype.version = function() /** string */ {
        return ver.version;
    };

    function _getWorkerStatus(json, key) {
        var worker = json[key];
        if(worker)
            return worker["status"];
    }

    /**
     * Wait for the workers to finish processing uploaded file.
     * Only for testing purposes.
     *
     * @param {string} ticket         FSIO ticket.
     * @param {string} object_name    Name of the uploaded object.
     * @param {string[]} workers      Array of workers, e.g.
     * ["AV","FileTypeWorkerStatus","MetadataWorkerStatus"]
     * @param {integer} timeout_secs  Timeout in seconds.
     * @param {function(statusText)} complete
     * Complete callback, called with 'success', 'error' or 'timedout'.
     */
    Fsio.prototype.waitForWorkers = function(
        ticket, object_name, workers, timeout_secs, complete) {
        var then = new Date().getTime() + (timeout_secs * 1000);
        var params = {
            key: object_name,
            fields: "Items.AV,Items.WorkerStatuses"
        };
        // loop until item scanned or timedout
        (function loop(self) {
            var now = new Date().getTime();
            if(now >= then) {
                complete("timedout");
                return;
            }
            self.search.searchAll(ticket, function(jqXHR, textStatus) {
                if(jqXHR.status != 200) {
                    complete("error");
                    return;
                }
                var errors = 0;
                var pending = 0;
                var items = JSON.parse(jqXHR.responseText)["Items"];
                if(items) {
                    var av = items[0];
                    var ws = items[0]["WorkerStatuses"];
                    for(var i = 0; i < workers.length; i++) {
                        var status = "";
                        if(workers[i] == "AV")
                            status = _getWorkerStatus(av, "AV");
                        else
                            status = _getWorkerStatus(ws, workers[i]);
                        console.log("worker: " + workers[i] +
                                      ", status: " + status);
                        if(status == "pending")
                            pending++;
                        else if(status == "error")
                            errors++;
                    }
                }
                if(0 !== errors) {
                    // worker has failed
                    complete("error");
                } else if(0 === pending) {
                    // all workers done
                    complete("success");
                } else {
                    // try again after one second
                    setTimeout(loop, 1000, self);
                }
            }, params);
        })(this);
    };

    // Return the constructor function
    return Fsio;
});
