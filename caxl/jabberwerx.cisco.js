

/*build/dist/CAXL-debug-2014.04.10787/src/jabberwerx.cisco.js*/
/**
 * filename:        jabberwerx.cisco.js
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2009-2011 Cisco Systems, Inc.  All Rights Reserved.
 */

;(function(jabberwerx) {

	/**
	 * @namespace
	 * <p>Cisco AJAX XMPP Library is an easy to use, AJAX-based XMPP client. This namespace
	 * contains quick contacts subscription and controls.<p>
	 *
	 * <h3>Configuration</h3>
     * See {@link jabberwerx}
	 */
    jabberwerx.cisco = {
        /**
        * Cisco extensions version
        * @property {String} version
        */
    version: '2014.04.0',

        /**
         * Internal config settings.
         *
         * @private
         */
        _config: {},

        /**
         * if library needs to do something interesting on load
         *
         * @private
         */
        _init: function() {
            jabberwerx._config.cisco = jabberwerx.$.extend(true, {}, this._config);
            this._inited = true;
        }
    };

    /**
     * Adding table module to allowed XHTML
     */
    jabberwerx.$.extend(jabberwerx.xhtmlim.allowedTags,{
        caption:    ["style"],
        table:      ["style", "border", "cellpadding", "cellspacing", "frame", "summary", "width"],
        td:         ["style", "align", "char", "charoff", "valign", "abbr", "axis", "colspan", "headers", "rowspan", "scope"],
        th:         ["style", "abbr", "axis", "colspan", "headers", "rowspan", "scope"],
        tr:         ["style", "align", "char", "charoff", "valign"],
        col:        ["style", "align", "char", "charoff", "valign", "span", "width"],
        colgroup:   ["style", "align", "char", "charoff", "valign", "span", "width"],
        tbosy:      ["style", "align", "char", "charoff", "valign"],
        thead:      ["style", "align", "char", "charoff", "valign"],
        tfoot:      ["style", "align", "char", "charoff", "valign"]
    });

    jabberwerx.cisco._init();
})(jabberwerx);

/*build/dist/CAXL-debug-2014.04.10787/src/cupha.js*/
/**
 * filename:        cupha.js
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2009-2013 Cisco Systems, Inc.  All Rights Reserved.
 */

