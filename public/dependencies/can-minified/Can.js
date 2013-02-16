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

    /**
     * Create FSIO client after successful login.
     *
     * @throws {NotInitializedError} If not logged in.
     * @returns {object} FSIO client instance.
     */
    Can.prototype.createFsioClient = function() {
        var global_headers = {};
        if(this.api_key)
            global_headers["x-apikey"] = this.api_key;
        return new Fsio(this.config.FSIO_PSK,
                        this.config.FSIO_TICKET_HOST,
                        this.config.FSIO_TICKET_DAC,
                        this.config.FSIO_API_HOST,
                        this.config.FSIO_API_DAC,
                        this.config.FSIO_DATA_HOST,
                        this.config.FSIO_DATA_DAC,
                        this.config.UEB_HOST,
                        global_headers);
    };

    // Return the constructor function
    return Can;
});
