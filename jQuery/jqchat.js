/*
 *
 * Demo CAXL application using jQuery and jQueryUI,
 *
 * Note: Most of the web page is constructed dynamically with jQuery
 * and jQuery UI, which is why the .html file is so barren
 */

/*jslint browser: true*/
/*global $, jQuery, alert*/
/*jslint nomen: true */

var _app = null;
var JWA = {};

$(document).ready( function () {

// put functions inside document ready
// to avoid contaminating the global namespace

	// create a var and manage it depending
	// upon window focus or blur for notifications
	var window_focus;

	$(window).focus(function() {
		window_focus = true;
	}).blur(function() {
		window_focus = false;
	});


    log = function (type, details) {
        $("#log").append(type + ": " + details + "<BR>");
        $('#log').scrollTop(100000);
    };

    // we use an application in order to store the state
    // so we can survive a browser refresh
    newApplication = function () {
        var retApp = new JWA.Application();
        return retApp;
    };

    // save the application to survive browser refresh
    _save = function () {
        log("window", "saving begin");

        try {
            jabberwerx.util.saveGraph(_app, demoConfig.appTag);
        } catch (e) {
            log("window", "saving failed: " + e.message);
        }

        _app._setState(-1);
        _app = null; //saved refs are no longer valid and should be invaldated
        log("window", "saving end");
    };

    // load saved application, create new one if it doesn't exist
    _load = function () {
        log("window", "loading begin");

        _app = jabberwerx.util.loadGraph(demoConfig.appTag);
        if (!_app) {
            log("window", "creating new application");
            _app = newApplication();
            _app._login();
        } else {
            log("window", "application already created");
            _app._login();
        }
        _app._updateState();
        log("window", "loading end");
    };

    // Save app during browser refresh
    jabberwerx.$(window).bind("unload", function () {
        log("window", "onUnload begin");
        _save();
        log("JWA", "onUnload end");
    });

    // utility function to remove an element from an array
    remove = function (arr, item) {
        var i;
        for (i = arr.length; i > 0; i--) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
        return (arr);
    };

    // we identify elements in the ui by jid, group name, etc.
    // but since the DOM can't handle things like username@domain as
    // ids, this function converts them into a unique string
    // that the DOM can handle
    fixString = function (inString) {
        var newstring, cutstring, stringToChange, slash;
        // Turn string into a string we can use as a DOM identifier
        // Cut off the jid at the / for resource
        // Remove @ and . and spaces
        if (inString === null) {
            log("JWA", "got null in fixString");
            return (null);
        }
        stringToChange = inString.toString();
        slash = stringToChange.indexOf("/");
        if (slash !== -1) {
            cutstring = stringToChange.substring(0, slash);
        } else {
            cutstring = stringToChange;
        }
        newstring = cutstring.replace(/@/g, "");
        newstring = newstring.replace(/\./g, "");
        newstring = newstring.replace(/ /g, "");
        // get base64 hash and remove "="
        newstring = btoa(newstring);
        newstring = newstring.replace(/=/g, "");
        return (newstring);
    };

    // replacement for alert
    myalert = function (message) {
        // Only one alert dialog allowed at a time
        if ($("#myalert").hasClass('ui-dialog-content')) {
            return;
        }
        // play error sound (Lollipop LowBattery sound)
        document.getElementById('error').play();
        $('<div id="myalert">' +
            '<BR><BR><div class="myalert">' + message + '</div><br>' +
            '</div>').dialog({
            autoOpen: true,
            width: 300,
            height: 220,
            minWidth: 300,
            minHeight: 220,
            resizable: true,
            position: {
                my: "center top+20",
                at: "center top",
                of: window
            },
			dialogClass: "material",
            closeOnEscape: true,
            title: "Alert Message",
            show: {
                effect: "fold",
                duration: 100
            },
            close: function(event, ui) {
                $("#myalert").dialog("destroy").remove();
            },
            buttons: {
                "Ok": {
                    id: "ok",
                    text: "OK",
                    click: function() {
                        $("#myalert").dialog("close");
                    }
                }
            }
        });
    };

    // create a jQuery UI dialog for the log
    openLog = function () {
        $('<div id="logdialog"><div id="log" class="logarea">&nbsp</div></div>').dialog({
            autoOpen: true,
            width: 600,
            height: 300,
            minWidth: 600,
            minHeight: 300,
            resizable: true,
            position: {
                my: "left+10 bottom-10",
                at: "left bottom",
                of: window
            },
			dialogClass: "material",
            closeOnEscape: false,
            open: function(event, ui) {
                $(".ui-dialog-titlebar-close").hide();
            },
            title: "Log",
            show: {
                effect: "fold",
                duration: 100
            }
        });
    };

    // create a jQuery UI dialog for login
    openLogin = function () {
        // send back if login dialog exists
        if ($("#logindialog").hasClass('ui-dialog-content')) {
            if ($("#logindialog").dialog("isOpen") == true) {
                $("#logindialog").dialog("moveToTop");
                return;
            } else {
                $("#logindialog").dialog("open");
                return;
            }
        }

        $('<div id="logindialog">' +
            'Username:<br>' +
            '<input type="text" class="jqinput" name="username" id="username"></input><br><br>' +
            'Password:<br><input type="password" class="jqinput" name="password" id="password"></input><br><br>' +
            'BOSH URL:<br><input type="text" class="jqinput" name="boshurl" id="boshurl"></input><br><br>' +
            'Domain:<br><input type="text" class="jqinput" name="domain" id="domain"></input><br><br>' +
            '<input type="checkbox" name="secure" id="secure" value="unsecure">Secure<br>' +
            '</div>').dialog({
            autoOpen: true,
            width: 300,
            height: 380,
            minWidth: 300,
            minHeight: 380,
            resizable: true,
            position: {
                my: "left+10 top+10",
                at: "left top",
                of: window
            },
			dialogClass: "material",
            closeOnEscape: false,
            open: function(event, ui) {
                $(".ui-dialog-titlebar-close").hide();
            },
            title: "Login",
            show: {
                effect: "fold",
                duration: 100
            },
            buttons: {
                "Login": {
                    id: "login",
                    text: "Login",
                    click: function() {
                        _load();
                        _app._connect();
                    }
                }
            }
        });
        if (demoConfig.unsecureAllowed == true) {
            $("#secure").prop("checked", false);
        } else {
            $("#secure").prop("checked", true);
        }
        if (demoConfig.username) {
            $("#username").val(demoConfig.username);
        }
        if (demoConfig.password) {
            $("#password").val(demoConfig.password);
        }
        if (demoConfig.httpBindingURL) {
            $("#boshurl").val(demoConfig.httpBindingURL);
        }
        if (demoConfig.domain) {
            $("#domain").val(demoConfig.domain);
        }
    };

    // create a jQuery UI tabbed div for a chat window
    openChat = function (displayName, userJid) {
        newjid = fixString(userJid);

        // if the "tabs" section doesn't exist, create it
        if ($("#tabs").hasClass('tabchatarea') != true) {
            $("#mainDemoContainer").append('<div id="chattabs" class="chattabs"></div>');
            $("#chattabs").dialog({
                position: {
                    my: "left+10 top+10",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                title: "Chat Sessions",
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                resizable: true,
                width: 600,
                height: 600,
                minWidth: 500,
                minHeight: 300,
                draggable: true,
                close: function(event, ui) {
                    $(this).dialog("close");
                }
            });
            //       $("#chattabs").siblings('.ui-dialog-titlebar').css('height', '1em');
            $("#chattabs").append('<div id="tabs" class="tabchatarea"></div>');
            $("#tabs").append('<ul id="chatul"></ul>');
        }

        // shorten display name to fit in tab, if too long
        var dname = displayName;
        if (displayName.length > 12) {
            displayName = displayName.substring(0, 12) + "..";
        }
        // Add tab
        $("#chatul").append('<li id="li' + newjid + '" class="tabarea"><a href="#' + newjid + '" title="' + dname + '">' + displayName + '</a><span id="x' + newjid + '" class="ui-icon ui-icon-close xicon" onclick="closeTab(\'' + userJid + '\')"></span></li>');
        // Add tab's contents
        $("#tabs").append(
            '<div id="' + newjid + '" alt="' + newjid + '" class="chatpanel">' +
            '<div class="messagearea">' +
            '<div class="container" id="ch' + newjid + '">' +
            '</div>' +
            '</div>' +
            '<div class="sendarea" id="sa' + newjid + '">' +
            '<div class="chatstate" id="cs' + newjid + '"><img id="csi"' + newjid + '" class="csimage" src="jQchat/img/csIdle.png">' +
            '</div>' +
            '<textarea class="messagetext" alt="' + newjid + '" id="mt' + newjid + '"></textarea>' +
            '<input class="sendbutton" type="button" value="Send" onclick="_app._sendMessage(\'' + userJid + '\')" id="sb' + newjid + '"/>' +
            '</div>' +
            '<input id="to' + newjid + '" type="hidden" value="' + userJid + '" name="to' + newjid + '">' +
            '</div>');
        $("#sb" + newjid).button();
        $("#to" + newjid).val(userJid);

        var index = $('#tabs a[href="#' + newjid + '"]').parent().index();
        $("#tabs").show();
        $("#tabs").tabs();

        $("#tabs").tabs("refresh");
        $("#tabs").tabs({
            active: index
        });

        // If there's a chat session stored in cache
        // so chats can survive browser refresh, get it
        // and display it (and add clickable links if any)
        var newchat = sessionStorage.getItem(newjid);
        if (newchat !== "undefined") {
            $("#ch" + newjid).html(newchat);
            $("#ch" + newjid).linkify();
			var thisid = document.getElementById("ch" + newjid);
			emojify.run(thisid);
       }
        log("openChat", "opened chat");
        // ENTER key sends message
        $("#mt" + newjid).keyup(function(e) {
            if (e.keyCode === $.ui.keyCode.ENTER) {
                e.stopPropagation();
                var chosen = $(this).attr("alt");
                log("openChat", "got enter key for " + chosen);
                $("#sb" + chosen).trigger("click");
                return false;
            }
        });
        // keep chat scrolled to the bottom
        $('.messagearea').animate({
            scrollTop: 10000
        });
        $("#mt" + newjid).focus();
    };

    // Close a chat tab
    closeTab = function (userJid) {
        var newjid = fixString(userJid);
        $("#" + newjid).remove();
        $("#li" + newjid).remove();
        if ($("#tabs > ul > li").first().length != 0) {
            $("#tabs").tabs("refresh");
        } else {
            $("#tabs").remove();
            $("#chattabs").remove();
        }
        _app._closeSession(userJid);
    };

    // return the image src for various presence states
    // such as Available, Away, etc.
    getSrcImage = function (show) {
        var src;
        switch (show) {
            case "away":
                src = "jQchat/img/Away.png";
                break;
            case "xa":
                src = "jQchat/img/Away.png";
                break;
            case "unavailable":
                src = "jQchat/img/Offline.png";
                break;
            case "Meeting":
                src = "jQchat/img/Meeting.png";
                break;
            case "available":
            case "chat":
                src = "jQchat/img/Available.png";
                break;
            case "dnd":
                src = "jQchat/img/DND.png";
                break;
            default:
                src = "jQchat/img/Offline.png";
                break;
        }
        return (src);
    };

    // Here's where the application starts
    JWA.Application = jabberwerx.JWModel.extend({

        // Initialize the client and most bindings
        init: function() {

            console.log('JWA: Application.init begin');
            this._super();

            // Some initializations should happen here. These should only be called once
            this.client = new jabberwerx.Client(demoConfig.resource);
            this.controller = new jabberwerx.Controller(this.client, "jqchat");

            // bind necessary event handlers
            this.client.event("clientConnected").bind(this.invocation('_onClientConnected'));
            this.client.event("clientStatusChanged").bind(this.invocation('_onClientStatusChanged'));
            this.client.event("presenceReceived").bind(this.invocation('_updatePresence'));
            this.client.event("reconnectCountdownStarted").bind(this.invocation('_onClientReconnect'));

            // quick contact roster controller, unused right now
            this.qcController = new jabberwerx.cisco.QuickContactController(this.client);

            // main roster controller
            this.rosterController = new jabberwerx.RosterController(this.client);

            console.log('JWA: Application.init end');
        },

        // Application exiting, remove bindings, clear client
        destroy: function() {
            // unbind events here
            this.client.event("reconnectCountdownStarted").unbind(this.invocation('_onClientReconnect'));
            this.client.event("presenceReceived").unbind(this.invocation('_updatePresence'));
            this.client.event("clientStatusChanged").unbind(this.invocation("_onClientStatusChanged"));
            this.client.event("clientConnected").unbind(this.invocation('_onClientConnected'));
            this.client = null;

            this._super();
        },

        // If connected, show roster, bind events, otherwise show the login dialog
        // This is mostly a browser refresh function
        _login: function() {
            log("JWA", "logging in");
            if (_app.client.isConnected()) {
                log("JWA", "client is already connected");
                _app._createRoster();
                _app._loadRoster();
				_app._setAvailable();

                // chat controller for regular chat
                this.chatController = new jabberwerx.ChatController(this.client);

                // trigger _openChatSession when someone starts a chat, which can occur either when
                // the user initiates a chat, or a contact initiates a chat
                this.chatController.event("chatSessionOpened").bind(this.invocation('_openChatSession'));

                // entity events
                this.client.entitySet.event("entityUpdated").bind(this.invocation('_onEntityUpdated'));
                this.client.entitySet.event("entityAdded").bind(this.invocation('_onEntityAdded'));
                this.client.entitySet.event("entityRemoved").bind(this.invocation('_onEntityRemoved'));

                // multi-user chat controller for multi-user chat rooms
                this.mucController = new jabberwerx.MUCController(this.client);
                var room = null;

            } else {
                log("JWA", "not connected");
                openLogin();
            }
        },

        // User has entered login information (or it comes from demoConfig)
        // so connect now and bind events
        _connect: function() {
            try {
                // Account for user accidentally adding a @domain to their username
                // if so, strip it from the username, because we're going to add
                // the domain in the connect operation
                var username = $("#username").val();
                var index = username.indexOf("@");
                username = username.substr(0, index != -1 ? index : username.length);

                // If the user specified information in the login dialog, use it
                if ($("#logindialog").hasClass('ui-dialog-content')) {
                    if ($('#secure').is(':checked')) {
                        jabberwerx._config.unsecureAllowed = false;
                    } else {
                        jabberwerx._config.unsecureAllowed = true;
                    }
                    var connectArgs = {
                        httpBindingURL: $("#boshurl").val()
                    };
                    this.client.connect($("#username").val() + "@" + $("#domain").val(), $("#password").val(), connectArgs);
                } else {
                    // otherwise, use the demoConfig for the parameters
                    // this should never happen, though since we fill the dialog
                    // with the demoConfig parameters
                    jabberwerx._config.unsecureAllowed = demoConfig.unsecureAllowed;
                    var connectArgs = {
                        httpBindingURL: demoConfig.httpBindingURL
                    };
                    this.client.connect(demoConfig.username + "@" + demoConfig.domain, demoConfig.password, connectArgs);
                }
                // chat controller
                this.chatController = new jabberwerx.ChatController(this.client);
                // trigger _openChatSession when someone starts a chat, which can occur either when
                // the user initiates a chat, or a contact initiates a chat
                this.chatController.event("chatSessionOpened").bind(this.invocation('_openChatSession'));
                // entity events

                this.client.entitySet.event("entityUpdated").bind(this.invocation('_onEntityUpdated'));
                this.client.entitySet.event("entityAdded").bind(this.invocation('_onEntityAdded'));
                this.client.entitySet.event("entityRemoved").bind(this.invocation('_onEntityRemoved'));

                // multi-user chat controller for multi-user chat rooms
                this.mucController = new jabberwerx.MUCController(this.client);
                var room = null;

            } catch (ex) {
                jabberwerx.util.debug.warn(ex.message);
                console.log("JWA: could not connect: " + ex.message);
            }
        },

        // Disconnect, like it says
        disconnect: function() {
            if (!this.client.isConnected()) {
                log("JWA", "client is already disconnected");
            } else {
                this.client.disconnect();
            }
        },

        // Create the contact roster
        _createRoster: function() {
            log("JWA", "creating the roster");

            // If the roster already exists, just move to top and return
            if ($("#roster").hasClass('ui-dialog-content')) {
                if ($("#roster").dialog("isOpen") == true) {
                    $("#roster").dialog("moveToTop");
                    return;
                } else {
                    $("#roster").dialog("open");
                    return;
                }
            }

            $("#mainDemoContainer").append('<div id="roster"></div>');
            $("#roster").append('<div id="mypresence" class="mypresence">');
            $("#roster").append('<div id="rosterlist" class="rosterlist"></div>');
            $("#roster").dialog({
                width: 295,
                height: 720,
                minWidth: 295,
                minHeight: 500,
                resizable: true,
                position: {
                    my: "right-10 top+10",
                    at: "right top",
                    of: window
                },
                title: "Roster",
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                close: function(event, ui) {
                    if (_app)
                        _app.disconnect();
                    _app = null;
                    $(this).dialog("close");
                },
                buttons: {
                    "Logout": {
                        id: "logout",
                        text: "Logout",
                        click: function() {
                            if (_app)
                                _app.disconnect();
                            $(this).dialog("close");
                        }
                    }
                }
            });

            // Add an image for my own presence
            $("#mypresence").append('<img id="mypimage" class="mypimage" src="jQchat/img/Available.png">&nbsp;&nbsp;');

            // Add a select list for my own presence
            $("#mypresence").append('<select name="presence" id="presence" class="pselect"></select>');
            $("#presence").append('<option selected="selected" data-class="available" value="available">Available</option>');
            $("#presence").append('<option value="away" data-class="away">Away</option>');
            $("#presence").append('<option value="dnd" data-class="dnd">Do Not Disturb</option>');

			 $("#presence").selectmenu({
				select: function( event, ui ) {
				   $("#mystatus").val("");
				   _app._sendPresence();
				}
			 });

            // Button for adding contacts
            $("#mypresence").append('<button id="cbutton" title="Add Contact" class="cbutton">&nbsp;</button>');
            $("#cbutton").button({
                icons: {
                    primary: "ui-icon-plusthick"
                },
                text: false
            }).click(function(event) {
                _app._addContact();
            });;

            // Button for opening chat room
            $("#mypresence").append('<button id="mucbutton" title="Open Chat Room" class="mucbutton">&nbsp;</button>');
            $("#mucbutton").button({
                icons: {
                    primary: "ui-icon-signal-diag"
                },
                text: false
            }).click(function(event) {
                _app._createChatRoom();
            });;

            // Custom presence text input field
            $("#mypresence").append('<input type="text" class="prtext" name="mystatus" id="mystatus" placeholder="Available"></input>');

            // update custom status if user presses enter in custom status field, or if user just leaves that field
            $("#mystatus").keypress(function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 13) {
                    _app._sendPresence();
                    e.preventDefault();
                    return true;
                }
            });
            $("#mystatus").focusin(function() {
                $("#mystatus").css(
                    "border", "1px solid #9ecaed",
                    "border-radius", "7px",
                    "box-shadow", "0 0 10px #9ecaed",
                    "background", "#9ecaed",
                    "outline-style", "none",
                    "outline", "none",
                    "-webkit-box-shadow", "0px 0px 4px #4195fc",
                    "-moz-box-shadow", "0px 0px 4px #4195fc",
                    "box-shadow", "0px 0px 4px #4195fc"
                );
            });
            $("#mystatus").focusout(function() {
                _app._sendPresence();
                // I had some css here to make the input box disappear
                // when not editing custom status, in order
                // to mimic the Jabber/Windows client, but it didn't look very good
                //          $("#mystatus").css(
                //          );
            });
			// if we're creating the roster, this must be right after log in
			// so tell everyone we're available
        },

        // Load the roster with contacts
        _loadRoster: function() {

            log("JWA", "loading the roster");
            if ($("#rosterlist").hasClass("ui-accordion")) {
                return;
            }
            // If you want the list to be sortable (drag and drop
            // groups into a different order), comment this out
            // and uncomment the next section
            $("#rosterlist").accordion({
                header: "> div > h3"
            });
            /*
// I find sortable to be annoying
// but you can put this back in if you're ok with it
//
         $("#rosterlist").accordion({
               header: "> div > h3"
            }).sortable( {
               axis: "y",
               handle: "h3",
               stop: function( event, ui ) {
                  // IE doesn't register the blur when sorting
                  // so trigger focusout handlers to remove .ui-state-focus
                  ui.item.children( "h3" ).triggerHandler( "focusout" );
                  // Refresh accordion to handle new order
                  $( this ).accordion( "refresh" );
               }
            });
*/
            var groups = _app.client.entitySet.getAllGroups();
            var groupArray = [];
            // alphebetize the group names
            for (var k in groups) {
                groupArray.push(groups[k]);
            }
            groupArray.sort();
            var arrayLength = groupArray.length;
            // iterate through the alphebetized groups and add contacts
            for (var i = 0; i < arrayLength; i++) {
                var thisGroup = groupArray[i];
                log("loadRoster", thisGroup);
                var grouper = fixString(thisGroup);
                $("#rosterlist").append('<div class="grouphead" id="' + grouper + '"><h3>' + thisGroup + '</h3><div id="gr' + grouper + '" class="ingroup"></div></div>');
                $("#gr" + grouper).disableSelection();
            }
            _app._loadGroups();
            _app._updateRosterPresence("all");
            $("#rosterlist").disableSelection();
            $("#rosterlist").accordion("refresh");
            $("#rosterlist").accordion({
                active: 0
            });
//			_app._requestProfiles();
        },

        // The loadGroups portion of loading the roster with contacts
        _loadGroups: function() {

            log("JWA", "loading groups");
            var groups = _app.client.entitySet.getAllGroups();
            var numGroups = groups.length;

            // now load the groups that are left
            for (i = 0; i < numGroups; i++) {
                var thisGroup = groups[i];
                _app._loadGroup(thisGroup);
            }
            _app._loadUnassigned();
            _app._updateRosterPresence("all");
        },

        // The load individual group portion of loading roster
        _loadGroup: function(thisGroup) {
            var grouper = fixString(thisGroup);
            $("#gr" + grouper).empty();
            if (thisGroup != null) {
                var contactArray = [];
                _app.client.entitySet.each(function(entity) {
                    var groupList = entity.getGroups();
                    if (entity instanceof jabberwerx.RosterContact && ($.inArray(thisGroup, groupList) != -1)) {
                        var displayName = entity.getDisplayName();
                        var userJid = entity.jid.toString();
                        var newjid = fixString(userJid);
                        contactArray.push('<div title="' + displayName + ' (' + userJid + ')" id="ro' + newjid + grouper + '" group="' + thisGroup + '" jid="' + userJid + '" ondblclick="_app._openChat(\'' + userJid + '\')" class="contact">' +
                            '<section class="section">' +
                            '<img class="pimage" title="' + displayName + ' (' + userJid + ')" id="im' + newjid + '" src="jQchat/img/Offline.png">' +
                            '<div id="dn' + newjid + '">' + displayName + '</div>' +
                            '</section><section><div class="status" id="st' + newjid + '"></div>' +
                            '<div>' +
                            '<span title="Invite To Multi-User Chat" onclick="_app._inviteToMUCChat(\'' + userJid + '\',\'' + displayName + '\')" class="options ui-icon ui-icon-contact"></span>' +
                            '<span title="Remove" onclick="_app._removeContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-close"></span>' +
                            '<span title="Copy to Group" onclick="_app._updateGroups(\'' + userJid + '\',null,\'Copy\')" class="options ui-icon ui-icon-copy"></span>' +
                            '<span title="Move to Group" onclick="_app._updateGroups(\'' + userJid + '\',\'' + thisGroup + '\',\'Move\')" class="options ui-icon ui-icon-arrowthick-1-e"></span>' +
                            '<span title="Edit Contact" onclick="_app._updateContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-pencil"></span>' +
                            '<span title="Chat" onclick="_app._openChat(\'' + userJid + '\')" class="options ui-icon ui-icon-comment"></span>' +
                            '</section></div>');
                    }
                });
                // alphebetize the contacts and then add them
                contactArray.sort();
                var carrayLength = contactArray.length;
                for (var j = 0; j < carrayLength; j++) {
                    $("#gr" + grouper).append(contactArray[j]);
                }
            }
        },

        // Sometimes the roster has contacts that are unassigned to a group
        // This happens for various reasons (e.g. unresponseive to presence)
        // dump them into an "Unassigned" group
        _loadUnassigned: function() {
            var contactArray = [];
            _app.client.entitySet.each(function(entity) {
                var groupList = entity.getGroups();
                // add groupless contacts to the "Unassigned" group
                if (entity instanceof jabberwerx.RosterContact && (groupList.length == 0)) {
                    var thisGroup = "Unassigned";
                    groupList.push(thisGroup);
                    var grouper = fixString(thisGroup);
                    var displayName = entity.getDisplayName();
                    var userJid = entity.jid.toString();
                    var newjid = fixString(userJid);
                    contactArray.push('<div title="' + displayName + ' (' + userJid + ')" id="ro' + newjid + grouper + '" group="' + thisGroup + '" jid="' + userJid + '" ondblclick="_app._openChat(\'' + userJid + '\')" class="contact">' +
                        '<section class="section">' +
                        '<img class="pimage" title="' + displayName + ' (' + userJid + ')" id="im' + newjid + '" src="jQchat/img/Offline.png">' +
                        '<div id="dn' + newjid + '">' + displayName + '</div>' +
                        '</section><section><div class="status" id="st' + newjid + '"></div>' +
                        '<div>' +
                        '<span title="Invite To Multi-User Chat" onclick="_app._inviteToMUCChat(\'' + userJid + '\',\'' + displayName + '\')" class="options ui-icon ui-icon-contact"></span>' +
                        '<span title="Remove" onclick="_app._removeContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-close"></span>' +
                        '<span title="Copy to Group" onclick="_app._updateGroups(\'' + userJid + '\',null,\'Copy\')" class="options ui-icon ui-icon-copy"></span>' +
                        '<span title="Move to Group" onclick="_app._updateGroups(\'' + userJid + '\',\'' + thisGroup + '\',\'Move\')" class="options ui-icon ui-icon-arrowthick-1-e"></span>' +
                        '<span title="Edit Contact" onclick="_app._updateContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-pencil"></span>' +
                        '<span title="Chat" onclick="_app._openChat(\'' + userJid + '\')" class="options ui-icon ui-icon-comment"></span>' +
                        '</section></div>');
                    _app.rosterController.updateContact(userJid, displayName, groupList, _app.contactError);
                }
            });
            if (contactArray.length > 0) {
                // alphebetize the contacts and then add them
                contactArray.sort();
                var carrayLength = contactArray.length;
                for (var j = 0; j < carrayLength; j++) {
                    $("#gr" + grouper).append(contactArray[j]);
                }
            }
        },

        // Update the presence icon and status for all contacts in all groups
        _updateRosterPresence: function(oneJid) {
            var groups = this.client.entitySet.getAllGroups();
            var arrayLength = groups.length;
            for (i = 0; i < arrayLength; i++) {
                var thisGroup = groups[i];
                grouper = fixString(thisGroup);
                this.client.entitySet.each(function(entity) {
                    groupList = entity.getGroups();
                    if (entity instanceof jabberwerx.RosterContact && ($.inArray(thisGroup, groupList) != -1)) {
//						console.log(entity);
                        userJid = entity.jid.toString();
                        if ((userJid == oneJid) || (oneJid == "all")) {
                            newjid = fixString(userJid);
                            $("#gr" + grouper).find("#ro" + newjid).disableSelection();
                            try {
                                presence = entity.getPrimaryPresence();
                                if (presence != null) {
                                    var show = presence.getType() || presence.getShow() || "available";
                                    var status = presence.getStatus();
                                    var priority = presence.getPriority();
                                    // don't spam log with every change if this is just one jid
                                    if ((userJid == oneJid) && (oneJid !== "all")) {
                                        logstatus = status;
                                        if (logstatus == null) {
                                            logstatus = "(no status)";
                                        }
                                        log("JWA", userJid + ": " + thisGroup + " " + show + " " + logstatus);
                                    }
                                    if (show == "available") {
                                        $("#gr" + grouper).find("#im" + newjid).attr('src', "jQchat/img/Available.png");
                                        $("#gr" + grouper).find("#im" + newjid).attr('alt', 'Available');
                                    }
                                    var src = getSrcImage(show);
                                    $("#gr" + grouper).find("#im" + newjid).attr('src', src);
                                    if (status != null) {
                                        $("#gr" + grouper).find("#st" + newjid).html("&nbsp;&nbsp;&nbsp;" + status);
                                    } else {
                                        // approximate Jabber Windows behavior
                                        switch (show) {
                                            case "away":
                                                $("#gr" + grouper).find("#st" + newjid).html("&nbsp;&nbsp;Away");
                                                break;
                                            case "xa":
                                                $("#gr" + grouper).find("#st" + newjid).html("&nbsp;&nbsp;Extended Away");
                                                break;
                                            default:
                                                $("#gr" + grouper).find("#st" + newjid).html("");
                                                break;
                                        }
                                    }
                                    if (status == "Logged out" || priority == -1) {
                                        $("#gr" + grouper).find("#im" + newjid).attr('src', "jQchat/img/Offline.png");
                                    }
                                    if (status == null) {
                                        status = "(no status)";
                                    }
                                }
                            } catch (ex) {
                                log("JWA", "execption in presence " + ex);
                            }
                        }
                    }
                });
            }
        },

        // Empty the Roster
        _unloadRoster: function() {
            log("JWA", "unloading roster");
            if ($("#rosterlist").hasClass("ui-accordion")) {
                $("#rosterlist").accordion("destroy").remove();
            }
        },

        // Destroy the roster dialog
        _destroyRoster: function() {
            log("JWA", "destroying roster");
            if ($("#roster").hasClass('ui-dialog-content')) {
                $("#roster").dialog("destroy").remove();
            }
        },

        // Add a contact to your roster
        _addContact: function() {
            // Only one dialog allowed at a time
            if ($("#muchatroom").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#addcontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updatecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#removecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updategroups").hasClass('ui-dialog-content')) {
                return;
            }
            $('<div id="addcontact">' +
                'Display Name:<br>' +
                '<input type="text" class="jqinput" name="dname" id="dname"></input><br><br>' +
                'Contact JID:<br>' +
                '<input type="text" class="jqinput" name="jname" id="jname"></input><br><br>' +
                'Add to Group:<br>' +
                '<select name="groups" id="groups" class="pselect"></select><br><br>' +
                'Or Create New Group:<br>' +
                '<input type="text" class="jqinput" name="gname" id="gname"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 350,
                minWidth: 300,
                minHeight: 350,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Add New Contact",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#addcontact").dialog("destroy").remove();
                },
                buttons: {
                    "Add": {
                        id: "add",
                        text: "Add",
                        click: function() {
                            // no jid, no add
                            var jid = $("#jname").val();
                            if (jid == "") {
                                myalert("You must specify a JID to add/update a contact.");
                                $("#addcontact").dialog("close");
                                return;
                            }
                            // no nickname, use jid
                            nickname = $("#dname").val();
                            if (nickname == "") {
                                nickname = jid;
                            }
                            var thisGroup = $("#gname").val();
                            if (thisGroup == "") {
                                thisGroup = $("#groups").val();
                            }
                            log("addContact", nickname + " " + jid + " " + thisGroup);
                            _app._newContact(jid, nickname, thisGroup);
                            $("#addcontact").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#addcontact").dialog("close");
                        }
                    }
                }
            });

            // Load the select menu with existing groups
            var groups = _app.client.entitySet.getAllGroups();
            groups.sort();
            $("#groups").append('<option selected="selected" value="' + groups[0] + '">' + groups[0] + '</option>');
            for (i = 1; i < groups.length; i++) {
                $("#groups").append('<option value="' + groups[i] + '">' + groups[i] + '</option>');
            }
            $("#groups").selectmenu({
                select: function(event, ui) {
                    var thisGroup = $("#groups").val();
                }
            });
        },

        // Update Contact only allows you to change the display name (nickname)
        _updateContact: function(jid, thisGroup) {
            // Only one dialog allowed at a time
            if ($("#muchatroom").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updatecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#addcontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#removecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updategroups").hasClass('ui-dialog-content')) {
                return;
            }
            $('<div id="updatecontact">' +
                'Display Name:<br>' +
                '<input type="text" class="jqinput" name="dname" id="dname"></input><br><br>' +
                'Contact JID:<br><div id="jname"></div><br>' +
                'This Group:<br><div id="group"></div><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 280,
                minWidth: 300,
                minHeight: 280,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Edit Contact",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#updatecontact").dialog("destroy").remove();
                },
                buttons: {
                    "Update": {
                        id: "update",
                        text: "Update",
                        click: function() {
                            // no jid, no add
                            var jid = $("#jname").text();
                            if (jid == "") {
                                myalert("You must specify a JID to add/update a contact.");
                                $("#updatecontact").dialog("close");
                                return;
                            }
                            // no nickname, use jid
                            nickname = $("#dname").val();
                            if (nickname == "") {
                                nickname = jid;
                            }
                            _app._saveContact(jid, nickname, thisGroup);
                            $("#updatecontact").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#updatecontact").dialog("close");
                        }
                    }
                }
            });
            if (jid != null) {
                var entity = _app.client.entitySet.entity(jid);
                var displayName = entity.getDisplayName();
                $("#dname").val(displayName);
                $("#jname").text(jid);
            }
            if (thisGroup != null) {
                $("#group").text(thisGroup);
            }
            var grouper = fixString(thisGroup);
        },

        // Move or copy a contact from one group to another
        _updateGroups: function(jid, thisGroup, op) {
            // Only one dialog allowed at a time
            if ($("#muchatroom").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updategroups").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updatecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#removecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#addcontact").hasClass('ui-dialog-content')) {
                return;
            }
            $('<div id="updategroups">' +
                '<select name="groups" id="groups" class="pselect"></select>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 200,
                minWidth: 300,
                minHeight: 200,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: op + " to Group",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#updategroups").dialog("destroy").remove();
                },
                buttons: {
                    "Update": {
                        id: "update",
                        text: op,
                        click: function() {
                            var newGroup = $("#groups").val();
                            _app._contactUpdateGroups(jid, thisGroup, newGroup);
                            $("#updategroups").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#updategroups").dialog("close");
                        }
                    }
                }
            });
            var groups = _app.client.entitySet.getAllGroups();
            groups.sort();
            $("#groups").append('<option selected="selected" value="' + groups[0] + '">' + groups[0] + '</option>');
            for (i = 1; i < groups.length; i++) {
                $("#groups").append('<option value="' + groups[i] + '">' + groups[i] + '</option>');
            }
            $("#groups").selectmenu({
                select: function(event, ui) {}
            });
        },

        // Remove a contact from a group
        _removeContact: function(jid, thisGroup) {
            // Only one dialog allowed at a time
            if ($("#muchatroom").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#removecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updatecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updategroups").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#addcontact").hasClass('ui-dialog-content')) {
                return;
            }
            $('<div id="removecontact">' +
                '<br>Removing from group: ' + thisGroup +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 150,
                minWidth: 300,
                minHeight: 150,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Remove Contact",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#removecontact").dialog("destroy").remove();
                },
                buttons: {
                    "Remove": {
                        id: "remove",
                        text: "Remove",
                        click: function() {
                            _app._removeFromGroup(jid, thisGroup);
                            $("#removecontact").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#removecontact").dialog("close");
                        }
                    }
                }
            });
        },

        // multi-user chat room
        _MUChatRoom: function(roomname, subject) {
            // Only one dialog allowed at a time
            if ($("#muchatroom").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#removecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updatecontact").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#updategroups").hasClass('ui-dialog-content')) {
                return;
            }
            if ($("#addcontact").hasClass('ui-dialog-content')) {
                return;
            }
            $('<div id="muchatroom">' +
                '<div class="muchatarea">' +
                '<div class="muchtext" id="muchtext">' +
                '&nbsp;</div>' +
                '<div class="occupants" id="occupants">' +
                '<ul id="occupantlist" class="occupantlist">' +
                '</ul>' +
                '</div>' +
                '</div>' +
                '<div class="broadcastarea" id="broadcastarea">' +
                '<div class="mucsubject" id="mucsubject"></div>' +
                '<textarea class="broadcasttext" id="broadcasttext"></textarea>' +
                '<input class="sendbutton" type="button" value="Send" onclick="_app._broadcastMessage()" id="broadcastbutton"/>' +
                '</div>' +
                '</div>').dialog({
                autoOpen: true,
                width: 720,
                height: 600,
                minWidth: 600,
                minHeight: 600,
                resizable: true,
                position: {
                    my: "center center",
                    at: "center center",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: true,
                open: function(event, ui) {},
                title: roomname,
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    log("JWA", "exiting room");
                    _app.room.exit();
                    _app.room.destroy();
                    _app.room = null;
                    $("#muchatroom").dialog("destroy").remove();
                },
                buttons: {
                    "Changes": {
                        id: "changes",
                        text: "Change Subject",
                        click: function() {
                            _app._changeSubject();
                        }
                    },
                    "Changen": {
                        id: "changen",
                        text: "Change Nickname",
                        click: function() {
                            _app._changeNickname();
                        }
                    },
                    "Leave": {
                        id: "leave",
                        text: "Leave Chat Room",
                        click: function() {
                            $("#muchatroom").dialog("close");
                        }
                    }
                }
            });
            $("#broadcastbutton").button();
            $("#subjectbutton").button();
            $("#nickbutton").button();
            $("#mucsubject").text("Subject: " + subject);

            $("#broadcasttext").keyup(function(e) {
                if (e.keyCode === $.ui.keyCode.ENTER) {
                    e.stopPropagation();
                    $("#broadcastbutton").trigger("click");
                    return false;
                }
            });
            $('.muchtext').animate({
                scrollTop: 10000
            });
        },

        // Save a contact to the roster
        _saveContact: function(jid, nickname, thisGroup) {
            log("saveContact", jid + " " + nickname + " " + thisGroup);
            _app.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact && (entity.jid == jid)) {
                    try {
                        var groups = entity.getGroups();
                    } catch (ex) {
                        log("JWA", "saveContact " + ex);
                    }
                    // Contact is already in this group, must be an update
                    if ($.inArray(thisGroup, groups)) {
                        try {
                            _app.rosterController.updateContact(jid, nickname, groups, _app.contactError);
                        } catch (ex) {
                            log("JWA", "saveContact " + ex);
                        }
                        return;
                    } else {
                        // New group for this contact, add it to contact's groups
                        groups.push(thisGroup);
                        try {
                            _app.rosterController.updateContact(jid, nickname, groups, _app.contactError);
                        } catch (ex) {
                            log("JWA", "saveContact" + ex);
                        }
                        return;
                    }
                }
            });
        },