;(function(jabberwerx) {
    /**
     * @private to this file; constants and helper functions
     */
    /**
     * @private
     * CUPHA logger helper function
     */
    function __log(msg) {
        jabberwerx.util.debug.log("[jabberwerx.cisco.cupha]: " + msg);
    };

    /**
     * @private CUPHA localstorage value prefix to work around storage parsing
     */
    var CUPHA_PREFIX = "caxl::";
    /**
     * localstorage convenience functions for persisting home/backup nodes
     */
    /**
     * @private
     * throw exception if localstorage is not ready
     */
    function __checkStore() {
        if (!jabberwerx.$.jStore || !jabberwerx.$.jStore.isReady || !jabberwerx.$.jStore.CurrentEngine.isReady) {
            throw new jabberwerx.util.JWStorageRequiresjQueryjStoreError();
        }
    };
    /**
     * @private
     * Store user node info to localstorage
     */
    function __storeNodeInfo(key, value) {
        __checkStore();
        // Hack: When the data saved is of format IP Address, we get exceptions when reading its saved value. So adding a prefix here.
        value = CUPHA_PREFIX + value;
        jabberwerx.$.jStore.store(key,value);
    };
    /**
    * @private
    * Remove user node info in localstorage
    */
    function __removeNodeInfo(key) {
        __checkStore();
        jabberwerx.$.jStore.remove(key);
    };
    /**
     * @private
     * Get stored user's home/backup node
     * @returns {String|null} node info or null if no value was found in storage
     * for the provided key.
     */
    function __getNodeInfo(key) {
        __checkStore();

        var value = jabberwerx.$.jStore.store(key);

        if(typeof(value) == "string") {
            value = value.substring(CUPHA_PREFIX.length, value.length);
        } else {
            value = null;
        }
        return value;
    };

    /**
    * @namespace
    * <p> All constants, functions and classes required for
    * Cisco Unified Presence High Availability CAXL.
    *
    * CUP HA CAXL 8.6.1 is fully implemented within this namespace. Several CAXL
    * classes and configuration options are overriden to provide functionality.</p>
    *
    * <h3>Cisco Unified Presence High Availability</h3>
    * See <a href="../cupIntegrationGuide.html" target="blank">CUP CAXL 8.x Integration Guide</a>
    * for detailed information on CUP HA deployment and configuration.
    * It is highly recommended CUP HA CAXL developers carefully study the
    * integration guide. All HA functionality and protocols are defined therein.
    *
    * CUP HA CAXL supports the Cisco Unified Presence multi-node/multi-cluster
    * deployment model. This support includes high-availability failover
    * protection provided by an enabled dual-node deployment within a
    * subcluster. CUP CAXL internally determines the best connection for a
    * user using two specifically configured "Service Discovery (SD)" CUP servers.
    *
    * Service Discovery requires that CAXL is configured with two SD nodes:
    *   Primary SD Node: This is a Cisco Unified Presence server to which CAXL
    *                    can connect to determine the home & backup node
    *                    information for a given user. The primary node is the
    *                    Cisco Unified Presence server used by CAXL under normal
    *                    conditions.
    *   Secondary SD Node: This is an alternative Cisco Unified Presence server
    *                      to which CAXL can connect to determine the home &
    *                      backup node information for a given user. The
    *                      secondary node is used by CAXL if for some reason
    *                      the primary node is unavailable.
    *
    * In a high-availability deployment a user may have two associated
    * Cisco Unified Presence nodes:
    *   home node: This is the Cisco Unified Presence server to which a user
    *              would normally connect.
    *   backup node: This is the Cisco Unified Presence server to which a user
    *                would connect if their home node is unavailable.
    * CAXL internally determines both home & backup nodes from Service Discovery.
    *
    * <h3>Configuration</h3>
    * See <a href="../cupIntegrationGuide.html" target="blank">CUP CAXL 8.x Integration Guide</a>
    * for detailed description of CUP HA configuration options.
    *
    * For complete API compatablility with core CAXL, CUP HA CAXL leverages
    * the existing httpBindingURL configuration option. In addition to the HA
    * discovery options users may specify a connection timeout.
    *
    * CUP HA CAXL adds the following configuration options:
    * <table>
    * <tr>
    *  <th>Name</th>
    *  <th>Default</th>
    *  <th>Description</th>
    * </tr>
    * <tr>
    *  <td>serviceDiscoveryEnabled</td>
    *  <td>false</td>
    *  <td></td>
    * </tr>
    * <tr>
    *  <td>httpBindingURL_secondary</td>
    *  <td>/httpbinding</td>
    *  <td>Description goes here</td>
    * </tr>
    * <tr>
    *  <td>bindRetryCountdown</td>
    *  <td>30</td>
    *  <td>Number of seconds timeout between sending a bind resource request
    * and receiving the response from server. If no response from server after this timeout period,
    * a reconnect operation will be processed.
    * If {bindRetryCountdown} is less than or equal 0, the default value
    * jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT will be used.
    * </td>
    * </tr>
    * </table>
    * See further {@link jabberwerx}
    *
    * If Service Discovery enabled, Primary and Secondary SD nodes are provided
    * to the client through the primary and secondary httpBindingURL options whose
    * values may be:
    *       BOSH URL - FQDN or IP address of a BOSH server.
    *       SD Node - An HTTP proxied node name of the SD server ("/node-sd1")
    *       SD Node URL - A FQDN BOSH URL with the SD node specified instead of
    *                     a host. CUPHA CAXL will construct an appropriate BOSH
    *                     address. ("https://node-sd1:7335/httpbinding")
    *
    * Users should review the Proxy vs CORS discussion in
    * <a href="../cupIntegrationGuide.html" target="blank">CUP CAXL 8.x Integration Guide</a>
    *
    * NOTE: jabberwerx.util.validate namespace is NOT defined. Orginially
    *       defined in CUP HA CAXL, the namespace did not contain any non-private
    *       members. Hence no need for jabberwerx.cisco.cupha support needed.
    */
    jabberwerx.cisco.cupha = {
        /**
         * @private
         *
         * Retrieve persisted home and backup nodes.
         *
         * Uses the given jid as key to lookup home and backup nodes in
         * localstore. Returns an object
         * {
         *      home: {String|null|undefined},
         *      backup: {String|null|undefined}
         * }
         *
         * @param jid {String | jabberwerx.JID} jid key
         * @returns {Object} a simple object containing home and backup nodes.
         */
        _getPersistedNodes: function(jid) {
            var result = {home: undefined, backup: undefined};
            try {
                jid = jid && jabberwerx.JID.asJID(jid).getBareJIDString();
                result.home = __getNodeInfo('_jw_store_.cup.sd.home.'+ jid) || null;
                result.backup = __getNodeInfo('_jw_store_.cup.sd.backup.'+ jid) || null;
            } catch (ex) {
                __log("Could not fetch persisted node information from localstorage.");
            }
            __log("Stored home node is: " + result.home);
            __log("Stored backup node is: " + result.backup);
            return result;
        },
        /**
         * @private
         *
         * Writes the given home and backup nodes to localstorage using the
         * given jid as a key.
         *
         * "nodes" parameter is expected to be a simple object:
         * {
         *      home: {String|null|undefined},
         *      backup: {String|null|undefined}
         * }
         *
         * If home or back nodes are undefined, null or empty the key is removed
         * from localstorage.
         *
         * @param {Object} nodes The home and backup nodes to persist
         */
        _setPersistedNodes: function(jid, nodes) {
            var home = (nodes && nodes.home) || null;
            var backup = (nodes && nodes.backup) || null;
            jid = (jid && jabberwerx.JID.asJID(jid).getBareJIDString()) || null;
            if (jid) {
                try {
                    __removeNodeInfo('_jw_store_.cup.sd.home.' + jid);
                    __removeNodeInfo('_jw_store_.cup.sd.backup.' + jid);
                    if (home) {
                        __storeNodeInfo('_jw_store_.cup.sd.home.'+ jid, home);
                    }
                    if (backup) {
                        __storeNodeInfo('_jw_store_.cup.sd.backup.'+ jid, backup);
                    }
                } catch (ex) {
                    __log("Could not persist home and backup nodes: " + ex.message);
                }
            }
        },

         /**
         * @private
         *
         * Normalize and parse the given url using rules defined in integration
         * guide and 8.6.1 source
         *  If given URL is undefined, null or empty the function returns
         *      an initialized but empty result object
         *  otherwise the protocol, host and path are parsed from URL.
         *  If given URL has an IPv4 host the result.isIP flag is set to true
         *       and hostname, port are parsed from host and the result returned.
         *  If the given URL host can be validated as a DNS host
         *      the hostname and port are parsed from the host
         *      The cupNode and cupDomain are parsed from the hostname (first
         *      subdomain -> cupNode, remaining domain -> cupDomain)
         * finally if URL host is neither IPv4 nor DNS then the funciton assumes
         * IPv6 and doesn't attemt to further parse the host.
         *
         * @param {String} url The full or partial URL to parse
         * @returns {Object} parsed URL
         *          {original, protocol, host, hostname, port, path, cupNode, cupDomain, isIP}
         *
         * NOTE: the returned parsed URL's toString function
         */
        _parseURL: function(url) {
            var result = {
                original: url,
                protocol: "",
                host: "",
                hostname: "",
                port: "",
                path: "",
                cupNode: "",
                cupDomain: "",
                isIP: false
            }

            if (!url) {
                //nothing to do, return empty URL
                return result;
            }

            var purl = jabberwerx.Stream.URL_PARSER.exec(url);
            if (!purl) {
                return result;
            }
            result.protocol = purl[1] || "";
            result.path = purl[3] || "";
            result.host = purl[2] || "";

            // Avoid the IPv6 validation by assuming a non empty, non IPv4, non DNS host
            // is likely IPv6. Warn the user about the assumption and move on.
            if (result.host) {
                result.isIP = jabberwerx.cisco.cupha.IPv4_PATTERN.test(result.host);
                if (result.isIP) {
                    var parts = result.host.split(':');
                    if (parts.length > 1) {
                        result.hostname = parts[0];
                        result.port = parts[1];
                    } else {
                        result.hostname = result.host;
                    }
                } else { //not IPv4
                    // hostname fails --> IPv6
                    result.isIP = !jabberwerx.cisco.cupha.DNS_HOST_PATTERN.test(result.host);
                    //IPv6 does not have a hostname or port parts, just host
                    if (result.isIP) {
                        jabberwerx.util.debug.warn("CUPHA: Assuming '" + result.host + "' is an IPv6 address. If this is not an IPv6 address there is likely a configuration issue.");
                    } else {
                        //Otherwise DNS, split on subdomains and cache node and domain for later processing
                        var parts = result.host.split(':');
                        if (parts.length > 1) {
                            result.hostname = parts[0];
                            result.port = parts[1];
                        } else {
                            result.hostname = result.host;
                        }
                        parts = result.hostname.split(".");
                        if (parts.length == 1) {
                            result.cupNode = parts[0];
                        } else if (parts.length == 2) {
                            //todo TLD check before assuming we have a FQDN
                            result.cupDomain = parts.join(".");
                        } else {
                            //todo second level domain check
                            result.cupNode = parts[0];
                            parts = parts.slice(1);
                            result.cupDomain = parts.join(".");
                        }
                    }
                }
            }
            return result;
        },

        /**
         * Generate a URL from the given parsed URL object.
         *
         * @param {Object} purl - Result of a call to _parseURL
         * @returns {String} A partial or full URL. May not be legal or valid.
         */
        _buildURL: function(purl) {
            var retstr = purl.protocol + (purl.protocol ? "//" : "");
            if (purl.isIP) {
                if (purl.hostname) {
                    retstr += purl.hostname; //ipv4
                    retstr += (purl.port ? ":" : "") + purl.port;
                } else {
                    retstr += purl.host; //ipv6
                }
            } else {
                if (!purl.cupNode && !purl.cupDomain) {
                    retstr += purl.hostname;
                } else {
                    retstr += (purl.cupNode + ((purl.cupNode && purl.cupDomain) ? "." : "") + purl.cupDomain);
                }
                retstr += (purl.port ? ":" : "") + purl.port;
            }
            retstr += (purl.path ? "/" : "") + purl.path;
            return retstr;
        },

        /**
         * @private
         * Return a new options object derived from the given connection
         * parameters and suitable for stream open.
         *
         * Constructs a new object from the given connection parameters, copying
         * any stream relevent properties and ignoring all others.
         * Allows password to be kept hidden from stream for example.
         *
         * NOTE: This function INTERCEPTS the
         *       {@link jabberwerx.Client._filterStreamOpts} function.
         *
         * NOTE: Review doc/api/cupIntegrationGuide.html for a full discussion
         *       of CUP HA Service Discovery nodes.
         *
         * NOTE: CAXL may be deployed in one of two ways: the BOSH URL is a
         *       proxied path ("/httpbinding") which is mapped to the actual
         *       URL in the web server, or through CORS where URL is FQDN
         *       ("http(s)://primary-sd-node.example.com:7335/httpbinding").
         *       This function will construct a URL that will work correctly
         *       in either case.
         *
         * Given a service discovery URL (SD URL) {protocol}//{node | fqdn | ipaddress}[:port][/path]
         * and home or backup node {cupnode | fqdn | path | ipaddress} Construct
         * a BOSH URL using the following rules:
         *
         * If node is  null, undefined or empty the BOSH URL is the SD URL
         *  http(s)://sdnode1.cisco.com:7335/httpbinding + "" --> http(s)://sdnode1.cisco.com:7335/httpbinding
         *
         * If SD URL is a path only and node *could* be a path, but is not actually a path ((no protocol, not IP)) return a pathy node
         * /sd-primary + "node.cisco.com" -> /node.cisco.com
         *
         * If node is a path then the BOSH URL is simply the node (core CAXL will finish construction of BOSH URL)
         *  http(s)://sdnode1.cisco.com:7335/httpbinding + "/cupnodea" --> /cupnodea
         *
         * If the node is an IP address the BOSH URL is constructed by replacing the SD URL's hostname with the node.
         *  http(s)://sdnode01.cisco.com:7335/httpbinding + "127.0.0.1" --> http(s)//127.0.0.1:7335/httpbinding
         * if the SD URL is an IP address the BOSH URL is constructed by replacing the SD URL's hostname with the node
         *  http(s)://127.0.0.1:7335/httpbinding + "cupnodea.cisco.com" --> http(s)://cupnodea.cisco.com:7335/htppbinding
         *
         * if SD URL and node share a common subdomain (node is fqdn) the BOSH URL is constructed by replacing the SD's hostname with node
         *  http(s)://sdnode1.cisco.com:7335/httpbinding + "cupnodea.cisco.com" --> http(s)://cupnodea.cisco.com/httpbinding
         * If the node is a cupnode  the BOSH URL is constructed by replacing SD's cupnode with node (by prepending SD's domain with node)
         *  http(s)://sdnode1.cisco.com:7335/httpbinding + "cupnodea" --> http(s)://cupnodea.cisco.com:7335/httpbinding
         *
         * @param {String} sdURL The Service Discovery BOSH URL used as base of new URL
         * @param {String} node The users home or backup node
         * @returns {String} newly computed binding URL
         */
        _computeURL: function(sdURL, node) {
            var result = "";
            if (!node) {
                result = sdURL;
            } else {
                sdURL = jabberwerx.cisco.cupha._parseURL(sdURL);
                node = jabberwerx.cisco.cupha._parseURL(node);
                if ((!sdURL.protocol && !sdURL.host && sdURL.path) && //SD URL is path only
                    (!node.protocol && !node.isIP && !node.path)) {
                     result = "/" + node.original;
                }
                 else if (!node.protocol && !node.host && node.path) {
                    result = node.original;
                } else {
                    if (node.isIP || sdURL.isIP) {
                        sdURL.isIP = node.isIP; //sdURL may change from/to IP
                        if (node.hostname) {
                            sdURL.hostname = node.hostname;
                        } else { //node is IPv6, replace entire host
                            sdURL.host = node.host;
                            //reassigned entire host, clear hostname and port since we don't reparse host
                            sdURL.hostname = sdURL.port = "";
                        }
                        //clear any cup specific parsing data sdURL may have had
                        //to ensure unmodified IP is used.
                        sdURL.cupNode = sdURL.cupDomain = "";
                    } else if ((sdURL.cupDomain && node.cupDomain &&
                                sdURL.cupDomain.indexOf(node.cupDomain, sdURL.cupDomain.length - node.cupDomain.length) !== -1) ||
                             (node.cupNode && !node.cupDomain))
                    {
                        sdURL.cupNode = node.cupNode;
                    }
                    result = jabberwerx.cisco.cupha._buildURL(sdURL);
                }
            }
            return result;
        },

        /**
         * Construct and return a new cupha object.
         *
         * Using the given connection parameters and initial hosts construct a
         * new cupha object and populate members. This function assumes
         * cparams.sdEnabled, httpBindingURL and httpBindngURL_secondary
         * variables exist.
         *
         * If jid is provided this function populates home and backup nodes from
         * localstore keyed off of jid. If not provided, home and backup nodes
         * will be null.
         *
         * @param {Object} cparams Connection parameters to use to construct
         *                         new CUPHA state object.
         * @param [{String|jabberwerx.JID}] jid the JID we ra econnecting to,
         *                          used as a localstore key for persisted nodes
         * @returns {Object} The new cupha object:
         * {
         *      enabled: false, //Is cupha enabled? Set from the serviceDiscoverEnabled config
         *      bindResourceTimer: null, //bind resource timer
         *      homeNode: null, // The user's home node, CUP server to which the user preferentially connects.
         *      backupNode: null, //The user's backup node, CUP server user should connect to if home is unavailable.
         *      currentNode: undefined, //Which node are we currently trying to connect to?
         *      primarySD: null, //Primary service discovery node. initalized from httpBindingURL
         *      secondarySD: null, //Secondary service discovery node.. initialized from httpBindingURL_secondary
         *      currentSD: undefined, //Current Service Discovery server.
         *      currentURL: undefined //Current CUP HA BOSH URL used during connection attempt
         * }
         */
        _newCUPHA: function(cparams, jid) {
            // initialize ha info, CM and service discovery nodes
            var cupha = {
                enabled: false,
                primarySD: null,
                attemptedPrimarySD: false,
                secondarySD: null,
                currentSD: undefined,
                homeNode: undefined,
                backupNode: undefined,
                currentNode: undefined,
                currentURL: undefined
            }

            cupha.enabled = (cparams && cparams.sdEnabled) || false;
            if (cupha.enabled) {
                //get possibly cached home and backup nodes from localstore
                cupha.primarySD = cparams.httpBindingURL;
                cupha.secondarySD = cparams.httpBindingURL_secondary || null;

                var pnodes = jabberwerx.cisco.cupha._getPersistedNodes(jid);
                cupha.homeNode = pnodes.home;
                cupha.backupNode = pnodes.backup;

                //set initial cup node and service discovery server
                if (cupha.homeNode) {
                    cupha.currentNode = cupha.homeNode;
                } else if (cupha.backupNode) {
                    cupha.currentNode = cupha.backupNode;
                } else {
                    cupha.currentNode = null; // null --> no nodes available
                }
                if (cupha.primarySD) {
                    cupha.currentSD = cupha.primarySD;
                } else if (cupha.secondarySD) {
                    cupha.currentSD = cupha.secondarySD;
                } else {
                    cupha.currentSD = null; // no available SD URLs
                }
            }
            return cupha;
        },


        /**
         * @private
         * Get the current connection URL from the given cupha state
         *
         * grumble, grumble, grumble. Every other cupha property is abstracted
         * from the Client intercepts defined below. This function keeps the
         * abstraction intact.
         * @param{Object} cupha The cupha state holding current node and sd info
         * @returns {String} The connection URL
         */
        _httpBindingURL: function(cupha) {
            cupha.currentURL = jabberwerx.cisco.cupha._computeURL(cupha.currentSD, cupha.currentNode);
            return cupha.currentURL;
        },

        /**
         * @private
         *
         * Reset cup state to attempting primary SD with fail over to secondary.
         *
         * Clear home and backup nodes, resets currentSD to primary. Use when no
         * node or servers seem to be available. Ensure the next connection
         * attempt will use primary SD server
         *
         * @param {Object} cupha The cupha state to be changed
         */
        _resetToPrimary: function(cupha) {
            cupha.currentNode = cupha.homeNode = cupha.backupNode = null;
            cupha.currentSD = cupha.primarySD;
            cupha.attemptedPrimarySD = false;
        },

        /**
         * Update cupha state on a forced disconnection (where the current node
         * failed to connect or was disconnected for a failover reason)
         *
         * Update CUPHA's state by adjusting
         * currentNode in [null, homeNode, backuNode]
         *             may be FQDN, leftmost domain part or resource
         * currentSD in [null, primarySD, secondarySD]
         *           URL or resource
         * currentURL computed from protocol://[sd.tld]:port/resource of
         *            currentSD and the currentNode
         *
         * This function computes the currentURL to the next attempted address
         * using the following sequence:
         *
         * currentNode undefined -> homeNode -> backupNode -> null
         * currentSD primarySD -> secondarySD -> null
         *
         * undefined is used as a flag to indicate start state
         * null is used as a flag to indicating all values have been attempted.
         *
         * If currentURL does not match the computed URL, (ie, the currentURL
         * does not reflect the current state of the cupha) simply update the
         * currentURL. This essentially resets the connection attempt sequence.
         *
         * otherwise if the currentNode is null
         * If a disconnect occurred during a connection attempt, try the next
         * best URL:
         *  If home failed try backup
         *  if both home and backup have fail, try getting new nodes from
         *      the primary service discovery server.
         *      If already tried primary SD, try secondary SD
         *
         * NOTE: This function is only called if sdEnabled is true
         *
         * @param {Object} cupha The current CUPHA state
         * @returns {Boolean} true if currentURL changed, false if all available
         *                    URLs have been tried.
         */
        _updateOnDisconnect: function(cupha) {
            // currentURL does not reflect the current state, just recompute.
            var curl = jabberwerx.cisco.cupha._computeURL(cupha.currentSD, cupha.currentNode);
            if (cupha.currentURL != curl)
            {
                __log("Retrying current node [" + cupha.currentNode + "]");
                cupha.currentURL = curl;
                return true;
            }

            //homeNode -> backupNode on current SD
            if ((cupha.currentNode !== null) && //we have not already tried all node values
                (cupha.currentNode == cupha.homeNode) && // we just tried home node
                cupha.backupNode) //backup node is available
            {
                __log("Failed to connect home node [" + cupha.homeNode + "], and now try backup node [" +  cupha.backupNode + "]");
                cupha.currentNode = cupha.backupNode;
                cupha.currentURL = jabberwerx.cisco.cupha._computeURL(cupha.currentSD, cupha.currentNode);
                return true;
            }
            //failed backup, or failed homeNode and no backup, flag no available nodes and try SD servers
            cupha.currentNode = null;
            if (!cupha.attemptedPrimarySD) //have not already tried primary SD server
            {
                cupha.attemptedPrimarySD = true;
                cupha.currentSD = cupha.primarySD;
                cupha.currentNode = null; //tried all available nodes
                __log("Both home and backup node are down, retrying the SD-Primary node, Service Discovery URL =" + cupha.currentSD);
                cupha.currentURL = jabberwerx.cisco.cupha._computeURL(cupha.currentSD, cupha.currentNode);
                return true;
            }

            //failed all nodes on current SD server. Switch to secondary SD server if available and not exactly the same as primary
            if ((cupha.currentSD == cupha.primarySD) && cupha.secondarySD && (cupha.secondarySD != cupha.primarySD))
            {
                cupha.currentSD = cupha.secondarySD;
                __log("Failed to connect to SD-Primary nodes, trying SD-Secondary: " + cupha.currentSD);
                cupha.currentURL = jabberwerx.cisco.cupha._computeURL(cupha.currentSD, cupha.currentNode);
                return true;
            }

            //tried home and backup nodes on primary and secondary SD servers.
            __log("Could not connect to primary and secondary Service Discovery servers. Try again later.");
            return false;
        },

        /**
         * Update cupha with new home and backup nodes.
         *
         * Update the given cupha home and backup node state with the given
         * host nodes.
         *
         * NOTE: Any cupha property may be changed by this function.
         * NOTE: Updates localstorage with node info if optional jid is provided
         * NOTE: This function is called only when CUPHA is enabled
         *
         * @params {Object} cupha The object holding cupha state.
         * @params {DOM} [feats] SASL features, parsed for hostnames.
         * @params {String|JID} jid The bare jid of the connecting user. Used to
         *                      persist home and backup node between sessions.
         * @returns {Boolean} true if new host nodes will require a stream
         *                    reopen. False if the stream is currently open
         *                    to the correct host.
         */
        _updateUserNodes: function(cupha, feats, jid) {
            jid = jabberwerx.JID.asJID(jid);
            var hosts = [];
            if (feats) {
                jabberwerx.$(feats).find("mechanisms[xmlns='urn:ietf:params:xml:ns:xmpp-sasl']>hostname").each(
                    function() {
                        hosts.push(jabberwerx.$(this).text());
                    });
            }
            if (hosts.length === 0) {
                //Server HA is disabled or
                //User is unassigned or
                //Server is does not support CUP HA
                jabberwerx.util.debug.warn("CUP HA: High Availablility information not returned from Service Discovery server.");
                __log("No user's home and backup node returned from server, this might be caused by");
                __log("1) CUP Server is running a pre CUP 8.5 version & does not support High Availability or");
                __log("2) High Availability may be disabled on the cluster or");
                __log("3) User is not assigned to a node within the subcluster.");
                //no home/backup node returned, nothing to do
                cupha.homeNode = cupha.backupNode = null;
                //currentNode to null to indicate no nodes left to try
                cupha.currentNode = null;
                //clear persisted nodes
                jabberwerx.cisco.cupha._setPersistedNodes(jid);
                return false; //just continue with current login, hope for the best
            }
            //update home and backup nodes
            cupha.homeNode = hosts[0];
            cupha.backupNode = hosts[1] || null;
            jabberwerx.cisco.cupha._setPersistedNodes(jid,
                                                      {home: cupha.homeNode,
                                                       backup: cupha.backupNode});
            __log("User [" + jid.getBareJIDString() + "]'s home node is " + cupha.homeNode + " and backup node is " + cupha.backupNode);

            // if already connected to a home or backup node just continue
            var homeURL = jabberwerx.cisco.cupha._computeURL(cupha.currentSD,
                                                             cupha.homeNode);
            var backupURL =  jabberwerx.cisco.cupha._computeURL(cupha.currentSD,
                                                                cupha.backupNode);
            var isHome = (cupha.currentURL == homeURL);
            if (isHome || (cupha.currentURL == backupURL))
            {
                __log("Already connecting to user's " + (isHome ? "home" : "backup") + " node: " + cupha.currentURL);
                return false;
            }

            //otherwise prep for a stream reopen by setting up for homeNode, and currentSD
            cupha.currentNode = cupha.homeNode;
            cupha.currentURL = jabberwerx.cisco.cupha._computeURL(cupha.currentSD, cupha.currentNode);
            __log("Reopening stream after updating user nodes");
            return true;
        }
    };


    /**
    * @namespace
    * The CUP HA {@link jabberwerx.Client} mixin.
    *
    * This mixin object extends Client using the intercept pattern implemented
    * via {@link jabberwerx.JWBase.intercept}.
    *
    * See <a href="../cupIntegrationGuide.html" target="blank">CUP CAXL 8.x Integration Guide</a>
    * for detailed information on business rules and use cases implemented here.
    *
    * Implementation details:
    *   all *new* CUP HA properties and methods are in a cupha property of Client.
    *   All methods in the jabberwerx.cisco.cupha.intercept.Client namespace
    *       intercept existing client methods.
    *   An existence check of intercepted methods is performed at loadtime,
    *       failure is logged and intercept is *not* performed.
    *   todo existence check lol
    */
    jabberwerx.cisco.cupha.ClientMixin = {
        /**
         * @private
         * Close and reopen the Client's stream
         */
        _reopenStream: function() {
            this._clearStreamHandlers();
            // clear out received pendings
            this._stopReceiveQueue(true);
            if (this._stream.isOpen()) {
                // special handler that reopens the stream once closed
                this._setStreamHandler('streamClosed','_handleClosedDuringReopen');
                try {
                    this._stream.close();
                } catch (e) {
                    __log("Exception during _reopenStream, ignoring: " + e.message);
                    setTimeout(this.invocation('_openStream'), 10);
                }
            } else {
                //use a timeout so that this event can finish before open attempt
                setTimeout(this.invocation('_openStream'), 10);
            }
        },

        /**
         * @private
         *
         * The stream closed event handler triggered during a reopen.
         *
         * During connection a stream close request may be made. The close
         * should be allowed to fully complete before the subsequent stream open
         * is attempted. This handler is mapped to streamClosed just prior to
         * actually closing the stream.
         */
        _handleClosedDuringReopen: function() {
            this._clearStreamHandler("streamClosed");
            //use a timeout so that this event can finish before open attempt
            setTimeout(this.invocation('_openStream'), 10);
        },

        /**
         * @private
         * Return a new connection parameters object populated from
         * given jid, password and connection argument.
         *
         * NOTE: This function INTERCEPTS jabberwerx.Client._newConnectParams
         *       method @see {@link jabberwerx.Client._newConnectParams}
         *
         * CUPHA adds the following configurable connection parameters to the
         * default (see {@link jabberwerx.cisco.cupha} for further information):
         *  sdEnabled - Is Service Discovery allowed? Note this is controls only
         *      the home and backup node discovery, not whether home and backup
         *      nodes should be used.
         *  httpBindingURL_secondary - A secondary SD server or BOSH server to
         *      use if httpBindingURL failed to connect.
         *  bindRetryCountdown - A internal timeout for connection failover.
         *
         * CUPHA adds a cupha configuration object containing the following
         * properties:
         *      enabled: result.sdEnabled,
         *      primarySD: result.httpBindingURL,
         *      secondarySD: result.httpBindingURL_secondary,
         *      currentSD: primarySD,
         *      homeNode: persisted value || null,
         *      backupNode: persisted value || null,
         *      currentNode: homeNode,
         *      currentURL: null,
         *
         * @param {String|JID} jid full or bare connection JID
         * @param {String} password The associated password
         * @param {Object} arg additional connection configuration opts
         * @returns {Object} A simple object containing stream and
         *                   connection configuration options suitable for use
         *                   in {@link jabberwerx.Client.connect}.
         */
        _newConnectParams: function(jid, password, arg) {
            var result = this._super(jid, password, arg);
            result.sdEnabled = (arg.serviceDiscoveryEnabled === "true") ||
                               (jabberwerx._config.serviceDiscoveryEnabled === "true");
            result.httpBindingURL_secondary = arg.httpBindingURL_secondary
                                              || jabberwerx._config.httpBindingURL_secondary
                                              || "";
            result.bindRetryCountdown = arg.bindRetryCountdown
                                        || jabberwerx._config.bindRetryCountdown;
            result.bindRetryCountdown = Number(result.bindRetryCountdown);
            if (result.bindRetryCountdown <= 0) {
                result.bindRetryCountdown = jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT;
            }

            if (!result.arg.reconnecting) {
                //no need to keep spaming on recon attempts
                __log("CUP High-Availability features are "+ (result.sdEnabled ? "enabled" : "disabled"));

                //attach cupha state to arg so it survives between connection attempts
                if (!result.sdEnabled) {
                    result.arg.cupha = jabberwerx.cisco.cupha._newCUPHA();
                } else {
                    result.arg.cupha = jabberwerx.cisco.cupha._newCUPHA(result, jid);
                }
            } //if reconnecting, arg.cupha is already set
            return result;
        },

        /**
         * @private
         * Return a new options object suitable for stream open.
         *
         * Constructs a new stream open configuration object from the given
         * connection parameters, copying any stream relevent properties and
         * ignoring all others.
         * Allows password to be kept hidden from stream for example.
         *
         * NOTE: This function INTERCEPTS the
         *       {@link jabberwerx.Client._filterStreamOpts} function.
         *
         * NOTE: Review doc/api/cupIntegrationGuide.html for a full discussion
         *       of CUP HA Service Discovery nodes.
         *
         * NOTE: This function sets cparams.cupha.currentURL as a side effect.
         *
         * Compute httpBindingURL by using currentSD, currentNode and the
         * business rules detailed in jabberwerx.cisco.cupha._computeURL
         * defined above.
         *
         * @param {Object} cparams connection parameters.
         * @returns {Object} Stream open configuration
         */
        _filterStreamOpts: function(cparams) {
            var result = this._super(cparams);
            // Override default httpBindingURL
            if (cparams.sdEnabled) {
                result.httpBindingURL = jabberwerx.cisco.cupha._httpBindingURL(cparams.arg.cupha);
                __log("BOSH URL is: " + result.httpBindingURL);
            }
            return result;
        },

        /**
         * @private
         *
         * SASL streamOpened event handler. Triggered when a stream is newly
         * opened and has received SASL feature.
         *
         * NOTE: This function INTERCEPTS the
         *       {@link jabberwerx.Client._handleAuthOpened} function.
         *
         * NOTE: Review doc/api/cupIntegrationGuide.html for a full discussion
         *       of CUP HA Service Discovery nodes.
         *
         * CUP HA extends SASL mechanisms to include Service Discovery (or SD)
         * information that allows the client to connect to the proper HA
         * service router. 0,1,2 hostname children of mechanisms may be used to
         * specify home node, or home node and backup node.
         *
         * Since SD protocol is an extension, or override, of SASL it is
         * appropriate to intercept and override the SASL stream handling.
         * This intercept will find appropriate node information, set CUP HA
         * state and then forward the features to the overriden SASL
         * streamOpened handler.
         *
         * @param {jabberwerx.NodeBuilder} feats The stream features for this
         *                                 open attempt
         */
        _handleAuthOpened: function(feats) {
            //check for the home and backup node
            //use default behavior if service discovery is not enabled
            if (!this._connectParams.sdEnabled ||
                !jabberwerx.cisco.cupha._updateUserNodes(this._connectParams.arg.cupha,
                                                         feats.data,
                                                         this._connectParams.jid))
            {
                // no CUPHA or currently using correct BOSH URL, continue with SASL
                this._super(feats);
            } else {
                // open with the newly specified home and backup nodes
                try {
                    this._reopenStream();
                } catch (ex) {
                    //emulate overriden _handleAuthOpened error handling
                    this._handleConnectionException(ex);
                }
            }
        },

        /**
         * @private
         *
         * Stream closed event handler
         *
         * This event handler is triggered whenever the stream is closed. May be
         * closed as part of a normal disconnect (user initiated) or by an
         * XMPP stream or network error.
         *
         * NOTE: This method INTERCEPTs {@link jabberwerx.Client#_handleClosed}
         *
         * Mixin override attempts HA failover to backup node/service discovery
         * if stream closed with an error during a connection attempt.
         *
         * @param {DOM} [err] Optional error DOM if close was forced.
         */
        _handleClosed: function(err) {
            // overridden handler restarts if registering
            if (this._connectParams.sdEnabled &&
                err && err.data &&
                !this._connectParams.arg.register &&
                (this.clientStatus == jabberwerx.Client.status_connecting))
            {
                // stream closed during connection, clear binding timer if needed
                if (this._connectParams.bindResourceTimer !== undefined) {
                    jabberwerx.system.clearTimeout(this._connectParams.bindResourceTimer);
                    delete this._connectParams.bindResourceTimer;
                }
                // if we had another failover or fallback node/server available,
                // reopen and try again
                if (jabberwerx.cisco.cupha._updateOnDisconnect(this._connectParams.arg.cupha))
                {
                    try {
                        this._reopenStream();
                        return; //short circut disconnection cleanup
                    } catch (ex) {
                        __log("Unhandled exception trying to reopen the stream during reconnection attempt: " + ex.message);
                        //fall through to default closer
                    }
                }
            }
            //default handler will restart during a registration attempt or call
            //_disconnected to cleanup.
            this._super(err);
        },

        /**
         * @private
         * Binding streamOpened event handler. Triggered when a stream is stream
         * is ready to start JID binding.
         *
         * NOTE: This function INTERCEPTS the
         *       {@link jabberwerx.Client._handleBindOpened} function.
         *
         * Set a binding IQ timeout handler to for failover. This
         * functionality will likely be replaced with an overall connection
         * timeout solution. Keeping to provide full functionlity in single branch
         *
         * @param {jabberwerx.NodeBuilder} feats Stream features
         */
         //todo replace bindResourceTimer with general solution
        _handleBindOpened: function(feats) {
            if (this._connectParams.sdEnabled) {
                this._connectParams.bindResourceTimer = jabberwerx.system.setTimeout(
                                                    this.invocation("_handleBindTimeout"),
                                                    this._connectParams.bindRetryCountdown * 1000);
            }
            this._super(feats);
        },

        /**
         * @private
         *
         * Binding streamRecievedElements event handler.
         * Triggered by stream when elements are received after the opened for
         * JID binding.
         *
         * NOTE: This function INTERCEPTS the
         *       {@link jabberwerx.Client._handleBindElements} function.
         *
         * Clears the binding IQ timeout handler since this is the IQ response.
         *
         * @param {Array} elements array of NodeBuilder representing xmpp stanzas
         */
        _handleBindElements: function(elements) {
            //clear our timeout
            if (this._connectParams.bindResourceTimer !== undefined) {
                jabberwerx.system.clearTimeout(this._connectParams.bindResourceTimer);
                delete this._connectParams.bindResourceTimer;
            }
            this._super(elements);
        },

        /**
         * @private
         * Bind IQ response timeout handler.
         *
         * Triggered when the bind IQ fails to return within bindRetryCountdown
         * seconds. Stream is closed and reopened as a failover attempt.
         */
        _handleBindTimeout: function() {
            //time out reopen the stream
            delete this._connectParams.bindResourceTimer;
            try {
                //just try to open stream with same connection, better luck this time
                __log("No response from binding resource request, reopen the stream....");
                if (jabberwerx.cisco.cupha._updateOnDisconnect(this._connectParams.arg.cupha)) {
                    this._reopenStream();
                } else {
                    __log("No nodes or service discovery servers left to try. Failing connection attempt.");
                    // no other failover or fallback available, termnate connection with an error
                    this._handleConnectionException(jabberwerx.Stream.ERR_SERVICE_UNAVAILABLE);
                }
            } catch (ex) {
                jabberwerx.util.debug.warn("CUPHA _handleBindTimeout threw an unhandled exception while attempting to reopen stream: " + ex.message);
                this._handleConnectionException(ex);
            }
        },

        /**
        * @private
        *
        * Cleanup after disconnect and setup subsequent reconnection attempts.
        * This method may be called during a connection attempt, as part of a
        * user requested disconnect or when the server terminates connection.
        *
        * NOTE: This function INTERCEPTS {@link jabberwerx.Client._disconnected}
        *
        * @param {DOM} [err] error that forced this disconnection. May be NULL
        *                    or undefined indicating a user requested disconnect.
        */
        _disconnected: function(err) {
            //default processing if not CUPHA enabled
            if (!this._connectParams.sdEnabled) {
                this._super(err);
                return;
            }
            // exception during connection, clear binding timer if needed
            if (this._connectParams.bindResourceTimer !== undefined) {
                jabberwerx.system.clearTimeout(this._connectParams.bindResourceTimer);
                delete this._connectParams.bindResourceTimer;
            }

            if (err) {
                // switch nodes on reconnect if this is a failure to reconnect to the current node
                var changeNode = (this.clientStatus == jabberwerx.Client.status_reconnecting);
                // switch nodes on reconnect if we recieved a system shutdown error. see _shouldReconnect
                changeNode = changeNode || (jabberwerx.$("system-shutdown", err).length !== 0);
                // don't try to reconnect to current node if see-other-host
                changeNode = changeNode || (jabberwerx.$("see-other-host", err).length != 0);
            }

            this._super(err); //super call sets _countDownOn flag when reconnecting

            if (this._countDownOn == 0) {
                //not reconnecting, cleanup
                this._connectParams.arg.cupha = jabberwerx.cisco.cupha._newCUPHA();
            } else if ((this._countDownOn != 0) && changeNode) {
                // update cupha state for *next* reconnect attempt if a node change is required.
                if (!jabberwerx.cisco.cupha._updateOnDisconnect(this._connectParams.arg.cupha)) {
                    //failed to reconnect to any node or SD server.
                    //flip back to primary SD, will toggle between primary and secondary SD until reconnect
                    jabberwerx.cisco.cupha._resetToPrimary(this._connectParams.arg.cupha);
                }
                __log("Connection failed, and now try : " + jabberwerx.cisco.cupha._httpBindingURL(this._connectParams.arg.cupha) + " in " + this._countDownOn + " seconds.");
            } else {
                __log("Reconnect to the last connected node: " + jabberwerx.cisco.cupha._httpBindingURL(this._connectParams.arg.cupha) + " in " + this._countDownOn + " seconds.");
            }
       },

        /**
         * @private
         * Determine if a reconnect attempt should be made based on the given
         * disconnection error.
         *
         * Returns true if error is system-shutdown and HA is enabled,
         * or if we recived see-other-uri and HA is enabled.
         *
         * Otherwise returns the result of the base method.
         *
         * NOTE: This function is INTERCEPTS
         * {@link jabberwerx.Client._shouldReconnect}
         *
         * @param {DOM} err Error stanza that caused disconnection,
         *                  null if no error occurred (normal disconnect)
         * @returns true if the error should start a reconnection attempt
         */
        _shouldReconnect: function(err) {
            return this._super(err) ||
                    (this._connectParams.sdEnabled &&
                    // we can switch to another node, no need to check new host
                    ((jabberwerx.$("see-other-host", err).length != 0) ||
                    // we can switch BOSH URLs, allowing a system-shutdown reconnect
                    (jabberwerx.$("system-shutdown", err).length != 0)));
        }
    }; /* jabberwerx.cisco.cupha.intercept.Client */

    /**
     * Default connection timeout (in seconds) used if not, or incorrectly,
     * provided by user.
     *
     * @private
     */
    jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT = 30;

    /**
     * IPv4 validation regex patern.
     *
     * public domain via stackoverflow:
     * http://stackoverflow.com/questions/106179/regular-expression-to-match-hostname-or-ip-address
     */
    jabberwerx.cisco.cupha.IPv4_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(?:(\:[0-9]*))*$/,
    /**
     * DNS Hostname validation regex patern.
     *
     * public domain via stackoverflow:
     * http://stackoverflow.com/questions/106179/regular-expression-to-match-hostname-or-ip-address
     */
    jabberwerx.cisco.cupha.DNS_HOST_PATTERN = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])(?:(\:[0-9]*))*$/;

    /**
     * Intercept Client methods
     */
    jabberwerx.Client.intercept(jabberwerx.cisco.cupha.ClientMixin);

    /**
     * CUP HA CAXL option defaults.
     *
     * Disable CUP HA features by default.
     */
    jabberwerx.$.extend(true, jabberwerx._config, {
        /** Is service discovery enabled on client **/
        serviceDiscoveryEnabled: false,
        /** Default secondary binding url */
        httpBindingURL_secondary: "/httpbinding",
        /** Default bind retry period */
        bindRetryCountdown: jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT
    });
})(jabberwerx);

