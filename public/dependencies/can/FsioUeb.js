define(["FsioBase"], function(FsioBase) {

    /**
     * @fileOverview
     *
     * FSIO Notification API.
     */

    FsioUeb.prototype = new FsioBase(); // inherit
    FsioUeb.prototype.constructor = FsioUeb;

    /**
     * @class
     * @name FsioUeb
     * @augments FsioBase
     * @see Fsio#ueb
     */
    function FsioUeb(host, version, uid) {
        this.init(host, "notification", version);
        this.uid = uid;
    }

    /**
     * Create notification context to be used with
     * {@link #waitForNotifications}.
     *
     * @param {string} device_id
     * Identifier of the device making the request.
     * @param {string} auth_token
     * Ticket must be provided only if the deployment in question has been
     * configured to require authenticating notification requests.
     * @param {integer} keep_alive_threshold
     * Time (seconds) after which the server must respond.
     * Constraints: 30..3600.
     * @param {string[]} include_content_types
     * Array of content types client wants to get notified of.
     * E.g. ["fsio:file","fsio:metadata"].
     * @param {integer} [default_throttling_threshold]
     * Default throttling threshold (seconds). Has no effect for the first
     * request made but for subsequent requests a response to the client is not
     * sent until the throttling threshold number of seconds have elapsed since
     * the last response was sent.
     * @param {object[]} [content_specific_thresholds]
     * Content specific throttling thresholds.
     * Array of objects with ContentType and Threshold property.
     * E.g. [{ContentType: "fsio:file",
     *        Threshold: 60},
     *       {ContentType: "fsio:metadata",
     *        Threshold: 30}].
     */
    FsioUeb.prototype.createNotificationContext = function(
        device_id, auth_token, keep_alive_threshold, include_content_types,
        default_throttling_threshold,
        content_specific_thresholds) /** object */ {
            return {
                json: {
                    UserId: this.uid,
                    DeviceId: device_id,
                    KeepAliveThreshold: keep_alive_threshold,
                    IncludeContentTypes: include_content_types,
                    DefaultThrottlingThreshold: default_throttling_threshold,
                    ContentSpecificThresholds: content_specific_thresholds
                },
                auth_token: auth_token
            };
        };

    /**
     * Retrieve notifications. If there are no notifications currently
     * available, complete callback is called when one or more notifications are
     * available or keep alive threshold expires.
     *
     * @param {object} ctx
     * Notification context created in {@link #createNotificationContext}.
     * @param {object[]} last_seen_notifications
     * Client's last seen notifications.
     * Array of objects with ContentType and StateId property.
     * E.g. [{ContentType: "fsio:file",
     *        StateId: "344"},
     *       {ContentType: "fsio:metadata",
     *        StateId: "2012-05-02 10:36:11.618237"}].
     * Initial call has empty 'StateId'.
     * @param {function(jqXHR,textStatus)} complete
     * Complete callback.
     * @param {object} [params]    Query parameters.
     * @param {object} [headers]   Extra headers.
     */
    FsioUeb.prototype.waitForNotifications = function(
        ctx, last_seen_notifications, complete, params, headers) {
        // create json body for request
        var json = ctx.json;
        json.LastSeenNotifications = last_seen_notifications;
        var data = JSON.stringify(json);
        var path = "notifications";
        headers = headers ? headers : {};
        headers["content-type"] = "application/json; charset=UTF-8";
        if(params) {
            // query params for POST
            path += "?" + $.param(params);
        }
        this.requestWithTicket(ctx.auth_token, "POST", path, complete, data,
                               headers);
    };

    // Return the constructor function
    return FsioUeb;
});