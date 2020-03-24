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

var room = null;

$(document).ready( function () {


        // multi-user chat room
        _MUChatRoom = function(roomname, subject, nickname, newjid) {

            $('<div id="' + newjid + '">' +
                '<div class="muchatarea">' +
                '<div class="muchtext" id="mut' + newjid + '">' +
                '&nbsp;</div>' +
                '<div class="occupants" id="occ' + newjid + '">' +
                '<ul id="occl' + newjid + '" class="occupantlist">' +
                '</ul>' +
                '</div>' +
                '</div>' +
                '<div class="broadcastarea" id="bra' + newjid +'">' +
                '<div class="mucsubject" id="mucs' + newjid + '"></div>' +
                '<textarea class="broadcasttext" id="brt' + newjid +'"></textarea>' +
                '<input class="sendbutton" type="button" value="Send" onclick="_broadcastMessage(\'' + roomname + '\')" id="bru' + newjid + '"/>' +
                '</div>' +
                '</div>').dialog({
                autoOpen: true,
                width: 720,
                height: 600,
                minWidth: 600,
                minHeight: 600,
                resizable: true,
                position: {
                    my: "right-10 top+10",
                    at: "right top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: true,
				open: function(event, ui) {
					$(".ui-dialog-titlebar-close").hide();
				},
                title: roomname,
                show: {
                    effect: "fold",
                    duration: 100
                },
                close: function(event, ui) {
                    log("DemoApp", "exiting room");
					DemoApp.room[roomname].exit();
                    DemoApp.room[roomname].destroy();
                    DemoApp.room[roomname] = null;
/*
					var grouper = fixString("Rooms");
					$("#gr" + grouper).find("#im" + newjid).attr('src', "JabberDemo/img/Offline.png");
					$("#gr" + grouper).find("#im" + newjid).attr('alt', 'Offline');
*/
                    $("#" + newjid).dialog("destroy").remove();
                },
                buttons: {
					"Invite": {
						id: "invite",
						text: "Invite Someone",
						click: function() {
							_inviteSomeone(roomname);
						}
					},
                    "Changes": {
                        id: "changes",
                        text: "Change Subject",
                        click: function() {
                            _changeSubject(roomname);
                        }
                    },
                    "Changen": {
                        id: "changen",
                        text: "Change Nickname",
                        click: function() {
                            _changeNickname(roomname);
                        }
                    },
                    "Leave": {
                        id: "leave",
                        text: "Leave Chat Room",
                        click: function() {
                            $("#" + newjid).dialog("close");
                        }
                    }
                }
            });
            $("#bru" + newjid).button();
            $("#sub" + newjid).button();
            $("#nick" + newjid).button();
            $("#mucs" + newjid).text("Subject: " + subject);

            $("#brt" + newjid).keyup(function(e) {
                if (e.keyCode === $.ui.keyCode.ENTER) {
                    e.stopPropagation();
                    $("#bru" + newjid).trigger("click");
                    return false;
                }
            });
            $('.mut' + newjid).animate({
                scrollTop: 10000
            });
        };

		// create chat room
        _createChatRoom = function() {
			var myJid = DemoApp.client.connectedUser.jid;
			var jidentity = DemoApp.client.entitySet.entity(myJid);
			var nickname = jidentity.getDisplayName();

            $('<div id="createchatroom">' +
                'Room Name (no spaces):<br>' +
                '<input type="text" class="jqinput" name="roomname" id="roomname" placeholder="ChattyRoom"></input><br><br>' +
                'Subject:<br>' +
                '<input type="text" class="jqinput" name="subject" id="subject" placeholder="New Subject"></input><br><br>' +
                'Your Nickname:<br>' +
                '<input type="text" class="jqinput" name="nickname" id="nickname" placeholder="' + nickname + '"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 300,
                minWidth: 300,
                minHeight: 300,
                resizable: true,
                position: {
                    my: "right-20 top+20",
                    at: "right top",
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
                                nickname = jidentity.getDisplayName();
                            }
							_openRoom(roomname, subject, nickname);
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
        };

		_getChatRooms = function() {
			// Function to handle response when it's received

			log("DemoApp","Getting Chat Rooms");

			log("DemoApp","Roomnames length = " + DemoApp.roomnames.length);
			var grouper = fixString("Rooms");

			if (DemoApp.roomnames.length > 0) {
				for (var i = 0; i < DemoApp.roomnames.length; i++ ) {
					roomname = DemoApp.roomnames[i];
					log("DemoApp","Adding room name " + roomname);
					log("DemoApp","Adding room Jid " + DemoApp.roomJids[i]);
					roomcontact = buildRoom(DemoApp.roomJids[i],roomname);
					$("#gr" + grouper).append(roomcontact);
				}
				return;
			}

            DemoApp.client.entitySet.each(function(entity) {
                // Display domain of each text conferencing servers
                var displayName = entity.getDisplayName();
                if ((displayName.indexOf("conference") > -1) || (displayName == 'Text Conferencing')) {
                    DemoApp.roomService = entity.jid;
                    log("DemoApp", "room service is " + DemoApp.roomService);
                }
            });

			var getAllRooms = function(responseXml) {
				var roomJid;
				var roomname;
				var grouper = fixString("Rooms");

				var iq = jabberwerx.Stanza.createWithNode(responseXml);
				if (iq.isError()) {
					console.log("IQ Error");
					var iqError = iq.getErrorInfo();
					log("IQ Error",iqError.type + " " + iqError.text);
					log("DemoApp","Error getting rooms.");
				} else {
					var contents = jabberwerx.$(iq.getQuery()).contents();
					for (var i = 0; i < contents.length; i++) {
						var content = contents[i];
						switch (content.nodeName) {
							case ("item"):
								roomJid = jabberwerx.$(content).attr("jid");
								roomname = jabberwerx.$(content).attr("name");
								if ((roomJid.indexOf(DemoApp.roomService) > -1)) {
									DemoApp.roomnames[i] = roomname;
									DemoApp.roomJids[i] = roomJid;
									DemoApp.room[roomname] = DemoApp.mucController.room(roomname + "@" + DemoApp.roomService);
									log("DemoApp", "Chat Room Jid: " + DemoApp.roomJids[i]);
									roomcontact = buildRoom(DemoApp.roomJids[i],roomname);
									$("#gr" + grouper).append(roomcontact);
								}
								break;
						}
					}
				}
			};

			var xmlContent = "<query xmlns='http://jabber.org/protocol/disco#items'/>";
			DemoApp.client.sendIq("get", DemoApp.roomService, xmlContent, getAllRooms);

		};

		_openRoom = function(roomname,subject,nickname) {

			var roomJid = roomname + "@" + DemoApp.roomService;

			var newjid = fixString(roomJid);

			var connectedUser = DemoApp.client.connectedUser;
			if (nickname == "") {
				nickname = connectedUser.getDisplayName();
			}

			if (DemoApp.room[roomname] == null || (!DemoApp.room[roomname].isActive())) {

				DemoApp.room[roomname] = DemoApp.mucController.room(roomJid);

				if (DemoApp.room[roomname] != null) {

					var success = _enterRoom(roomname,nickname);
					if (success) {
						log("DemoApp","Successfully entered " + roomname);
					}

					DemoApp.room[roomname].event("roomSubjectChanged").bind(function(evt) {
						log("DemoApp", "Subject Changed");
						var message = evt.data;
						var subject = message.getSubject();
						DemoApp.subjects[roomname] = subject;
						log("DemoApp", "Subject: " + subject);
					});

					// Respond to an event that is triggered when an occupant is added to the room
					DemoApp.room[roomname].occupants.event("entityCreated").bind(function(evt) {
						log("DemoApp", "got entityCreated event" + evt.data);
						_updateOccupantsList(roomname);
					});

					// Respond to an event that is triggered when an occupant is updated in the room
					DemoApp.room[roomname].occupants.event("entityUpdated").bind(function(evt) {
						log("DemoApp", "got entityUpdated event" + evt.data);
						_updateOccupantsList(roomname);
					});

					// Respond to an event that is triggered when an occupant is removed from the room
					DemoApp.room[roomname].occupants.event("entityDestroyed").bind(function(evt) {
						log("DemoApp", "got entityDestroyed event" + evt.data);
						_updateOccupantsList(roomname);
					});

					// Respond to an event that is triggered when an occupant in the room is renamed
					DemoApp.room[roomname].occupants.event("entityRenamed").bind(function(evt) {
						log("DemoApp", "got entityRenamed event" + evt.data);
						_updateOccupantsList(roomname);
					});

					DemoApp.room[roomname].event("errorEncountered").bind(function(evt) {
						log("DemoApp", "MUC error");
					});

					/**
					 * Event fired when the room has been entered completely. This
					 * event handler maps other event handlers that are valid only
					 * when a room has been entered.
					 */
					DemoApp.room[roomname].event("roomEntered").bind(function(evt) {

						log("DemoApp", "in roomEntered");

						/**
						 * event fired when we have fully exited a room.
						 * Destroy the room and clear our local reference.
						 *
						 * see ../api/symbols/jabberwerx.MUCRoom.html#destroy
						 */
						DemoApp.room[roomname].event("roomExited").bind(function(evt) {
							$("#" + newjid).dialog("close");
						});

						/**
						 * event fired when the room receives a message. evt.data
						 * is the jabberwerx.Message received.
						 *
						 * ../api/symbols/jabberwerx.Message.html#getBody
						 */
						DemoApp.room[roomname].event("roomBroadcastReceived").bind(function(evt) {
							var msgFrom = evt.data.getFrom();
							log("DemoApp", "broadcast message from " + msgFrom);
							var index = msgFrom.indexOf('/') + 1;
							msgFrom = msgFrom.substr(index, msgFrom.length);
							var msgBody = evt.data.getBody();
							$("#mut" + newjid).append("<div class='muchatname'>" + msgFrom + "</div>");
							$("#mut" + newjid).append("<div class='muchattext'>" + msgBody + "</div>");
							$('.mut' + newjid).animate({
								scrollTop: 10000
							});
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
						DemoApp.room[roomname].event("roomSubjectChanged").bind(function(evt) {
							log("DemoApp", "muc chatroom subject changed to " + evt.data.getSubject());
							$("#mucs" + newjid).html("Subject: " + evt.data.getSubject());
						});
						/**
						 * The room's subject is one of its properties and is
						 * available via room.properties.subject.
						 *
						 * This is unused in this demo, so the line is commented out
						 */
			//          $('#subjectLabel').html(room.properties.subject);

						_updateOccupantsList(roomname);

					});
                } else {
					log("DemoApp","failed to create room");
				}
				if (subject == "") {
					var subject = DemoApp.subjects[roomname];
				}
				_MUChatRoom(roomname, subject, nickname, newjid);
			}

		};

        _updateOccupantsList = function(roomname) {
            /**
             * room.occupants is a jabberwerx.EntitySet of
             * jabberwerx.MUCOccupant entities. The toArray method converts
             * an entity set to a simple array of entities.
             *
             * ../api/symbols/jabberwerx.MUCOccupant.html
             */
			newjid = fixString(roomname + "@" + DemoApp.roomService);

			log("updateOccupants", "Updating occupants list");
			if (DemoApp.room[roomname] == null || DemoApp.room[roomname].occupants.toArray().length == 0) {
				log("updateOccupants", "room == null");
                $("#occl" + newjid).html("");
                $("#occl" + newjid + " ul").append('<li class="occupant">Nobody</li>');
            } else {
				log("updateOccupants", "room != null");
                $("#occl" + newjid).html("");
                var occupants = DemoApp.room[roomname].occupants.toArray();
                for (var i in occupants) {
                    var occ = occupants[i].getNickname();
					log("Occupants: ", occ);
                    var endch = occ.search("@");
                    if (endch > 0) {
                        var occupant = occ.substr(0, endch);
					} else {
                        var occupant = occ;
					}
					log("Occupants", "adding occupant " + occupant);
					$("body").find("#occl" + newjid).append("<li class='occupant'>" + occupant + "</li>");
//                    $("#occupantlist ul").append("<li class='occupant'>" + occupant + "</li>");
                }
            }
        };

		_inviteSomeone = function(roomname) {
/*
            if (DemoApp.room[roomname] == null || !DemoApp.room[roomname].isActive()) {
                myalert("Please enter a chat room before attempting to invite a contact");
                return;
            }
*/
			var contacts = [];
			var contact;
			var selecteduser;

			DemoApp.client.entitySet.each(function(entity) {
				if (entity instanceof jabberwerx.RosterContact) {
					var displayName = entity.getDisplayName();
					var userJid = entity.jid.toString();
					var newjid = fixString(userJid);
					contact = '<option id="' + newjid + '" value="' + userJid + '">' + displayName + '</option>';
					contacts.push(contact);
				}
			});

            $('<div id="invitetomuc"><label for="muccontacts">Select a contact</label><BR>' +
				'<select id="muccontacts" class="pselect">' +
				'</select><BR><BR>' +
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
                    at: "center top",
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
                            try {
								selecteduser = $("#muccontacts").val();
								log("invite", selecteduser + " " + reason);
                                DemoApp.room[roomname].invite(selecteduser, reason, true);
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

			contacts.sort();

			for (var i = 0; i < contacts.length; i++) {
				if (i == 0) {
					var changeit = contacts[i];
					var output = changeit.substr(0, 8) + ' selected="selected"' + changeit.substr(8);
					contacts[i] = output;
				}
				$("#muccontacts").append(contacts[i]);
			}

			$( "#muccontacts" ).selectmenu({
				select: function( event, ui ) {
					selecteduser = $("#muccontacts").val();
					log ("DemoApp", "Selected JID = " + selecteduser);
				}
			});

			$( "#muccontacts" )
			  .selectmenu()
			  .selectmenu( "menuWidget" )
				.addClass( "overflow" );
			};

        _inviteToMUCChat = function(userJid, displayName, roomname) {
			log("inviteMUC", "inviting " + userJid + " " + displayName + " to chat room");
            if (DemoApp.room[roomname] == null || !DemoApp.room[roomname].isActive()) {
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
                    at: "center top",
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
								log("invite", userJid + " " + reason);
                                DemoApp.room[roomname].invite(userJid, reason, true);
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
        };

        _reactToInvitation = function(roomname, invitor, reason) {
			var myJid = DemoApp.client.connectedUser.jid;
			var jidentity = DemoApp.client.entitySet.entity(myJid);
			var nickname = jidentity.getDisplayName();

            $('<div id="invitation">' +
                'You have been invited to a chatroom by ' + invitor + ' for reason: ' + reason + '<br><br>' +
                'Your Nickname:<br>' +
                '<input type="text" class="jqinput" name="nickname" id="nickname" placeholder="' + nickname + '"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 280,
                minWidth: 300,
                minHeight: 280,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "center top",
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
                    $("#invitation").dialog("destroy").remove();
                },
                buttons: {
                    "Accept": {
                        id: "accept",
                        text: "Accept",
                        click: function() {
							log("reactToInvitation", "reacting to " + invitor + " " + reason);
                            var nickname = $("#nickname").val();
                            if (nickname == "") {
                                nickname = jidentity.getDisplayName();
                            }
                            $("#invitation").dialog("close");
							_joinMUCRoom(roomname, nickname);
                        }
                    },
                    "Reject": {
                        id: "reject",
                        text: "Reject",
                        click: function() {
                            $("#invitation").dialog("close");
                        }
                    }
                }
            });
        };

        _changeSubject = function(roomname) {
            if (DemoApp.room[roomname] == null || !DemoApp.room[roomname].isActive()) {
                myalert("Please enter a chat room before attempting to change the subject");
                return;
            }

            $('<div id="changesubject">' +
                'Current Subject:<br><div id="dname">' + DemoApp.room[roomname].properties.subject + '</div><br>' +
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
                    at: "center top",
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
                            log("DemoApp", "changing subject to " + subject);
                            if (subject == "") {
                                $("#changesubject").dialog("close");
                            }
                            //room.isActive returns true if we have fully entered the room.
                            try {
                                DemoApp.room[roomname].changeSubject(subject);
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
        };

        _changeNickname = function(roomname) {
            if (DemoApp.room[roomname] == null || !DemoApp.room[roomname].isActive()) {
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
                    at: "center top",
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
                                DemoApp.room[roomname].changeNickname(nickname);
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
        };

        _broadcastMessage = function(roomname) {

			newjid = fixString(roomname + "@" + DemoApp.roomService);

			//room.isActive returns true if we have fully entered the room.
            if (DemoApp.room[roomname] == null || !DemoApp.room[roomname].isActive()) {
                myalert("Please enter a chat room before attempting to broadcast");
                return;
            }
            var body = $("#brt" + newjid).val();
            if (!body) {
                log("DemoApp", "send has empty message");
                return;
            }
            try {
                DemoApp.room[roomname].sendBroadcast($("#brt" + newjid).val());
            } catch (ex) {
                myalert(ex.message);
            }
            $("#brt" + newjid).val("");
            $("#brt" + newjid).focus();
            //       $("#muchtext").append(chat);
        };

        _enterRoom = function(roomname,nickname) {

            var enterRoomArgs = {
                successCallback: _onRoomEnterSuccess,
                errorCallback: _onRoomEnterError
            };
            try {
                log("DemoApp", "entering room");
                DemoApp.room[roomname].enter(nickname, enterRoomArgs);
				return(true);
            } catch (ex) {
                log("DemoApp", "Error attempting to enter room: " + ex.message);
				DemoApp.room[roomname].destroy();
				DemoApp.room[roomname] = null;
				return(false);
            }
        };

        _onRoomEnterSuccess = function() {
            log("DemoApp", "successfully entered room");
        };

        _onRoomEnterError = function(err, aborted) {

            log("DemoApp", 'Error entering room: ' + err.message);
/*
            DemoApp.room[roomname].exit();
            DemoApp.room[roomname].destroy();
            DemoApp.room[roomname] = null;
*/
        };

});
