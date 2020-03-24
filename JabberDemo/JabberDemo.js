/*
BSD 3-Clause License

Copyright (c) 2020, Cisco Systems, Inc. and/or its affiliates

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint browser: true*/
/*global $, jQuery, alert*/
/*jslint nomen: true */

var DemoApp = null;
var JWA = {};

$(document).ready( function () {

    // save the application to survive browser refresh
    _save = function () {
        log("window", "saving begin");

        try {
            jabberwerx.util.saveGraph(DemoApp, demoConfig.appTag);
        } catch (e) {
            log("window", "saving failed: " + e.message);
        }

        DemoApp._setState(-1);
        DemoApp = null; //saved refs are no longer valid and should be invaldated
        log("window", "saving end");
    };

    // load saved application, create new one if it doesn't exist
    _load = function () {
        log("window", "loading begin");

        DemoApp = jabberwerx.util.loadGraph(demoConfig.appTag);
        if (!DemoApp) {
            log("window", "creating new application");
            DemoApp = new JWA.Application();
            DemoApp._login();
        } else {
            log("window", "application already created");
            DemoApp._login();
        }
        DemoApp._updateState();
        log("window", "loading end");
    };

    // Save app during browser refresh
    jabberwerx.$(window).bind("unload", function () {
        log("window", "onUnload begin");
        _save();
        log("DemoApp", "onUnload end");
    });

    // Here's where the application starts
    JWA.Application = jabberwerx.JWModel.extend({

        // Initialize the client and most bindings
        init: function() {
            log("DemoApp", "Application.init begin");

			this._super();

			var resource = demoConfig.resource + Math.floor((Math.random() * 1000000) + 1);
			log("DemoApp","Resource = " + resource)

            this.client = new jabberwerx.Client(resource);

            // bind necessary event handlers
            this.client.event("clientConnected").bind(this.invocation('_onClientConnected'));
            this.client.event("clientStatusChanged").bind(this.invocation('_onClientStatusChanged'));
            this.client.event("presenceReceived").bind(this.invocation('_updatePresence'));
            this.client.event("reconnectCountdownStarted").bind(this.invocation('_onClientReconnect'));
			this.roster = this.client.controllers.roster || new jabberwerx.RosterController(this.client);
            this.controller = new jabberwerx.Controller(this.client, demoConfig.resource);
            this.rosterController = new jabberwerx.RosterController(this.client);
			this.discoController = new jabberwerx.DiscoController(this.client);

			this.discoController.event("discoInitialized").bind(this.invocation('_discoInitialized'));

			this.chatController = new jabberwerx.ChatController(this.client);
			this.chatController.event("chatSessionOpened").bind(this.invocation('_openChatSession'));

			// entity events
			this.client.entitySet.event("entityUpdated").bind(this.invocation('_onEntityUpdated'));
			this.client.entitySet.event("entityAdded").bind(this.invocation('_onEntityAdded'));
			this.client.entitySet.event("entityRemoved").bind(this.invocation('_onEntityRemoved'));

			// multi-user chat controller for multi-user chat rooms
			this.mucController = new jabberwerx.MUCController(this.client);
			this.mucController.event("mucInviteReceived").bind(this.invocation('_onInviteReceived'));

			this.room = [];
			this.roomnames = [];
			this.roomJids = [];
			this.subjects = [];
			this.roomService = null;

			this.LDAPController = null;

            log("DemoApp", "Application.init end");
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

		_discoInitialized: function() {
			log("DemoApp","Disco is initialized");
/*
			var ldapEntity;
			DemoApp.client.entitySet.each(function(entity) {
				var displayName = entity.getDisplayName();
				if ((displayName.indexOf("ldap") > -1) || (displayName == 'ldapsearch.cisco.com')) {
					log("DemoApp","Found LDAP Entity: " + displayName);
					ldapEntity = entity;
				}
			});
*/

//			this.LDAPController.subscribeGroup('ds-ucm115-1.cisco.com');
//			this.LDAPController.activateSubscriptions();
		},

		_getLDAP: function(userJid) {
			log("DemoApp","Attempting to find LDAP user " + userJid);
			if (this.LDAPController.isLDAPContact(userJid)) {
				log("DemoApp", userJid + "is an LDAP user");
			} else {
				log("DemoApp", userJid + "is NOT an LDAP user");
			}
			var searchFields = {
				'firstname' : "david"
			};
			var returnval = this.LDAPController.searchUsersByFields(searchFields);
			log("DemoApp","Search return value: " + returnval);

		},

        // If connected, show roster, bind events, otherwise show the login dialog
        // This is mostly a browser refresh function
        _login: function() {
            log("DemoApp", "logging in");
            if (this.client.isConnected()) {
                log("DemoApp", "client is already connected");
                _createRoster();
                _loadRoster();
				_setAvailable();

            } else {
                log("DemoApp", "not connected");
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

            } catch (ex) {
                jabberwerx.util.debug.warn(ex.message);
                console.log("JWA: could not connect: " + ex.message);
            }

        },

        // Disconnect, like it says
        _disconnect: function() {
            if (!this.client.isConnected()) {
                log("DemoApp", "client is already disconnected");
            } else {
                this.client.disconnect();
            }
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
            log("DemoApp", "opening chat session with " + chatSession.jid + " " + displayName);
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
                    log("DemoApp", "opening chat session");
                    this.chatController.openSession(jid);
                }
            } catch (ex) {
                log("DemoApp", "error opening chat session " + ex);
            }
        },

        // Close a chat session
        _closeSession: function(jid) {
            log("DemoApp", "closing session for " + jid);
            var newjid = fixString(jid);
            var chatSession = this.chatController.getSession(jid);
            this.chatController.closeSession(chatSession);
            chatSession.destroy();
            log("DemoApp", "destroying chat for " + jid);
            document.getElementById('closechat').play();
        },

        // Send a chat message
        _sendMessage: function(userJid) {
            var newjid = fixString(userJid);
            var msg = $("#mt" + newjid).val();
            if (!msg) {
                log("DemoApp", "send has empty message");
                return;
            }
            newjid = fixString(userJid);
            try {
                var chatSession = this.chatController.getSession(userJid);
                var fullJid = chatSession.jid;
                log("DemoApp", "sending message to " + fullJid + ": " + msg);
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
                log("DemoApp", "message from " + from + " msg: " + body);
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
						var notification = new Notification("JabberDemo: New message from " + from);
					} else if (Notification.permission !== 'denied') {
						Notification.requestPermission(function (permission) {
							// If the user is okay, let's create a notification
							if (permission === "granted") {
								var notification = new Notification("JabberDemo: New message from " + from);
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
				log("DemoApp", "chat state changed: " + cutstring + " is " + evt.data.state);
				switch (evt.data.state) {
					case "composing":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="JabberDemo/img/Typing.png">' + cutstring + " is " + evt.data.state;
						break;
					case "paused":
					case "idle":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="JabberDemo/img/Idle.png">' + cutstring + " is " + evt.data.state;
						break;
					case "active":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="JabberDemo/img/Available.png">' + cutstring + " is " + evt.data.state;
						break;
					case "inactive":
						var msg = '<img id="csi"' + newjid + '" class="csimage" src="JabberDemo/img/csIdle.png">';
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
					priority = 30;
                    break;
				case "away":
					priority = 25;
                    presence.setShow(show);
					break;
				case "dnd":
					priority = 10;
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

            this.controller.client.sendStanza(presence);

            var src = getSrcImage(show);
            $("#mypimage").attr('src', src);
        },

        // Update presence, including icon and status
        _updatePresence: function(evt) {

            var presence = evt.data;
			var jid;
			var resource;
			var show = presence.getShow() || "available";
			var pstatus = presence.getStatus();
			log("updatePresence status incoming", pstatus);
			var priority = presence.getPriority();

            var fulljid = presence.getFromJID().toString();
//			log("updatePresence for ", fulljid +  " " + show + " " + pstatus + " " + priority);

            var slash = fulljid.indexOf("/");
            if (slash != -1) {
				resource = fulljid.substring(slash + 1,fulljid.length);
                jid = fulljid.substring(0, slash);
            }

            var myJid = this.client.connectedUser.jid;

			// If this isn't a presence update for my JID from another client,
			// process it as a presence update for a contact in the roster
			if ((myJid == jid)  && (resource != demoConfig.resource) && (resource != "composed")) {

				if (show != "unavailable") {
					var src = getSrcImage(show);
					$("#mypimage").attr('src', src);
					if (pstatus !== null) {
						$("#mystatus").val(pstatus);
					}
					switch (show || "available") {
						case "available":
							$('#presence').val("available");
							$("#presence").selectmenu("refresh", true);
							break;
						case "away":
						case "xa":
							$('#presence').val("away");
							$("#presence").selectmenu("refresh", true);
							break;
						case "dnd":
							$('#presence').val("dnd");
							$("#presence").selectmenu("refresh", true);
							break;
						default:
							break;
					}
				}

				log("updatePresence end", jid + " " + show + " " + pstatus + " " + priority);

			} else {

				if (resource != "composed") {
					var newjid = fixString(jid);

					var groups = this.client.entitySet.getAllGroups();
					groups.push("Rooms");
					var src = getSrcImage(show);

					// alphebetize the group names
					for (var i in groups) {
						var thisGroup = groups[i];
//						log("DemoApp","Presence found for group " + thisGroup);
						var grouper = fixString(thisGroup);
						if (show == "available") {
							$("#gr" + grouper).find("#im" + newjid).attr('src',"JabberDemo/img/Available.png");
							$("#gr" + grouper).find("#im" + newjid).attr('alt', 'Available');
						}
						$("#gr" + grouper).find("#im" + newjid).attr('src',src);
						if (pstatus !== null) {
							$("#gr" + grouper).find("#st" + newjid).hide().html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + pstatus).fadeIn("fast");
						} else {
							$("#gr" + grouper).find("#st" + newjid).hide().html("").fadeIn("fast");
						}

						if (pstatus == "Logged out" || priority == -1) {
							$("#gr" + grouper).find("#im" + newjid).attr('src',"JabberDemo/img/Offline.png");
						}

					}
				}
				log("updatePresence end", jid + " " + show + " " + pstatus + " " + priority);
			}

        },

        // This still doesn't work yet, not sure why not
        _onClientReconnect: function(evt) {
            log("DemoApp", "reconnect event fired");
            _unloadRoster();
            _destroyRoster();
        },

        // Entity Created, just log the event for now
        _onEntityCreated: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            if (entity instanceof jabberwerx.RosterContact) {
                log("DemoApp", "contact entity created " + jid);
//                _loadGroups();
				_loadRoster();
            } else {
                log("DemoApp", "other entity created " + jid);
            }
        },

        // Entity Added, just log the event for now
        _onEntityAdded: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            var displayName = entity.getDisplayName();
            if (entity instanceof jabberwerx.RosterContact) {
                log("DemoApp", "contact entity added " + displayName + ": " + jid);
//                _loadGroups();
				_loadRoster();
            } else {
                log("DemoApp", "other entity added " + displayName + ": " + jid);
            }
        },

        // Entity Updated, just log the event for now
        _onEntityUpdated: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            var displayName = entity.getDisplayName();
            if (entity instanceof jabberwerx.RosterContact) {
                log("DemoApp", "contact entity updated " + displayName + ": " + jid);
//                _loadGroups();
				_loadRoster();
            } else {
                log("DemoApp", "other entity updated " + displayName + ": " + jid);
            }
        },

        // Entity Removed, just log the event for now
        _onEntityRemoved: function(evt) {
            var jid = evt.data.jid;
            var entity = evt.data;
            if (entity instanceof jabberwerx.RosterContact) {
                log("DemoApp", "contact entity removed " + jid);
//                _loadGroups();
				_loadRoster();
            } else {
                log("DemoApp", "other entity removed " + jid);
            }
        },

        // Set our current state
        _setState: function(state) {
            var $ = jabberwerx.$;

            switch (state) {
                case -1:
                    log("DemoApp", "invalid until loaded");
                    return;
                case jabberwerx.Client.status_connected:
                    log("DemoApp", "status connected");
                    break;
                case jabberwerx.Client.status_disconnected:
                    log("DemoApp", "status disconnected");
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

            log("DemoApp", "got connected event");

			// chat controller
			this.chatController = new jabberwerx.ChatController(this.client);

			// trigger _openChatSession when someone starts a chat, which can occur either when
			// the user initiates a chat, or a contact initiates a chat
			this.chatController.event("chatSessionOpened").bind(this.invocation('_openChatSession'));

			this.LDAPController = new jabberwerx.cisco.DirectoryGroupsController(this.client);

			// entity events
			this.client.entitySet.event("entityUpdated").bind(this.invocation('_onEntityUpdated'));
			this.client.entitySet.event("entityAdded").bind(this.invocation('_onEntityAdded'));
			this.client.entitySet.event("entityRemoved").bind(this.invocation('_onEntityRemoved'));

            _createRoster();
            _loadRoster();
			_setAvailable();
            _setState(evt.data.next);

/*
			this.LDAPController = new jabberwerx.cisco.DirectoryGroupsController(this.client);
			var ldapContacts = [];
			ldapContacts = this.LDAPController._ldapContacts;
            for(var i in ldapContacts) {
				log("DemoApp","Contact: " + ldapContacts[i]);
            }
			log("DemoApp","Done listing contacts");
*/
        },

        // When disconnected, destroy roster and show login dialog
        _onClientDisconnected: function(evt) {
            log("DemoApp", "got disconnected event");
            _unloadRoster();
            _destroyRoster();
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
            log("DemoApp", 'client changing state: ' + prev + ' --> ' + next);

            switch (evt.data.next) {
                case jabberwerx.Client.status_connected:
                    this.prsView._sendPresence(data.show, data.status, data.priority);
                    log("DemoApp", "status connected callback");
                case jabberwerx.Client.status_disconnected:
                    log("DemoApp", "status change, disconnected");
                    _unloadRoster();
                    _destroyRoster();
                    openLogin();
                    evt.notifier.unbind(arguments.callee);
            }
            if (evt.data.error) {
                log("DemoApp", "client error: " + jabberwerx.Client.ConnectionError(evt.data.error.next));
            }
            this._setState(evt.data.next);
        },

		_onInviteReceived: function(evt) {
			var invite = evt.data;
			var reason = invite.getReason();
			var invitor = invite.getInvitor();
			var roomname = invite.getRoom();
			log("DemoApp","Invited to " + roomname);
			this.room[roomname] = this.mucController.room(roomname);
			var displayName = this.room.getDisplayName();
			log("DemoApp", "got invitation for " + displayName + " from " + invitor + " " + reason);
//			_joinMUCRoom(this.room,"Rogue");
			_reactToInvitation(this.room[roomname], invitor, reason);
		},

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