/*build/dist/CAXL-debug-2014.04.10787/src/controller/DirectoryGroupsController.js*/
/**
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2010-2013 Cisco Systems, Inc.  All Rights Reserved.
 */

;(function(jabberwerx) {

    /** @private */
    jabberwerx.cisco.DirectoryGroupsController = jabberwerx.Controller.extend(/** @lends jabberwerx.cisco.DirectoryGroupsController.prototype */{
        /**
         * Serial number for each search.
         */
        searchID: 100,

        /**
         * @experimental
         * @class
         * <p>Controller class for dealing with Group Presence - LDAP Integration(IJEP-070) functionality.</p>
         *
         * @description
         * <p>Creates a new DirectoryGroupsController with the given client.</p>
         *
         * @param       {jabberwerx.Client} client The client object to use for communicating to the server
         * @throws      {TypeError} If {client} is not an instance of jabberwerx.Client
         * @constructs  jabberwerx.DirectoryGroupsController
         * @extends     jabberwerx.Controller
         */
        init: function(client) {
            this._super(client, 'directory');
            this.pubsubController = client.controllers.pubsub || new jabberwerx.PubSubController(client);
            this.discoController = client.controllers.disco || new jabberwerx.DiscoController(client);
            this.client = client;

            // Setup events
            this.applyEvent('LDAPContactAdded');
            this.applyEvent('LDAPContactRemoved');
            this.applyEvent('LDAPGroupRemoved');
            this.applyEvent('LDAPGroupNameUpdated');
            this.applyEvent('LDAPGroupSearchResults');
            this.applyEvent('LDAPUserSearchResults');

            //cache all the ldap contacts, currently for filter purpose
            this._ldapContacts = {};
            //cache all ldap groups id and name
            this._ldapGroups = {};

            //items buffer for list ldap group, async processing purpose
            this._itemsBuff = [];
            this._subcrbItemsBuff = [];
            //bind to the client's disconnected event to cleanup as needed
            client.event("clientDisconnected").
                bind(this.invocation("_onClientDisconnected"));
        },

        /**
         * Destroy directory groups controller and unbind client events
         */
        destroy: function() {
            this.client.event("clientDisconnected").unbind(this.invocation("_onClientDisconnected"));
            this._super();
        },

        /**
         * <p>Active subscribed groups</p>
         *
         * @throws {jabberwerx.DirectoryGroupsController.errors.ActiveGroupServerFailedError} CANT_ACTIVE_LDAP_SUBSCRIPTION error if an LDAP component does not exist on the connected server
         */
        activateSubscriptions: function() {
            jabberwerx.util.debug.log("activateSubscriptions", "", "");
            if(!this._hasLDAPFeature()) {
                throw new this.errors.ActiveGroupServerFailedError();
            }
            var groupServerHost = this._getGroupServerHost();
            this.client.event('messageReceived').
                bindWhen("message[from='" + groupServerHost + "'] event[xmlns='http://jabber.org/protocol/pubsub#event']",
                         this.invocation("_onLdapGroupReceived"));
            var activate = new jabberwerx.Presence();
            activate.setTo(groupServerHost);
            new jabberwerx.NodeBuilder(activate.getNode()).
                                       element('{http://webex.com/connect/cs}x',
                                               {'type': 'initial'});
            this.client.sendStanza(activate);
        },

        /**
         * <p>Check the server whether support LDAP feature.</p>
         *
         * @returns {Boolean} true if server support LDAP feature.
         *
         * @private
         */
        _hasLDAPFeature: function() {
            return this.discoController.
                        findByFeature('http://webex.com/connect/cs').length > 0;
        },

        /**
         * <p>Cache LDAP contacts.</p>
         *
         * @param {String} groupId
         * @param {String} jid
         *
         * @private
         */
        _cacheLdapContact: function(groupId, jid) {
            var group = this._ldapContacts[groupId];
            if(!group) {
                group = this._ldapContacts[groupId] = {};
            }
            group[jid] = true;
        },

        /**
         * <p>Cache LDAP groups.</p>
         *
         * @param {String} groupId
         * @param {String} groupName
         *
         * @private
         */
        _cacheLdapGroups: function(groupId, groupName) {
            this._ldapGroups[groupId] = groupName;
        },

        /**
         * <p>Check the contact whether belong to LDAP groups.</p>
         *
         * @param {String} jid The contact's jabber id.
         * @returns {Boolean} true if {jid} is belong to LDAP groups.
         */
        isLDAPContact: function(jid) {
            for(var i in this._ldapContacts) {
                var group = this._ldapContacts[i];
                if(group[jid]) {
                    return true;
                }
            }
            return false;
        },

        /**
         * clientDisconnected event handler clears cached contacts, groups
         * and server on disconnect
         *
         * @private
         */
        _onClientDisconnected: function(err) {
            this._ldapContacts = {};
            this._ldapGroups = {};
            delete this.groupServerHost;
        },

        /**
         * <p>Call back from LDAP subscribe active</p>
         *
         * @param {jabberwerx.Stanza} stanza Ldap group stanza.
         *
         * @private
         */
        _onLdapGroupReceived: function(stanza) {
            var node = jabberwerx.$(stanza.data);
            var groupItem = jabberwerx.$("items", node[0]._DOM);
            if(groupItem.length > 0) {
                this._updateLdapGroup(groupItem);
            }
            var delGroupItem = jabberwerx.$("delete", node[0]._DOM);
            if(delGroupItem.length > 0) {
                this._deleteLdapGroup(delGroupItem);
            }
        },

        /**
         * <p>Parse LDAP group data, and trigger the OnLDAPContactAdded event.
         * Refer IJEP-070 for the group message struct.
         * triggers {@link LDAPContactAdded}event, with {@link LDAPcontact} object</p>
         *
         * @param {jabberwerx.Stanza} groups Updated group data.
         * @private
         */
        _updateLdapGroup: function(groups) {
            for(var i = 0, groupItem, l = groups.length; i < l; i++) {
                groupItem = jabberwerx.$(groups[i]);
                var groupid = groupItem.attr("node"),
                    groupname = groupItem.attr("name"),
                    items = jabberwerx.$('item', groupItem),
                    retracts = jabberwerx.$('retract', groupItem),
                    member, jid, displayName;

                //Inform the group name for ldap group id has been retrieved.
                //Make sure this is a update operation.
                if(retracts.length == 0 && groupname) {
                    //update group info
                    this._cacheLdapGroups(groupid, groupname);
                    this.event('LDAPGroupNameUpdated').
                         trigger({groupid: groupid, groupname: groupname});
                    //Retracts property means the contact is removed from group.
                }else if(retracts.length > 0) {
                    for(var i = 0, l = retracts.length; i < l; i++) {
                        jid = jabberwerx.$(retracts[i]).attr("id");
                        this.event('LDAPContactRemoved').
                             trigger({jid: jid, groupid: groupid});
                        if(this._ldapContacts[groupid]) {
                            delete this._ldapContacts[groupid];
                        }
                    }
                    break;
                }

                //For there may be very large number of contacts when receive
                //LDAP group data, to parse the whole data may hang the browser.
                //Just parse 100 contact data at each time(100 millisecond).
                if(this._itemsBuff.length === 0) {
                    var buffIdx = 0, itemIdx = 0, that = this;
                    var iterateItem = function() {
                        clearTimeout(h);
                        items = that._itemsBuff[buffIdx] || [];
                        groupid = items.length &&
                                  items[0].parentNode.getAttribute("node");
                        for(var i=0,l=items.length;itemIdx<l; itemIdx++, i++) {
                            //max 100 once a time
                            if(i > 100) {
                                break;
                            }
                            member = jabberwerx.$("member", items[itemIdx]);
                            jid = member.attr("username");
                            displayName = member.attr("displayname");
                            that._cacheLdapContact(groupid, jid);
                            that.event('LDAPContactAdded').
                                 trigger({jid: jid,
                                          groupid: groupid,
                                          displayName: displayName});
                        }
                        //reset itemIdx and buffIdx if a full loop finished
                        if(itemIdx == items.length) {
                            itemIdx = 0;
                            buffIdx++;
                        }
                        //not reached the end? continue
                        if(that._itemsBuff.length > buffIdx) {
                            h = setTimeout(arguments.callee, 100);
                        }else {
                            //end reached, clean up
                            that._itemsBuff = [];
                        }
                    }
                    //start processing
                    var h = setTimeout(iterateItem, 500);
                }
                //cache items first, do iterate in a async way
                this._itemsBuff.push(items);
            }
        },

        /**
         * <p>Parse deleted ldap group data.</p>
         *
         * @param {jabberwerx.Stanza} groupItem Stanza contains deleted group id.
         * @private
         */
        _deleteLdapGroup: function(groupItem) {
            for(var i = 0, groupid, item, l = groupItem.length; i < l; i++) {
                item = jabberwerx.$(groupItem[i]);
                groupid = item.attr("node");
                this.event('LDAPGroupRemoved').trigger({groupid: groupid});
            }
        },

        /**
         * <p>Get group server host address.</p>
         *
         * @returns {String} Group server host's address.
         *
         * @throws {jabberwerx.DirectoryGroupsControlle.errors.NoGroupAddressError} NoGroupAddressError
         * @private
         */
        _getGroupServerHost: function() {
            if(!this.groupServerHost) {
                //setup connection server using disco
                this.discoController = this.client.controllers.disco;
                if(!this.discoController) {
                    throw this.errors.NoGroupAddressError;
                }
                var entities = this.discoController.findByIdentity("component/generic");
                for(var i = 0, l = entities.length; i < l; i++) {
                    if(entities[i].hasFeature("http://webex.com/connect/cs")) {
                        this.groupServerHost = entities[i].jid.toString();
                        break;
                    }
                }
            }
            return this.groupServerHost;
        },

        /**
         * <p>Search directory groups.</p>
         *
         * @param {String} groupName Group name to search for.
         * @param {Number} count Optional, limit search result number.
         *
         * @returns {Number} Search serial number.
         */
        searchGroup: function(groupName, count) {
            var groupServerHost = this._getGroupServerHost();
            var query = new jabberwerx.NodeBuilder('{jabber:iq:search}query').element('{jabber:x:data}x', {'type': 'submit'});
            query.element('field', {'type': 'hidden', 'var': 'FORM_TYPE'}).element('value').text('http://webex.com/connect/cs');
            query.element('field', {'var': 'groupname'}).element('value').text(groupName);
            query.element('field', {'var': 'count'}).element('value').text(count);
            var resultId = ++this.searchID;
            var that = this;
            this.client.sendIq("set", groupServerHost, query.document, function(stanza) {
                var items = jabberwerx.$('item', stanza);
                var ldapGroups = [];
                for(var i = 0; i < items.length; i++) {
                    var item = {};
                    var fields = jabberwerx.$("field", items[i]);
                    for(var j = 0; j < fields.length; j++) {
                        var field = fields[j];
                        var name = jabberwerx.$(field).attr("var");
                        if(name == "groupid" || name == "groupname") {
                            var value = jabberwerx.$('value', field).text();
                            item[name] = value;
                        }
                    }
                    ldapGroups.push(item);
                    that._cacheLdapGroups(item['groupid'], item['groupname']);
                }
                that.event('LDAPGroupSearchResults').trigger({resultid: resultId, ldapGroups: ldapGroups});
            });
            return this.searchID;
        },

        /**
         * <p>Search LDAP users by custom field.</p>
         *
         * @param {Object} searchFields
         *          An object contains field name and value.
         *          For example: {'userid' : '007',
         *                        'displayname' : 'James Bond',
         *                        'firstname': 'James',
         *                        'lastname': 'Bond',
         *                        'ssoid_searchuser': 'ssoid'}
         *
         * @param {Number} count Optional, limit search result number.
         * @returns {Number} Search serial number.
         */
        searchUsersByFields: function(searchFields, count) {
            if(!count && count > 0) {
                searchFields["count"] = count;
            }
            return this._searchUsers(searchFields, count);
        },

        /**
         * <p>Common search User function for all types of user search</p>
         *
         * @param {Object} search See {searchUsersByFields}
         * @param {Number} count Optional, limit search result number.
         *
         * @returns {Number} Search serial number.
         * @private
         */
        _searchUsers: function(/*Object*/searchArgs, /*function*/count) {
            var groupServerHost = this._getGroupServerHost();
            var query = new jabberwerx.NodeBuilder('{jabber:iq:search}query').element('{jabber:x:data}x', {'type': 'submit'});
            query.element('field', {'type': 'hidden', 'var': 'FORM_TYPE'}).element('value').text('http://webex.com/connect/cs');

            //form query fields based on searchArgs
            for(var arg in searchArgs) {
                query.element('field', {'var': arg}).element('value').text(searchArgs[arg]);
            }

            var that = this;
            var resultId = ++this.searchID;
            this.client.sendIq("set", groupServerHost, query.document, function(stanza) {
                var items = jabberwerx.$('item', stanza);
                var ldapUsers = [];
                for(var i = 0; i < items.length; i++) {
                    var item = {};
                    var fields = jabberwerx.$("field", items[i]);
                    for(var j = 0; j < fields.length; j++) {
                        var field = fields[j];
                        var name = jabberwerx.$(field).attr("var");
                        if(name == "email" || name == "username" ||
                           name == "jobtitle" || name == "displayname" ||
                           name == "phone") {
                            var value = jabberwerx.$('value', field).text();
                            item[name] = value;
                        }
                    }
                    ldapUsers.push(item);
                }
                that.event('LDAPUserSearchResults').trigger({resultid: resultId,
                                                       ldapUsers: ldapUsers});
            });
            return this.searchID;
        },

        /**
         * <p>Subscribe an LDAP group</p>
         *
         * @param {String} groupId The id of LDAP group
         */
        subscribeGroup: function(groupId) {
            var groupServerHost = this._getGroupServerHost();
            var groupNode = this.pubsubController.node(groupId, groupServerHost);
            var that = this;
            groupNode.event("pubsubItemsChanged").
                bind(this.invocation("_onSubscribeGroup"));
            groupNode.subscribe(function() {
                //For we can't get group name from pubsub node event data,
                //we have to use group name cached before.
                var groupName = that._ldapGroups[groupId];
                that.event('LDAPGroupNameUpdated').trigger({groupid: groupId,
                                                           groupname: groupName});
            });
        },

        /**
         * <p>The callback of Subscribing Group.</p>
         *
         * @param {object} groupObj Group data pushed from server.
         * @private
         */
        _onSubscribeGroup: function(groupObj) {
            if(this._subcrbItemsBuff.length === 0) {
                var groupId = groupObj.source.node;
                var that = this;
                var iterateItem = function() {
                    clearTimeout(h);
                    var groupObj = that._subcrbItemsBuff.shift();
                    var groupId = groupObj.source.node;
                    var items = groupObj.data.items;
                    for(var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var displayName = jabberwerx.$(item.data).attr("displayname");
                        var jid = jabberwerx.$(item.data).attr("username");
                        that._cacheLdapContact(groupId, jid);
                        that.event('LDAPContactAdded').trigger({jid: jid,
                                                               groupid: groupId,
                                                               displayName: displayName});
                    }

                    var groupServerHost = that._getGroupServerHost();
                    var groupNode = that.pubsubController.node(groupId, groupServerHost);
                    groupNode.destroy();

                    if(that._subcrbItemsBuff.length > 0) {
                        h = setTimeout(arguments.callee, 100);
                    }
                };
                var h = setTimeout(iterateItem, 10);
            }
            this._subcrbItemsBuff.push(groupObj);
        },

        /**
         * <p>Remove the subscription of an LDAP group.</p>
         *
         * @param {String} groupId The id of LDAP group
         */
        unsubscribeGroup: function(/*String*/groupId) {
            var groupServerHost = this._getGroupServerHost();
            var groupNode = this.pubsubController.node(groupId, groupServerHost);
            var that = this;
            groupNode.unsubscribe(function() {
                that.event('LDAPGroupRemoved').trigger({groupid: groupId});
            });
        },

        /**
         * <p>Errors of directory group controller.</p>
         * <p>ActiveGroupServerFailedError : Can't active group subscription.</br>
         * NoGroupAddressError : Can't get group server address.</p>
         */
        errors: {
            ActiveGroupServerFailedError: jabberwerx.util.Error.extend('Can\'t active group subscription.'),
            NoGroupAddressError: jabberwerx.util.Error.extend('Can\'t get group server address.')
        }
    });
})(jabberwerx);
/*build/dist/CAXL-debug-2014.04.10787/src/controller/QuickContactController.js*/
/**
 * filename:        QuickContactController.js
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2009-2011 Cisco Systems, Inc.  All Rights Reserved.
 */

