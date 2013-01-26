define(["CanVersion", "Fsio"], function(ver, Fsio) {

    /**
     * @fileOverview
     *
     * CAN client.
     */

    /**
     * Create an instance of CAN client.
     *
     * @constructor
     * @name Can
     * @this {Can}
     * @param {object} config Can config.
     * @param {string} api_key Developer API key.
     * @param {string} api_key_secret Developer API key secret.
     * @throws {InvalidParamError} If missing parameter.
     * @throws {InvalidConfigError} If invalid config.
     */
    function Can(config,
                 api_key,
                 api_key_secret /* not used currently */) {
        if(!config)
            throw { name:"InvalidParamError", message:"Missing parameter" };
        this._checkConfig(config);
        this.config = config;
        // XXX: API key should be hashed with given secret.
        // But we don't have any crypto in js...
        this.api_key = api_key;
        this.can_login_url = null;
        this.uuid = null;
    }

    Can.prototype._checkConfig = function(config) {
        if(!config.ONEID_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing ONEID_HOST" };
        if(!config.SEBE_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing SEBE_HOST" };
        if(!config.FSIO_PSK)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_PSK" };
        if(!config.FSIO_TICKET_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_TICKET_HOST" };
        if(!config.FSIO_TICKET_DAC)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_TICKET_DAC" };
        if(!config.FSIO_API_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_API_HOST" };
        if(!config.FSIO_API_DAC)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_API_DAC" };
        if(!config.FSIO_DATA_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_DATA_HOST" };
        if(!config.FSIO_DATA_DAC)
            throw { name:"InvalidConfigError",
                    message:"Missing FSIO_DATA_DAC" };
        if(!config.UEB_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing UEB_HOST" };
        if(!config.CP_LINK_HOST)
            throw { name:"InvalidConfigError",
                    message:"Missing CP_LINK_HOST" };
        if(!config.APPLICATION_FAMILY_ID)
            throw { name:"InvalidConfigError",
                    message:"Missing APPLICATION_FAMILY_ID" };
        if(!config.ONEID_APP_ID)
            throw { name:"InvalidConfigError",
                    message:"Missing ONEID_APP_ID" };
        if(!config.OPERATOR_ID)
            throw { name:"InvalidConfigError",
                    message:"Missing OPERATOR_ID" };
    };

    Can.prototype._createHeaders = function() {
        var headers = {};
        if(this.api_key)
            headers["x-apikey"] = this.api_key;
        return headers;
    };

    Can.prototype._request = function(type, url, data, headers, complete) {
        var settings = {
            url: url,
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
            xhrFields: {
                withCredentials: true
            }
        };
        $.ajax(settings);
    };

    // get UUID from OneID
    Can.prototype._getUUID = function(complete) {
        var url = this.config.ONEID_HOST +
            "/OneID/user/2_0_0/scim/v1/Users/current";
        var headers = this._createHeaders();
        this._request("GET", url, null, headers, function(
            jqXHR, textStatus) {
            if(jqXHR.status != 200) {
                console.log("Failed to get UUID from OneID: " + jqXHR.status);
                console.log(jqXHR.responseText);
            }
            complete(jqXHR, textStatus);
        });
    };

    // get SEBE ticket
    Can.prototype._getSEBETicket = function(complete) {
        var url = this.config.SEBE_HOST +
            "/ticketing/services/spi/tickets/sync";
        var data = {
            operatorId: this.config.OPERATOR_ID,
            version: 55
        };
        var headers = this._createHeaders();
        this._request("GET", url, data, headers, function(
            jqXHR, textStatus) {
            if(jqXHR.status != 200) {
                console.log("Failed to get SEBE ticket: " + jqXHR.status);
                console.log(jqXHR.responseText);
                var error = $(jqXHR.responseText).find("code").text();
                // not registered yet?
                if(error == 6030) {
                    console.log("User is not registered yet");
                    // XXX: SEBE registration API requires OneID token
                    // in xml body. But we cannot access 'HttpOnly' cookie
                    // from JavaScript.
                }
            }
            complete(jqXHR, textStatus);
        });
    };

    /**
     * Get URL for OAuth login. After successful login 'authenticationToken' is
     * returned via cookies in response. Use {@link #login} to authenticate
     * user.
     *
     * @param {string} post_auth_url Url to load after successful login.
     * @param {function(status,url)} complete
     * Complete callback with http status code and url.
     */
    Can.prototype.getLoginUrl = function(post_auth_url, complete) {
        if(this.can_login_url) {
            complete(200, this.can_login_url);
        } else {
            var url = this.config.ONEID_HOST +
                "/OneID/sso/2_0_0/discovery/providers";
            var data = {
                app_id: this.config.ONEID_APP_ID,
                operator_key: this.config.OPERATOR_ID
            };
            this._request("GET", url, data, this._createHeaders(), function(
                jqXHR, textStatus) {
                if(jqXHR.status != 200) {
                    console.log("Failed to get login url: " + jqXHR.status);
                    console.log(jqXHR.responseText);
                    complete(jqXHR.status);
                } else {
                    var json = JSON.parse(jqXHR.responseText);
                    var urlbase =
                        json["providers"][0]["methods"][0]["authorize"];
                    data.redirect_url = post_auth_url;
                    this.can_login_url = urlbase + "?" + $.param(data);
                    complete(jqXHR.status, this.can_login_url);
                }
            });
        }
    };

    /**
     * Login after cookies have been populated with authentication token.
     *
     * @param {function(status)} complete
     * Complete callback with http status code.
     */
    Can.prototype.login = function(complete) {
        (function(self) {
            // get first UUID from OneID (we need it for UEB)
            self._getUUID(function(jqXHR, textStatus) {
                if(jqXHR.status != 200) {
                    complete(jqXHR.status);
                } else {
                    // store UUID
                    self.uuid = JSON.parse(jqXHR.responseText)["id"];
                    console.log("Parsed UUID: " + self.uuid);
                    // get SEBE ticket
                    self._getSEBETicket(function(
                        jqXHR, textStatus) {
                        complete(jqXHR.status);
                    });
                }
            });
        })(this);
    };

    /** Get user UUID after successful login. */
    Can.prototype.getUserUuid = function() /** string */ {
        return this.uuid;
    };

    /**
     * Create FSIO client after successful login.
     *
     * @throws {NotInitializedError} If not logged in.
     * @returns {object} FSIO client instance.
     */
    Can.prototype.createFsioClient = function() {
        if(!this.uuid)
            throw { name:"NotInitializedError", message:"No UUID" };
        var global_headers = {};
        if(this.api_key)
            global_headers["x-apikey"] = this.api_key;
        return new Fsio(this.uuid,
                        this.config.FSIO_PSK,
                        this.config.FSIO_TICKET_HOST,
                        this.config.FSIO_TICKET_DAC,
                        this.config.FSIO_API_HOST,
                        this.config.FSIO_API_DAC,
                        this.config.FSIO_DATA_HOST,
                        this.config.FSIO_DATA_DAC,
                        this.config.UEB_HOST,
                        global_headers);
    };

    /**
     * Create user ticket for FSIO API. When ticket has expired FSIO API calls
     * return http status 401 with 128 as FSIO error code.
     *
     * @param {object} fsio FSIO client.
     * @param {function(status,ticket)} complete
     * Complete callback with http status code and ticket.
     * @param {integer} [ttl] TTL for the ticket in seconds (1800-3600).
     */
    Can.prototype.createFsioUserTicket = function(fsio, complete, ttl) {
        var params = {};
        if(ttl)
            params.ttl = ttl;
        (function() {
            fsio.ticket.createWithCookies(function(jqXHR, textStatus) {
                if(jqXHR.status == 200) {
                    console.log(jqXHR.responseText);
                    var ticket = JSON.parse(jqXHR.responseText)["Ticket"];
                } else {
                    console.log("Failed to get FSIO ticket: " + jqXHR.status);
                    console.log(jqXHR.responseText);
                }
                complete(jqXHR.status, ticket);
            }, params);
        })();
    };

    // Return the constructor function
    return Can;
});