/*
<iq from='romeo@montague.net/orchard'
    to='juliet@capulet.com'
    type='get'
    id='vc2'>
<vCard xmlns='vcard-temp'/>
*/
		_requestProfiles: function() {
			// Function to handle response when it's received
			var getProfile = function(responseXml) {
				var iq = jabberwerx.Stanza.createWithNode(responseXml);
				if (iq.isError()) {
//					console.log("IQ Error");
//					console.log(iq);
					var iqError = iq.getErrorInfo();
					log("IQ Error",iqError.type + " " + iqError.text);
				} else {
					console.log("IQ Success");
					console.log(iq);
				}
			};
			var xmlContent = "<query xmlns='jabber:iq:search'/>";
//			var xmlContent = "<query xmlns='http://jabber.org/protocol/disco#info'/>";
//			var xmlContent = "<query xmlns='http://jabber.org/protocol/disco#items'/>";
//			var xmlContent = "<query xmlns='http://jabber.org/protocol/disco#info'/>";
            _app.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
					_app.client.sendIq("get", entity.jid.getBareJID(), xmlContent, getProfile);
                }
            });
		},

        // This adds the contact HTML to the DOM and updates the roster
        _newContact: function(jid, nickname, thisGroup) {
            log("newContact", jid + " " + nickname + " " + thisGroup);
            var groups = _app.client.entitySet.getAllGroups();
            var grouper = fixString(thisGroup);

            // see if contact already exists, get its groups
            var groupList = [];
            _app.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact && (entity.jid == jid)) {
                    groupList = entity.getGroups();
                }
            });

            // if this is a new group, add it to the visible roster
            if ($.inArray(thisGroup, groups) == -1) {
                log("newContact", "adding new group " + thisGroup);
                $("#rosterlist").append('<div class="grouphead" id="' + grouper + '"><h3>' + thisGroup + '</h3><div id="gr' + grouper + '" class="ingroup"></div></div>');
                $("#rosterlist").accordion("refresh");
                $("#gr" + grouper).disableSelection();
                var displayName = nickname;
                var userJid = jid;
                var newjid = fixString(userJid);
                $("#gr" + grouper).append('<div title="' + displayName + ' (' + userJid + ')" id="ro' + newjid + grouper + '" group="' + thisGroup + '" jid="' + userJid + '" ondblclick="_app._openChat(\'' + userJid + '\')" class="contact">' +
                    '<section class="section">' +
                    '<img class="pimage" title="' + displayName + ' (' + userJid + ')" id="im' + newjid + '" src="jQchat/img/Offline.png">' +
                    '<div id="dn' + newjid + '">' + displayName + '</div>' +
                    '</section><section><div class="status" id="st' + newjid + '"></div>' +
                    '<div>' +
                    '<span title="Invite To Multi-User Chat" onclick="_app._inviteToMUCChat(\'' + userJid + '\',\'' + displayName + '\')" class="options ui-icon ui-icon-contact"></span>' +
                    '<span title="Remove" onclick="_app._removeContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-close"></span>' +
                    '<span title="Copy to Group" onclick="_app._updateGroups(\'' + userJid + '\',null,\'Copy\')" class="options ui-icon ui-icon-copy"></span>' +
                    '<span title="Move to Group" onclick="_app._updateGroups(\'' + userJid + '\',\'' + thisGroup + '\',\'Move\')" class="options ui-icon ui-icon-arrowthick-1-e"></span>' +
                    '<span title="Edit Contact" onclick="_app._updateContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-pencil"></span>' +
                    '<span title="Chat" onclick="_app._openChat(\'' + userJid + '\')" class="options ui-icon ui-icon-comment"></span>' +
                    '</section></div>');
            }
            try {
                if ($.inArray(thisGroup, groupList) == -1) {
                    groupList.push(thisGroup);
                }
                // Update the CAXL roster with this contact
                _app.rosterController.updateContact(jid, nickname, groupList, _app.contactError);
            } catch (ex) {
                log("JWA", "newContact " + ex);
            }
        },

        // This updates the HTML in the DOM and the CAXL roster
        // when contacts are moved or copied
        _contactUpdateGroups: function(jid, oldGroup, newGroup) {
            // if oldGroup is not null, then this is a move
            // if oldGroup is null, then this is a copy

            // do this in preparation for the possibility
            // that moving away from this group will leave the group empty
            var groups = _app.client.entitySet.getAllGroups();
            var ctgroups = [];
            for (i in groups) {
                ctgroups.push(groups[i]);
            }
            for (i in groups) {
                ctgroups[ctgroups[i]] = 0;
            }
            _app.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
                    var cgroups = entity.getGroups();
                    for (i in cgroups) {
                        ctgroups[cgroups[i]] += 1;
                    }
                }
            });

            // now perform the move/copy
            _app.client.entitySet.each(function(entity) {
                var groups = entity.getGroups();
                var displayName = entity.getDisplayName();
                if (entity instanceof jabberwerx.RosterContact) {
                    var userJid = entity.jid.toString();
                    var newjid = fixString(userJid);
                    if ((userJid == jid)) {
                        // if oldGroup is not null, this is a move
                        // delete the contact from the old group
                        if (oldGroup != null) {
                            var oldgrouper = fixString(oldGroup);
                            log("JWA", "old group = ", oldGroup);
                            groups = remove(groups, oldGroup);
                            $("#ro" + newjid + oldgrouper).remove();

                            // remove emptified group, if it just got emptied
                            if (ctgroups[oldGroup] == 1) {
                                log("contactUpdateGroups", thisGroup + " is now empty");
                                $("#gr" + oldgrouper).remove();
                                $("#" + oldgrouper).remove();
                                $("#rosterlist").accordion("refresh");
                            }
                        }
                        var grouper = fixString(newGroup);
                        groups.push(newGroup);
                        var thisGroup = newGroup;
                        _app.rosterController.updateContact(jid, displayName, groups, _app.contactError);
                        $("#gr" + grouper).append('<div title="' + displayName + ' (' + userJid + ')" id="ro' + newjid + grouper + '" group="' + thisGroup + '" jid="' + userJid + '" ondblclick="_app._openChat(\'' + userJid + '\')" class="contact">' +
                            '<section class="section">' +
                            '<img class="pimage" title="' + displayName + ' (' + userJid + ')" id="im' + newjid + '" src="jQchat/img/Offline.png">' +
                            '<div id="dn' + newjid + '">' + displayName + '</div>' +
                            '</section><section><div class="status" id="st' + newjid + '"></div>' +
                            '<div>' +
                            '<span title="Invite To Multi-User Chat" onclick="_app._inviteToMUCChat(\'' + userJid + '\',\'' + displayName + '\')" class="options ui-icon ui-icon-contact"></span>' +
                            '<span title="Remove" onclick="_app._removeContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-close"></span>' +
                            '<span title="Copy to Group" onclick="_app._updateGroups(\'' + userJid + '\',null,\'Copy\')" class="options ui-icon ui-icon-copy"></span>' +
                            '<span title="Move to Group" onclick="_app._updateGroups(\'' + userJid + '\',\'' + thisGroup + '\',\'Move\')" class="options ui-icon ui-icon-arrowthick-1-e"></span>' +
                            '<span title="Edit Contact" onclick="_app._updateContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-pencil"></span>' +
                            '<span title="Chat" onclick="_app._openChat(\'' + userJid + '\')" class="options ui-icon ui-icon-comment"></span>' +
                            '</section></div>');
                        _app._loadGroup(newGroup);
                        _app._updateRosterPresence(userJid);
                        return;
                    }
                }
            });
        },

        // This updates the HTML in the DOM when a contact
        // is removed from a group
        _removeFromGroup: function(jid, thisGroup) {
            // do this in preparation for the possibility
            // that removing from this group will leave the group empty
            var groups = _app.client.entitySet.getAllGroups();
            var ctgroups = [];
            for (i in groups) {
                ctgroups.push(groups[i]);
            }
            for (i in groups) {
                ctgroups[ctgroups[i]] = 0;
            }
            _app.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
                    var cgroups = entity.getGroups();
                    for (i in cgroups) {
                        ctgroups[cgroups[i]] += 1;
                    }
                }
            });

            _app.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
                    var groups = entity.getGroups();
                    var nickname = entity.getDisplayName();
                    var userJid = entity.jid.toString();
                    var grouper = fixString(thisGroup);

                    if ((userJid == jid)) {
                        // remove this contact from the groups array
                        groups = remove(groups, thisGroup);
                        var newjid = fixString(jid);
                        if (groups.length == 0) {
                            log("deleting from only group", thisGroup + " " + jid);
                            _app.rosterController.deleteContact(jid, _app.contactError);
                        } else {
                            // if Contact still appears in some other group,
                            // don't delete, just update in CAXL
                            log("remove from this group", thisGroup + " " + jid);
                            _app.rosterController.updateContact(jid, nickname, groups, _app.contactError);
                        }

                        // remove contact from group roster
                        $("#ro" + newjid + grouper).remove();

                        // remove emptified group, if it just got emptied
                        if (ctgroups[thisGroup] == 1) {
                            log("removeFromGroup", thisGroup + " is now empty");
                            $("#gr" + grouper).remove();
                            $("#" + grouper).remove();
                            $("#rosterlist").accordion("refresh");
                        }
                        _app._loadGroups();
                        return;
                    }
                }
            });
        },

        // Logging for when errors occur
        contactError: function(errorStanza) {
            log("JWA", "error condition: " + errorStanza.condition);
            log("JWA", "error text: " + errorStanza.text);
            log("JWA", "error type: " + errorStanza.type);
        },

        // Open a chat session, and bind events for
        // updates to status (composing, etc.) and
        // message received
        _openChatSession: function(evt) {
            var chatSession = evt.data.chatSession;
            var jid = chatSession.jid;
            var entity = chatSession.getEntity();
            var displayName = entity.getDisplayName();
            var stringJID = jid.toString();
            var newjid = fixString(stringJID);
            chatSession.event("chatStateChanged").bind(this.invocation('_chatStateChanged'));
            chatSession.event("chatReceived").bind(this.invocation('_messageReceived'));
            log("JWA", "opening chat session with " + chatSession.jid + " " + displayName);
            openChat(displayName, stringJID);
            document.getElementById('newchat').play();
        },

        // Open a chat tab, if it doesn't already exist
        _openChat: function(jid) {
            var newjid = fixString(jid);
            // if a chat room is open, interpret this as inviting the contact
            try {
                // if tab already exists, don't create a new session
                if ($("#li" + newjid).hasClass("tabarea") != true) {
                    log("JWA", "opening chat session");
                    this.chatController.openSession(jid);
                }
            } catch (ex) {
                log("JWA", "error opening chat session " + ex);
            }
        },

        // Close a chat session
        _closeSession: function(jid) {
            log("JWA", "closing session for " + jid);
            var newjid = fixString(jid);
            var chatSession = this.chatController.getSession(jid);
            this.chatController.closeSession(chatSession);
            chatSession.destroy();
            log("JWA", "destroying chat for " + jid);
            document.getElementById('closechat').play();
        },

        // Send a chat message
        _sendMessage: function(userJid) {
            var newjid = fixString(userJid);
            var msg = $("#mt" + newjid).val();
            if (!msg) {
                log("JWA", "send has empty message");
                return;
            }
            newjid = fixString(userJid);
            try {
                var chatSession = this.chatController.getSession(userJid);
                var fullJid = chatSession.jid;
                log("JWA", "sending message to " + fullJid + ": " + msg);
                chatSession.sendMessage(msg);
            } catch (ex) {
                log("send", $("#to" + userJID.toString()).val() + " is not a valid JID or node");
            }

            var body = $("#mt" + newjid).val();
            var chat = "<div class='mytext'>" + body + "</div>";
            $("#ch" + newjid).append(chat);

			var newchat = sessionStorage.getItem(newjid);
			if (newchat == null) {
				newchat = chat;
			} else {
				newchat = newchat + chat;
			}
            sessionStorage.setItem(newjid, newchat);

            // Linkify, emotify, etc., chat, and scroll to bottom
			var thisid = document.getElementById("ch" + newjid);
			emojify.run(thisid);
            $("#ch" + newjid).linkify();
            $('.messagearea').animate({
                scrollTop: 10000
            });

            // Empty outgoing text input area, and give it focus
            $("#mt" + newjid).val("");
            $("#mt" + newjid).focus();
        },

        // Incoming chat message
        _messageReceived: function(evt) {
            log("messageReceived", "incoming message");
            var message = evt.data;
            var from = message.getFrom();
            var body = message.getBody();
            var type = message.getType();
            var node = message.getNode();
            var newjid = fixString(from);
            if (body) {
                var chat = "<div class='yourtext'>" + body + "</div>";
                $("#ch" + newjid).append(chat);
                log("JWA", "messasge from " + from + " msg: " + body);
				var newchat = sessionStorage.getItem(newjid);
				if (newchat == null) {
					newchat = chat;
				} else {
					newchat = newchat + chat;
				}
				sessionStorage.setItem(newjid, newchat);
				var thisid = document.getElementById("ch" + newjid);
				emojify.run(thisid);
                $("#ch" + newjid).linkify();
                $('.messagearea').animate({
                    scrollTop: 10000
                });
                document.getElementById('incoming').play();
				
				// pop up a notification for an incoming message
				if ( ! window_focus ) {
					if (("Notification" in window) && (Notification.permission === "granted")) {
						var notification = new Notification("jqchat: New message from " + from);
					} else if (Notification.permission !== 'denied') {
						Notification.requestPermission(function (permission) {
							// If the user is okay, let's create a notification
							if (permission === "granted") {
								var notification = new Notification("jqchat: New message from " + from);
							}
						});
					}
				}
            }
        },
		
        // Update the chat tab to reflect chat state such as "composing" or
        // "active", etc.
        _chatStateChanged: function(evt) {
            if (evt.data.jid == null) {
                return;
            }
            var jid = evt.data.jid;
            var newjid = fixString(jid);
            var stringJid = jid.toString();
            if (stringJid !== null) {
                var slash = stringJid.indexOf("/");
                if (slash !== -1) {
                    var cutstring = stringJid.substring(0, slash);
                } else {
                    var cutstring = stringJid;
                }
				log("JWA", "chat state changed: " + cutstring + " is " + evt.data.state);
				switch (evt.data.state) {
					case "composing":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="jQchat/img/Typing.png">' + cutstring + " is " + evt.data.state;
						break;
					case "paused":
					case "idle":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="jQchat/img/Idle.png">' + cutstring + " is " + evt.data.state;
						break;
					case "active":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="jQchat/img/Available.png">' + cutstring + " is " + evt.data.state;
						break;
					case "inactive":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="jQchat/img/csIdle.png">';
						break;
                }
                $("#cs" + newjid).html(msg);
            }
        },

        // Send my presence
        _sendPresence: function() {
			var show;
			show = $("#presence").val();
            var presence = new jabberwerx.Presence();
            var priority = 5;
            var status = $("#mystatus").val();
            switch (show || "available") {
                case "unavailable":
                    logoff = true;
                    presence.setShow("unavailable");
                    break;
                case "available":
					priority = 15;
                    break;
				case "away":
					priority = 15;
                    presence.setShow(show);
					break;
				case "dnd":
					priority = 15;
                    presence.setShow(show);
					break;
                default:
					break;
            }
            if (status) {
                presence.setStatus(status);
            } else {
                if (show == "available") {
                    $("#mystatus").attr('placeholder', 'Available');
                } else {
                    $("#mystatus").attr("placeholder", "");
                }
            }
			presence.setPriority(priority);

            _app.controller.client.sendStanza(presence);

            var src = getSrcImage(show);
            $("#mypimage").attr('src', src);
        },

		_setAvailable: function() {
			// this is for when we first log in, which means
			// we're available
/*
            $('#presence').val("available").iconselectmenu('refresh');
            $("#mystatus").attr('placeholder', 'Available');
*/
			var show = "";
			var type = "";
/*
            var src = getSrcImage("available");
            $("#mypimage").attr('src', src);
*/
            var presence = new jabberwerx.Presence();
			presence.setType(type);
			presence.setShow(show);
			presence.setPriority(15);
            _app.controller.client.sendStanza(presence);
		},

        // Update presence, including icon and status
        _updatePresence: function(evt) {
			var resource = "";
            var presence = evt.data;
            var presenceJid = presence.getFromJID().toString();
			log("JWA",presenceJid);
			var priority = presence.getPriority();
            var slash = presenceJid.indexOf("/");
            if (slash != -1) {
				resource = presenceJid.substring(slash + 1,presenceJid.length);
                presenceJid = presenceJid.substring(0, slash);
            }
            var status = presence.getStatus();
			var logstatus = status;
			if (logstatus == null) {
				logstatus = "(no status)";
			}
            var show = presence.getType() || presence.getShow() || "available";
			var type = presence.getType();
			var priority = presence.getPriority();
			// sometimes a priority will come in at -2 or -1, which is actually
			// 126 or 127 respectively, so convert it into the equivalent
			// positive number for log display since priority is actually
			// supposed to go from 0 to 127
			if (priority == -2) {
				priority = 126;
			}
			if (priority == -1) {
				priority = 127;
			}
			if (type == null) {
				type = "(no type)";
			}
            log("JWA", presenceJid + ": " + type + ", " + resource + ", " + show + ", " + logstatus + ", " + priority);
            var myJid = this.client.connectedUser.jid;
			// if this is presence for a contact, update the roster
			if (myJid != presenceJid) {
                this._updateRosterPresence(presenceJid);
			}

            // is this a change of presence for me from this client?
            if (myJid == presenceJid && resource != demoConfig.resource) {
				// ignore a logout from another client since we're still here
				if (show != "unavailable") {
					var src = getSrcImage(show);
					$("#mypimage").attr('src', src);
					if (status != null) {
						$("#mystatus").val(status);
					}
					switch (show || "available") {
						case "available":
							$('#presence').val("available").iconselectmenu('refresh');
							break;
						case "away":
						case "xa":
							$('#presence').val("away").iconselectmenu('refresh');
							break;
						case "dnd":
							$('#presence').val("dnd").iconselectmenu('refresh');
							break;
						default:
							break;
					}
				}
            }
			// this is a hack to make sure we start out as available
			// when logging in, otherwise the presence oscillates
            if (myJid == presenceJid && resource == demoConfig.resource) {
				var src = getSrcImage(show);
				$("#mypimage").attr('src', src);
				if (status != null) {
					$("#mystatus").val(status);
				}
				switch (show || "available") {
					case "available":
						$('#presence').val("available").iconselectmenu('refresh');
						break;
					case "away":
					case "xa":
//						$('#presence').val("away").iconselectmenu('refresh');
						break;
					case "dnd":
//						$('#presence').val("dnd").iconselectmenu('refresh');
						break;
					default:
						break;
				}
			}
        },

        _updateOccupantsList: function() {
            /**
             * room.occupants is a jabberwerx.EntitySet of
             * jabberwerx.MUCOccupant entities. The toArray method converts
             * an entity set to a simple array of entities.
             *
             * ../api/symbols/jabberwerx.MUCOccupant.html
             */
            if (_app.room == null || _app.room.occupants.toArray().length == 0) {
                $("#occupantlist").html("");
                $("#occupantlist").append('<li class="occupant">Nobody</li>');
            } else {
                $("#occupantlist").html("");
                var occupants = _app.room.occupants.toArray();
                for (var i in occupants) {
                    var occ = occupants[i].getNickname();
                    var endch = occ.search("@");
                    if (endch > 0)
                        var occupant = occ.substr(0, endch);
                    else
                        var occupant = occ;
                    $("#occupantlist").append('<li class="occupant">' + occupant + '</li>');
                }
            }
        },

		// create chat room
        _createChatRoom: function() {
            $('<div id="createchatroom">' +
                'Room Name (no spaces):<br>' +
                '<input type="text" class="jqinput" name="roomname" id="roomname" placeholder="ChattyRoom"></input><br><br>' +
                'Subject:<br>' +
                '<input type="text" class="jqinput" name="subject" id="subject" placeholder="New Subject"></input><br><br>' +
                'Your Nickname:<br>' +
                '<input type="text" class="jqinput" name="nickname" id="nickname" placeholder="Nickname"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 300,
                minWidth: 300,
                minHeight: 300,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Change the Subject",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#createchatroom").dialog("destroy").remove();
                },
                buttons: {
                    "Create": {
                        id: "create",
                        text: "Create Room",
                        click: function() {
							var roomname = $("#roomname").val();
                            if (roomname == "") {
                                roomname = "ChattyRoom";
                            }
                            var subject = $("#subject").val();
                            if (subject == "") {
                                subject = "To Change";
                            }
                            var nickname = $("#nickname").val();
                            if (nickname == "") {
                                nickname = "Nickname";
                            }
							_app._activateRoom(roomname, subject, nickname);
							$("#createchatroom").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#createchatroom").dialog("close");
                        }
                    }
                }
            });
        },

        // invite a contact to an open conference room
        _inviteToMUCChat: function(userJid, displayName) {
            if (_app.room == null || !_app.room.isActive()) {
                myalert("Please enter a chat room before attempting to invite a contact");
                return;
            }
            $('<div id="invitetomuc">' +
                'Contact Name:<br><div id="dname">' + displayName + '</div><br>' +
                'Contact JID:<br><div id="jname">' + userJid + '</div><br>' +
                'Reason:<br>' +
                '<input type="text" class="jqinput" name="reason" id="reason" placeholder="Because"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 280,
                minWidth: 300,
                minHeight: 280,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Invite to Chat Room",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#invitetomuc").dialog("destroy").remove();
                },
                buttons: {
                    "Invite": {
                        id: "invite",
                        text: "Invite",
                        click: function() {
                            var reason = $("#reason").val();
                            if (reason == "") {
                                reason = "Because";
                            }
                            //room.isActive returns true if we have fully entered the room.
                            try {
                                _app.room.invite(userJid, reason, true);
                            } catch (ex) {
                                myalert("Error occurred while inviting a user: " + ex.message);
                            }
                            $("#invitetomuc").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#invitetomuc").dialog("close");
                        }
                    }
                }
            });
        },

        // invite a contact to an open conference room
        _changeSubject: function() {
            if (_app.room == null || !_app.room.isActive()) {
                myalert("Please enter a chat room before attempting to change the subject");
                return;
            }

            $('<div id="changesubject">' +
                'Current Subject:<br><div id="dname">' + _app.room.properties.subject + '</div><br>' +
                'New Subject:<br>' +
                '<input type="text" class="jqinput" name="subject" id="subject" placeholder="New Subject"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 280,
                minWidth: 300,
                minHeight: 280,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Change the Subject",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#changesubject").dialog("destroy").remove();
                },
                buttons: {
                    "Change": {
                        id: "change",
                        text: "Change Subject",
                        click: function() {
                            var subject = $("#subject").val();
                            log("JWA", "changing subject to " + subject);
                            if (subject == "") {
                                $("#changesubject").dialog("close");
                            }
                            //room.isActive returns true if we have fully entered the room.
                            try {
                                _app.room.changeSubject(subject);
                            } catch (ex) {
                                myalert("Error occurred while inviting a user: " + ex.message);
                            }
                            $("#mucsubject").text("Subject: " + subject);
                            $("#changesubject").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#changesubject").dialog("close");
                        }
                    }
                }
            });
        },

        // invite a contact to an open conference room
        _changeNickname: function() {
            if (_app.room == null || !_app.room.isActive()) {
                myalert("Please enter a chat room before attempting to change a nickname");
                return;
            }
            $('<div id="changenick">' +
                'New Nickname:<br>' +
                '<input type="text" class="jqinput" name="nickname" id="nickname" placeholder="New Nickname"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 280,
                minWidth: 300,
                minHeight: 280,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "left top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                title: "Change Nickname",
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    $("#changenick").dialog("destroy").remove();
                },
                buttons: {
                    "Change": {
                        id: "change",
                        text: "Change Nickname",
                        click: function() {
                            var nickname = $("#nickname").val();
                            if (nickname == "") {
                                $("#changenick").dialog("close");
                            }
                            //room.isActive returns true if we have fully entered the room.
                            try {
                                _app.room.changeNickname(nickname);
                            } catch (ex) {
                                myalert("Error occurred while inviting a user: " + ex.message);
                            }
                            $("#changenick").dialog("close");
                        }
                    },
                    "Cancel": {
                        id: "cancel",
                        text: "Cancel",
                        click: function() {
                            $("#changenick").dialog("close");
                        }
                    }
                }
            });
        },

        _activateRoom: function(roomname, subject, nickname) {
            // get a room JID from the entity set
            // you can find it one of two ways
            // either the displayName contains conference
            // or it is 'Text Conferencing'
            var roomService = "";
            this.client.entitySet.each(function(entity) {
                // Display domain of each text conferencing servers
                var displayName = entity.getDisplayName();
                if ((displayName.indexOf("conference") > -1) || (displayName == 'Text Conferencing')) {
                    roomService = entity.jid.toString();
                    log("JWA", "room service is " + displayName + ": " + roomService);
                }
            });

            // instantiate our multi-user chat room
            if (_app.room == null || (!_app.room.isActive())) {

				// create the chat room
				log("JWA", "attempting to create chat room: " + roomname + "@" + roomService);
                _app.room = _app.mucController.room(roomname + "@" + roomService);

				if (_app.room != null) {
					var success = _app._enterRoom(nickname);
					if (! success) {
						log("JWA","couldn't enter room");
					}
					_app._updateOccupantsList();

					// set the subject
//					_app.room.changeSubject(subject);

					// open chat room window
					_app._MUChatRoom(roomname, subject);

					// empty out last room's messages
					$("#muchtext").html("");

					// Respond to an event that is triggered when an occupant is added to the room
					_app.room.occupants.event("entityCreated").bind(function(evt) {
						log("JWA", "got entityCreated event" + evt.data);
						_app._updateOccupantsList();
					});

					// Respond to an event that is triggered when an occupant is updated in the room
					_app.room.occupants.event("entityUpdated").bind(function(evt) {
						log("JWA", "got entityUpdated event" + evt.data);
						_app._updateOccupantsList();
					});

					// Respond to an event that is triggered when an occupant is removed from the room
					_app.room.occupants.event("entityDestroyed").bind(function(evt) {
						log("JWA", "got entityDestroyed event" + evt.data);
						_app._updateOccupantsList();
					});

					// Respond to an event that is triggered when an occupant in the room is renamed
					_app.room.occupants.event("entityRenamed").bind(function(evt) {
						log("JWA", "got entityRenamed event" + evt.data);
						_app._updateOccupantsList();
					});

					/**
					 * Event fired when the room has been entered completely. This
					 * event handler maps other event handlers that are valid only
					 * when a room has been entered.
					 */
					_app.room.event("roomEntered").bind(function(evt) {
						/**
						 * event fired when we have fully exited a room.
						 * Destroy the room and clear our local reference.
						 *
						 * see ../api/symbols/jabberwerx.MUCRoom.html#destroy
						 */
						_app.room.event("roomExited").bind(function(evt) {
							$("#muchatroom").dialog("close");
						});
						/**
						 * event fired when the room receives a message. evt.data
						 * is the jabberwerx.Message received.
						 *
						 * ../api/symbols/jabberwerx.Message.html#getBody
						 */
						_app.room.event("roomBroadcastReceived").bind(function(evt) {
							var msgFrom = evt.data.getFrom();
							log("JWA", "broadcast message from " + msgFrom);
							var index = msgFrom.indexOf('/') + 1;
							msgFrom = msgFrom.substr(index, msgFrom.length);
							var msgBody = evt.data.getBody();
							$("#muchtext").append("<div class='muchatname'>" + msgFrom + "</div>");
							$("#muchtext").append("<div class='muchattext'>" + msgBody + "</div>");
							$('.muchtext').animate({
								scrollTop: 10000
							});
						});

						_app.room.event("mucInviteReceived").bind(function(evt) {
							var invite = evt.data;
							var invitor = invite.getInvitor();
							log("JWA", "got invitation from " + invitor);
						});

						/**
						 * event fired when the room receives a new subject.
						 * evt.data is the jabberwerx.Message whose subject is the
						 * new room subject.
						 *
						 * In our case, the subject is part of the dialog title
						 * and we don't use this event, but you can modify this
						 * for your purposes
						 *
						 * see ../api/symbols/jabberwerx.Message.html#getSubject
						 */
						_app.room.event("roomSubjectChanged").bind(function(evt) {
							log("JWA", "muc chatroom subject changed to " + evt.data.getSubject());
							$("#mucsubject").html("Subject: " + evt.data.getSubject());
						});
						/**
						 * The room's subject is one of its properties and is
						 * available via room.properties.subject.
						 *
						 * This is unused in this demo, so the line is commented out
						 */
						//          $('#subjectLabel').html(room.properties.subject);
					});
                } else {
					log("JWA","failed to create room");
				}
            }
        },

        _enterRoom: function(nickname) {
            /**
             * jabberwerx.MUCRoom.enter takes the nickname we want to
             * enter the room with and an addition argument object that
             * may define callbacks fired when the asynchronous function
             * completes. Since we have an event handler bound to the
             * roomEntered event all we need is an error callback in case
             * the server did not allow the room's creation.
             *
             * enter may also throw exaceptions for invalid arguments or
             * bad state so it should be wrapped in a try-catch.
             *
             * see ../api/symbols/jabberwerx.MUCRoom.html#enter
             */

            var enterRoomArgs = {
                successCallback: _app._onRoomEnterSuccess,
                errorCallback: _app._onRoomEnterError
            };
            try {
                log("JWA", "entering room");
                _app.room.enter(nickname, enterRoomArgs);
				return(true);
            } catch (ex) {
                log("JWA", "Error attempting to enter room: " + ex.message);
				_app.room.destroy();
				_app.room = null;
				return(false);
            }
        },

        _onRoomEnterSuccess: function() {
            log("JWA", "successfully entered room");
        },

        _onRoomEnterError: function(err, aborted) {
            $("#muchatroom").dialog("close");
            log("JWA", 'Error entering room: ' + err.message);
            _app.room.exit();
            _app.room.destroy();
            _app.room = null;
        },

        _broadcastMessage: function() {
            //room.isActive returns true if we have fully entered the room.
            if (_app.room == null || !_app.room.isActive()) {
                myalert("Please enter a chat room before attempting to broadcast");
                return;
            }
            var body = $("#broadcasttext").val();
            if (!body) {
                log("JWA", "send has empty message");
                return;
            }
            try {
                _app.room.sendBroadcast($("#broadcasttext").val());
            } catch (ex) {
                myalert(ex.message);
            }
            $("#broadcasttext").val("");
            $("#broadcasttext").focus();
            //       $("#muchtext").append(chat);
        },

        // This still doesn't work yet, not sure why not
        _onClientReconnect: function(evt) {
            log("JWA", "reconnect event fired");
            this._unloadRoster();
            this._destroyRoster();
        },

        // Entity Created, just log the event for now
        _onEntityCreated: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            if (entity instanceof jabberwerx.RosterContact) {
                log("JWA", "contact entity created " + jid);
            } else {
                log("JWA", "other entity created " + jid);
            }
        },

        // Entity Added, just log the event for now
        _onEntityAdded: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            var displayName = entity.getDisplayName();
            if (entity instanceof jabberwerx.RosterContact) {
                log("JWA", "contact entity added " + displayName + ": " + jid);
                _app._loadGroups();
            } else {
                log("JWA", "other entity added " + displayName + ": " + jid);
            }
        },

        // Entity Updated, just log the event for now
        _onEntityUpdated: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            var displayName = entity.getDisplayName();
            if (entity instanceof jabberwerx.RosterContact) {
                log("JWA", "contact entity updated " + displayName + ": " + jid);
                _app._loadGroups();
            } else {
                log("JWA", "other entity updated " + displayName + ": " + jid);
            }
        },

        // Entity Removed, just log the event for now
        _onEntityRemoved: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            if (entity instanceof jabberwerx.RosterContact) {
                log("JWA", "contact entity removed " + jid);
                _app._loadGroups();
            } else {
                log("JWA", "other entity removed " + jid);
            }
        },

        // Set our current state
        _setState: function(state) {
            var $ = jabberwerx.$;

            switch (state) {
                case -1:
                    log("JWA", "invalid until loaded");
                    return;
                case jabberwerx.Client.status_connected:
                    log("JWA", "status connected");
                    break;
                case jabberwerx.Client.status_disconnected:
                    log("JWA", "status disconnected");
                    break;
            }
            $(".toolbar #client-status").text(this.client.getClientStatusString(state));
        },

        // Update our current state
        _updateState: function() {
            this._setState(this.client.clientStatus);
        },

        // When connected, create roster, load roster, and send presence
        _onClientConnected: function(evt) {
            log("JWA", "got connected event");
            if ($("#logindialog").hasClass('ui-dialog-content')) {
                $("#logindialog").dialog("close");
            }
            this._createRoster();
            this._loadRoster();
			this._setAvailable();
            this._setState(evt.data.next);
        },

        // When disconnected, destroy roster and show login dialog
        _onClientDisconnected: function(evt) {
            log("JWA", "got disconnected event");
            this._unloadRoster();
            this._destroyRoster();
            openLogin();
            this._setState(evt.data.next);
        },

        // Still working on how to use this best
        // "reconnect" doesn't work properly, and this is involved
        _onClientStatusChanged: function(evt) {
            // get the associated jabberwerx.Client object
            var client = evt.source;
            var data = evt.data;
            // get the previous and next status values
            var prev = client.getClientStatusString(evt.data.previous);
            var next = client.getClientStatusString(evt.data.next);
            log("JWA", 'client changing state: ' + prev + ' --> ' + next);

            switch (evt.data.next) {
                case jabberwerx.Client.status_connected:
                    this.prsView._sendPresence(data.show, data.status, data.priority);
                    log("JWA", "status connected callback");
                case jabberwerx.Client.status_disconnected:
                    log("JWA", "status change, disconnected");
                    this._unloadRoster();
                    this._destroyRoster();
                    openLogin();
                    evt.notifier.unbind(arguments.callee);
            }
            if (evt.data.error) {
                log("JWA", "client error: " + evt.data.error.xml);
            }
            this._setState(evt.data.next);
        }

    }, "JWA.Application");

    jabberwerx.$.jStore.ready(function(engine) {
        engine.ready(function() {
            console.log('storage engine ready');
            openLog();
            console.log('onReady end');
            _load();
        });
    });
});