;(function(jabberwerx) {
        /** @private */
        jabberwerx.cisco.QuickContactController = jabberwerx.Controller.extend(/** @lends jabberwerx.cisco.QuickContactController.prototype */{
            /**
             * @class
             * <p>Quick contact Controller class is responsible for quick contact subscriptions/unsubscriptions.</p>
             * It is also registered to listen to temp presence pubsub notification events.
             * @description
             * <p>Creates a new QuickContactController with the given client.
             *
             * @param {jabberwerx.Client} client The owning client
             * @throws {TypeError} If {client} is not valid
             * @constructs jabberwerx.cisco.QuickContactController
             * @extends jabberwerx.Controller
             */
             init: function(client) {
                 this._super(client, "quickContact");
                 this.client.event('afterMessageReceived').bindWhen('message[type="headline"] event[xmlns="http://jabber.org/protocol/pubsub#event"] items[node="http://webex.com/connect/temp-presence"]>item>presence', this.invocation('_presenceReceived'));
                 this.client.event("clientStatusChanged").bind(this.invocation("_handleStatusChange"));
                 jabberwerx.globalEvents.bind("resourcePresenceChanged", this.invocation("_handleResourcePresenceUpdate"));
                 this.client.entitySet.event('entityUpdated').bind(this.invocation('_handleEntityUpdated'));
                 this.client.entitySet.event('entityRemoved').bind(this.invocation('_handleEntityRemoved'));
             },

            /**
             * Unbinds events and calls base class method.
             */
            destroy: function() {
                // teardown handlers
                var client = this.client;
                client.event("afterMessageReceived").unbind(
                        this.invocation("_presenceReceived"));
                client.event("clientStatusChanged").unbind(
                        this.invocation("_handleStatusChange"));
                jabberwerx.globalEvents.unbind("resourcePresenceChanged",
                        this.invocation("_handleResourcePresenceUpdate"));
                client.entitySet.event('entityUpdated').unbind(
                        this.invocation('_handleEntityUpdated'));
                client.entitySet.event('entityRemoved').unbind(
                        this.invocation('_handleEntityRemoved'));
                this._super();
            },

            /**
             * This function sends direct presence with caps containing
             * temp presence feautre to the given jid.
             * Returns false if already subscribed to the jid and true otherwise.
             * @param {JID} jid for which to subscribe to temp presence changes
             * @throws {TypeError}  If {entity} is RosterContact with status "both" or "to"
             * @returns {Boolean} <tt>true</tt> if successfully added, <tt>false</tt> if unsuccessful
             */
            subscribe: function(jid) {
                jid = jabberwerx.JID.asJID(jid).getBareJID();
                delete this._pendingSubs[jid.toString()]; //remove from pending subs as needed
                delete this._pendingUnsubs[jid.toString()]; //remove from pending unsubs as needed
                var entity = this.client.entitySet.entity(jid);
                if (    entity && entity instanceof(jabberwerx.RosterContact) &&
                        (entity.properties.subscription == "both" || entity.properties.subscription == "to")) {
                    throw new TypeError("Can't add roster contact as a quick contact.");
                }
                if (!entity || (entity instanceof jabberwerx.TemporaryEntity)) {
                    var quick = new jabberwerx.cisco.QuickContact(jid, this);
                    if (entity) {
                        quick.apply(entity);
                        entity.remove();
                        entity = quick;
                    }
                    entity = quick;
                    entity.properties.temp_sub = true;
                    this.client.entitySet.register(entity);
                } else {
                    entity.properties.temp_sub = true;
                    this.client.entitySet.event("entityUpdated").trigger(entity);
                }
                // Insert an unavailable presence object into the presence list if it's empty
                if (!entity.getPrimaryPresence()) {
                    var pres = new jabberwerx.Presence();
                    pres.setFrom(entity.jid);
                    pres.setType("unavailable");
                    entity.updatePresence(pres);
                }
                var retVal = this.client.controllers.capabilities.addFeatureToJid(jid,'http://webex.com/connect/temp-presence+notify');

                return retVal;
            },
            /**
             * Temp subscribe to multiple contacts. Send a temp subscription to each
             * jid in the given list. JIDS already subscribed to are ignored. Any
             * errors encountered while subscribing (ie an invalid jid) are logged
             * but otherwise ignored.
             *
             * None of the jids in the given list is guarenteed to be subscribed
             * when this method returns. Subscription operations occur on a
             * work queue {@see #subscriptionInterval} {@see #subscriptionSlice},
             * whose execution will occur sometime after this method returns.
             *
             * An optional reset parameter will unsubscribe from all temp subscriptions
             * in the entity cache before adding new subscriptions. Existing temp
             * subs that are in the given list are not removed or resubscribed.
             *
             * @param {[jabberwerx.JID|String]} jids List of jids or JID strings
             *                                  to subscribe. May be an empty array.
             * @param {Boolean} [reset] Unsubscribe from all temp subs currently in the
             *                          entity cache before subscribing to jids. Default is
             *                          false, no unsubscriptions are performed.
             * @throws TypeError if jids is not an array.
             */
            subscribeAll: function(jids, reset) {
                if (!jabberwerx.util.isArray(jids)) {
                    throw new TypeError("jids must be an array");
                }
                if ((reset !== undefined) && reset) {
                    var that = this;
                    //add all current temp_subs in entity cache to (deduped)
                    //_pendingUnsub map
                    jabberwerx.$.each(this.client.entitySet.toArray(), function() {
                        if ((this.properties.temp_sub !== undefined) &&
                            (!that._pendingUnsubs.hasOwnProperty(this.jid))) {
                                that._pendingUnsubs[this.jid] = true;
                        }
                    });
                }
                for (var i = 0; i < jids.length; ++i) {
                    try {
                        var tjid = jabberwerx.JID.asJID(jids[i]).getBareJIDString();
                    } catch (ex) {
                        //bad jid, log (warn) and skip
                        jabberwerx.util.debug.warn("Skipping " + jids[i] + ", could not parse JID");
                        continue;
                    }
                    if (this._pendingUnsubs.hasOwnProperty(tjid)) {
                        delete this._pendingUnsubs[tjid];
                    }
                    var entity = this.client.entitySet.entity(tjid);
                    if (entity && (entity.properties.temp_sub !== undefined)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", already a quick contact","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    if (this._pendingSubs.hasOwnProperty(tjid)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", already in pending subscriptions","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    this._pendingSubs[tjid] = true;
                }
                if (!this._pendingTimer) {
                    this._processPending(); //process the first slice, sets timer as needed
                } //else list processing will resume with next timer exec
            },
            /**
             * This function removes temp presence feature for the given jid.
             * and sends direct presence stanza to the jid.
             * Returns false if not currently subscribed to the temp presence
             * from jid and true otherwise.
             * @param {JID} jid for which to subscribe to temp presence changes
             * @returns {Boolean} <tt>true</tt> if successfully removed, <tt>false</tt> if unsuccessful
             */
            unsubscribe: function(jid) {
                jid = jabberwerx.JID.asJID(jid).getBareJID();
                delete this._pendingUnsubs[jid.toString()]; //delete from pending unsubs as needed
                delete this._pendingSubs[jid.toString()]; //delete from pending subs as needed
                var retVal = this.client.controllers.capabilities.removeFeatureFromJid(jid,'http://webex.com/connect/temp-presence+notify');
                var ent = this.client.entitySet.entity(jid);
                if (ent) {
                    if (ent instanceof jabberwerx.cisco.QuickContact) {
                        ent.remove();
                    } else {
                        delete ent.properties.temp_sub;
                        // Clear their presence list if the entity is a RosterContact and in the
                        // "from" or "none" subscription state
                        if (ent.properties.subscription == "from" ||
                            ent.properties.subscription == "none") {
                            ent.updatePresence(null);
                        }
                        this.client.entitySet.event("entityUpdated").trigger(ent);
                    }
                }
                return retVal;
            },
            /**
             * Unsubscribe temp subscriptions for multiple contacts. Unsubscribe
             * from any temp subscriptions to the jids in the given list. If no
             * temp subscription exists for the jid it is ignored. Any
             * errors encountered while unsubscribing (ie an invalid jid) are
             * logged but otherwise ignored.
             *
             * None of the jids in the given list is guarenteed to be unsubscribed
             * when this method returns. Bulk Subscription operations occur on a
             * work queue {@see #subscriptionInterval} {@see #subscriptionSlice},
             * whose execution will occur sometime after this method returns.
             *
             * @param {[jabberwerx.JID|String]} jids List of bare JIDs or
             *                                  JID Strings to unsubscribe.
             *                                  May be an empty array.
             * @throws TypeError if jids is not an array.
             */
            unsubscribeAll: function(jids) {
                if (!jabberwerx.util.isArray(jids)) {
                    throw new TypeError("jids must be an array");
                }
                for (var i = 0; i < jids.length; ++i) {
                    try {
                        var tjid = jabberwerx.JID.asJID(jids[i]).getBareJIDString();
                    } catch (ex) {
                        //bad jid, log (warn) and skip
                        jabberwerx.util.debug.warn("Skipping " + jids[i] + ", could not parse JID");
                        continue;
                    }
                    if (this._pendingSubs.hasOwnProperty(tjid)) {
                        delete this._pendingSubs[tjid];
                    }
                    var entity = this.client.entitySet.entity(tjid);
                    if (!entity || (entity.properties.temp_sub === undefined)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", not a quick contact","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    if (this._pendingUnsubs.hasOwnProperty(tjid)) {
                        /*DEBUG-BEGIN*/
                        jabberwerx.util.debug.log("Skipping " + tjid + ", already in pending unsubs","quickcontact");
                        /*DEBUG-END*/
                        continue;
                    }
                    this._pendingUnsubs[tjid] = true;
                }
                if (!this._pendingTimer) {
                    this._processPending(); //process the first slice, sets timer as needed
                } //else list processing will resume with next timer exec
            },
            /**
             * Deletes the given entity.
             * This method is invoked from {@link jabberwerx.Entity#remove} method.
             * @param {jabberwerx.cisco.QuickContact} entity The entity to delete
             * @throws {TypeError} If {entity} is not a Contact
             */
            removeEntity: function(entity) {
                if (!(entity && entity instanceof jabberwerx.cisco.QuickContact)) {
                    throw new TypeError("entity must be a quick contact");
                }

                var jid = entity.jid;
                entity.destroy();
                this.unsubscribe(jid);
            },
            /**
             * <p>Cleanup QuickContact entity on behalf of the client entity set
             * {@link jabberwerx.EntitySet}.</p>
             *
             * @param {jabberwerx.Entity} entity The entity to destroy
             */
            cleanupEntity: function(entity) {

                this.client.controllers.capabilities.removeFeatureFromJid(entity.jid,
                                                                          'http://webex.com/connect/temp-presence+notify');
                entity.remove();
            },

            /**
             * Handle custom serialization. Override base class to clear pending
             * work queue timer as needed. _pending queues are persisted automatically.
             */
            willBeSerialized: function () {
                if (this._pendingTimer !== undefined) {
                    jabberwerx.system.clearInterval(this._pendingTimer);
                    delete this._pendingTimer;
                }
                this._super();
            },
            /**
             * Handle custom serialization. Override base class to start pending
             * work queue timer if a queue is not empty.
             */
            graphUnserialized: function () {
                this._super();
                this._checkTimer();
            },

            /**
             * Handles cleanup on disconnect. Removes temp-presence+notify features
             * from caps controller for all quick contacts, removes them from entity
             * cashe.
             * @private
             * @param {jabberwerx.EventObject} evt The event object.
             */
            _handleStatusChange: function(evt) {
                if (evt.data.next == jabberwerx.Client.status_disconnected) {
                    //clear pending subscription queues on disconnect
                    this._pendingSubs = {};
                    this._pendingUnsubs = {};
                    this._checkTimer();
                }
            },


            /**
             * This function is invoked when presence stanza for the quick contacts
             * is received. It extracts presence from message stanza and updates
             * it in the entity set.
             * @private
             * @return {Boolean}
             */
             _presenceReceived: function(eventObj) {
                var presence = jabberwerx.$(eventObj.selected);
                /*DEBUG-BEGIN*/
                jabberwerx.util.debug.log("Received temp presence notification.");
                /*DEBUG-END*/
                for (var i = 0 ; i < presence.length; i++) {
                    if (presence[i]) {
                        var prs = jabberwerx.Stanza.createWithNode(presence[i]);
                        var bareJidStr = prs.getFromJID().getBareJIDString();
                        var entity = this.client.entitySet.entity(bareJidStr);
                        if (!entity) {
                            entity = new jabberwerx.cisco.QuickContact(bareJidStr, this);
                            this.client.entitySet.register(entity);
                        }
                        entity.updatePresence(prs);
                    }
                }

                return true;
             },

            /**
             * Resubscribes to receive temp presence from roster contacts with subscription
             * not "both" and not "to" when one of the resources for the contact comes online.
             * @private
             * @return {Boolean}
             */
             _handleResourcePresenceUpdate: function(eventObj) {
                var presence = eventObj.data.presence;
                var nowAvailable = eventObj.data.nowAvailable;
                var jid =  eventObj.data.fullJid;
                var entity = this.client.entitySet.entity(jid.getBareJID());
                //If resource becomes available and it's a contact with not "both" and not "to"
                //subscription status, we need to resubscribe
                if (entity && entity instanceof(jabberwerx.RosterContact) &&
                    entity.properties.subscription != "both" &&
                    entity.properties.subscription != "to" &&
                    nowAvailable) {
                    var p = this.client.getCurrentPresence().clone();

                    var item = jabberwerx.$(p.getNode()).find("c[xmlns='http://jabber.org/protocol/caps']");
                    item.remove();


                    p.setTo(entity.jid.getBareJID());
                    this.client.sendStanza(p);
                }
                return false;
             },

            /**
             * Checks for entity cache updates for RosterContacts
             * @private
             * @return {Boolean}
             */
            _handleEntityUpdated: function(eventObj) {
                var entity = eventObj.data;
                if (entity.properties.temp_sub &&
                    entity instanceof jabberwerx.RosterContact) {

                    if (entity.properties.subscription == "both" ||
                        entity.properties.subscription == "to") {
                        this.unsubscribe(entity.jid);

                        //DEBUG-BEGIN
                        jabberwerx.util.debug.log("removing temp sub property from " + entity.jid);
                        //DEBUG-END
                    } else if (entity.properties.subscription == "from"){
                        this.client.controllers.capabilities.addFeatureToJid(entity.jid,'http://webex.com/connect/temp-presence+notify');
                        //DEBUG-BEGIN
                        jabberwerx.util.debug.log("resending temp-presence+notify caps to " + entity.jid);
                        //DEBUG-END
                    }
                }
                return false;
            },

            /**
             * Checks for entity cache removes for RosterContacts
             * @private
             * @return {Boolean}
             */
             _handleEntityRemoved: function(eventObj) {
                var entity = eventObj.data;
                if (entity.properties.temp_sub) {
                    if (    this.client.isConnected() &&
                            !(entity instanceof jabberwerx.cisco.QuickContact)) {
                        // retain!
                        var quick = new jabberwerx.cisco.QuickContact(entity.jid, this);
                        quick.apply(entity);
                        this.client.entitySet.register(quick);
                        this.subscribe(quick.jid);
                    } else if (!this.client.isConnected()) {
                        // needs to be cleaned up
                        this.unsubscribe(entity.jid);
                    }
                }

                return false;
             },

            /**
             * @private
             * pending queue timer function. Send up to subscriptionSlice subs
             * or unsubs. Queued subs are always given priority.
             * Generated exceptions or errors (sub/unsub return false) are
             * logged but otherwise ignored. Reschedules if a non empty queue
             * still exists after processing slice.
             */
            _processPending: function() {
                var that = this;
                var queues = [{queue: this._pendingSubs, func: "subscribe"},
                              {queue: this._pendingUnsubs, func: "unsubscribe"}];
                var currQueue = 0;
                var sliceCounter = 0;
                var totalSlices = Math.max(1, this.subscriptionSlice);
                while (sliceCounter < totalSlices && currQueue < queues.length) {
                    for (var oneJID in queues[currQueue].queue) {
                        if (queues[currQueue].queue.hasOwnProperty(oneJID)) {
                            try {
                                if (!this[queues[currQueue].func].apply(this, [oneJID])) {
                                    jabberwerx.util.debug.warn(jabberwerx._("{0}({1}) returned false", queues[currQueue].func, oneJID));
                                }
                            } catch (ex) {
                                jabberwerx.util.debug.warn(jabberwerx._("{0}({1}) threw exception: {2}", queues[currQueue].func, oneJID, ex.message));
                            }
                            if (++sliceCounter == totalSlices) {
                                break; //breaks all the way out
                            }
                        }
                    }
                    currQueue++;
                }
                delete this._pendingTimer;
                this._checkTimer();
            },
            /**
             * @private
             * Checks a given queue (map) to see if any instance property exists
             * returns true if the given object only contains prototype properties
             *
             */
            _isEmpty: function(queue) {
                for (var p in queue) {
                    if (queue.hasOwnProperty(p)) {
                        return false;
                    }
                }
                return true;
            },
            /**
             * @private
             * Set _pendingTimer if pending queues are not empty and a timer is not already running
             * Clear and delete timer as needed.
             */
            _checkTimer: function() {
                if (!this._isEmpty(this._pendingSubs) || !this._isEmpty(this._pendingUnsubs)) {
                    if (this._pendingTimer === undefined) {
                        var that = this;
                        var timerTime = Math.max(0, this.subscriptionInterval)*1000;
                        this._pendingTimer = jabberwerx.system.setTimeout(function(){that._processPending();}, timerTime);
                    }
                } else if (this._pendingTimer) {
                    jabberwerx.system.clearTimeout(this._pendingTimer);
                    delete this._pendingTimer;
                }
            },
            /**
             * @private
             * Map jid:true, subcribe queue
             */
            _pendingSubs: {},
            /**
             * @private
             * Map jid:true unsubscribe queue
             */
            _pendingUnsubs: {},
            /**
             * @private
             * Pending queue timer handle. property is undefined
             * when not executing or scheduled to execute.
             */
            _pendingTimer: undefined,

            /**
             * @property
             * @type Number
             *
             * The bulk subscription work queue timer interval.
             * The time in seconds between processing of batched subscribe and
             * unsubscribe operations in the pending work queues.
             *
             * For example the default value of
             * 0.5 means {@see #subscriptionSlice) subscribes/unsubscribes are
             * executed twice a second.
             *
             * Value should be in [0,1]. A value of <= 0 is treated as 0
             * and implies all pending subscription operations will be executed
             * (asynchronously) as soon as possible.
             */
            subscriptionInterval: 0.5,

            /**
             * @property
             * @type Integer
             *
             * The number of subscription operations performed during one
             * pending work queue timer execution.
             * This property defines the number of subscribes or
             * unsubscribes to be attempted during one timer
             * execution {@see #subscriptionInterval}.
             *
             * The value should be a positive integer. Values <= 0 are treated
             * as if they were == 1.
             */
            subscriptionSlice: 10

        }, "jabberwerx.cisco.QuickContactController");
})(jabberwerx);

/*build/dist/CAXL-debug-2014.04.10787/src/model/QuickContact.js*/
/**
 * filename:        QuickContact.js
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2009-2011 Cisco Systems, Inc.  All Rights Reserved.
 */

;(function(jabberwerx) {
    /** @private */
    jabberwerx.cisco.QuickContact = jabberwerx.Contact.extend(/** @lends jabberwerx.cisco.QuickContact.prototype */ {
        /**
         * @class
         * <p>QuickContact object which is temporary subscription contact. This object SHOULD NOT
         * be created directly. Instead, a subscription to a contact should be initiated using
         * {@link jabberwerx.cisco.QuickContactController#subscribe}. Upon receiving a
         * presence update for this temporarily subscribed to contact, a new QuickContact object
         * for this contact will be created.</p>
         *
         * @description
         * <p>Creates a new QuickContact with the given jid and QuickContacController.</p>
         *
         * @param   {jabberwerx.JID|String} jid A jid corresponding to the QuickContact been created.
         * @param   {jabberwerx.cisco.QuickContactController} quickContactCtrl The creating
         *          QuickContactController
         * @throws  {TypeError} If {quickContactCtrl} is not a valid QuickContactController
         * @constructs jabberwerx.cisco.QuickContact
         * @extends jabberwerx.Contact
         */
        init: function(jid, quickContactCtrl) {
            if (!(quickContactCtrl &&
                  quickContactCtrl instanceof jabberwerx.cisco.QuickContactController)) {
                throw new TypeError("quickContactCtrl must be provided and must be of type" +
                                    "jabberwerx.cisco.QuickContactController");
            }
            this._super(jid, quickContactCtrl);
            
            this.properties.temp_sub = true;
        },

        /**
         * @private
         * Implementation of the empty jabberwerx.Entity._handleUnavailable method.
         */
        _handleUnavailable: function(presence) {
            var pres = this.getPrimaryPresence();
            if (!pres) {
                this._insertPresence(presence);
            } else if (pres.getType() == "unavailable") {
                this._clearPresenceList();
                this._insertPresence(presence);
            }
        }
    }, 'jabberwerx.cisco.QuickContact');
})(jabberwerx);
