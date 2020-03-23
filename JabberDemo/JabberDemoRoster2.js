$(document).ready( function () {


        // Create the contact roster
        _createRoster = function() {
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
                    my: "left+10 top+10",
                    at: "left top",
                    of: window
                },
                title: "Roster",
				dialogClass: "material",
                closeOnEscape: false,
                buttons: {
					"Toggle": {
						id: "togglelog",
						text: "Toggle Log",
						click: function() {
							if ($("#logdialog").dialog("isOpen") === true) {
								$("#logdialog").dialog("close");
							} else {
								$("#logdialog").dialog("open");
							}
						}
					},
                    "Logout": {
                        id: "logout",
                        text: "Logout",
                        click: function() {
                            if (DemoApp)
                                DemoApp._disconnect();
                            $(this).dialog("close");
                        }
                    }
                }
            });
			
			$("#roster").dialog({
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                },
                close: function(event, ui) {
                    if (DemoApp)
                        DemoApp._disconnect();
                    DemoApp = null;
                    $(this).dialog("close");
                }
			});

            // Add an image for my own presence
            $("#mypresence").append('<img id="mypimage" class="mypimage" src="JabberDemo/img/Available.png">&nbsp;&nbsp;');

            // Add a select list for my own presence
            $("#mypresence").append('<select name="presence" id="presence" class="pselect"></select>');
            $("#presence").append('<option selected="selected" data-class="available" value="available">Available</option>');
            $("#presence").append('<option value="away" data-class="away">Away</option>');
            $("#presence").append('<option value="dnd" data-class="dnd">Do Not Disturb</option>');

			 $("#presence").selectmenu({
				select: function( event, ui ) {
				   $("#mystatus").val("");
				   DemoApp._sendPresence();
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
                _addContact();
            });;

            // Button for opening chat room
            $("#mypresence").append('<button id="mucbutton" title="Open Chat Room" class="mucbutton">&nbsp;</button>');
            $("#mucbutton").button({
                icons: {
                    primary: "ui-icon-signal-diag"
                },
                text: false
            }).click(function(event) {
                _createChatRoom();
            });;
			
            // Custom presence text input field
            $("#mypresence").append('<input type="text" class="prtext" name="mystatus" id="mystatus" placeholder="Available"></input>');

            // update custom status if user presses enter in custom status field, or if user just leaves that field
            $("#mystatus").keypress(function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 13) {
                    DemoApp._sendPresence();
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
                DemoApp._sendPresence();
                // I had some css here to make the input box disappear
                // when not editing custom status, in order
                // to mimic the Jabber/Windows client, but it didn't look very good
                //          $("#mystatus").css(
                //          );
            });
			// if we're creating the roster, this must be right after log in
			// so tell everyone we're available
        };

		
        // Load the roster with contacts
        _loadRoster = function() {


		// log all the entity display names (debug)
/*		
			DemoApp.client.entitySet.each(function(entity) {
				var displayName = entity.getDisplayName();
				var userJid = entity.jid.toString();
				log("DemoApp","Entity: " + displayName + " " + userJid);
			});
*/		
            log("JWA", "loading the roster");
/*			
            if ($("#rosterlist").hasClass("ui-accordion")) {
                return;
            }
*/
			$("#rosterlist").html("");

            $("#rosterlist").accordion({
                header: "> div > h3"
            });
		
            var groups = DemoApp.client.entitySet.getAllGroups();
            var groupArray = [];
			
            // alphebetize the group names
            for (var k in groups) {
                groupArray.push(groups[k]);
            }
            groupArray.sort();
			groupArray.push("Rooms");
            var arrayLength = groupArray.length;
			
            // iterate through the alphebetized groups and add contacts
            for (var i = 0; i < arrayLength; i++) {
                var thisGroup = groupArray[i];
                log("loadRoster", thisGroup);
                var grouper = fixString(thisGroup);
                $("#rosterlist").append('<div class="grouphead" id="' + grouper + '"><h3>' + thisGroup + '</h3><div id="gr' + grouper + '" class="ingroup"></div></div>');
                $("#gr" + grouper).disableSelection();
            }
            _loadGroups();
			_getChatRooms();
            _updateRosterPresence("all");
//			_updateRoomPresence();
			
            $("#rosterlist").disableSelection();
            $("#rosterlist").accordion("refresh");
            $("#rosterlist").accordion({
                active: 0
            });
//			DemoApp._requestProfiles();
        };

        // The loadGroups portion of loading the roster with contacts
        _loadGroups = function() {

            log("DemoApp", "loading groups");
            var groups = DemoApp.client.entitySet.getAllGroups();
            var numGroups = groups.length;

            // now load the groups that are left
            for (i = 0; i < numGroups; i++) {
                var thisGroup = groups[i];
				log("DemoApp", "Found Group: " + thisGroup)
                _loadGroup(thisGroup);
            }
            _loadUnassigned();
            _updateRosterPresence("all");
        };
		
		
        // The load individual group portion of loading roster
        _loadGroup = function(thisGroup) {
            var grouper = fixString(thisGroup);
            $("#gr" + grouper).empty();
            if (thisGroup != null) {
                var contactArray = [];
                DemoApp.client.entitySet.each(function(entity) {
                    var groupList = entity.getGroups();
                    if (entity instanceof jabberwerx.RosterContact && ($.inArray(thisGroup, groupList) != -1)) {
                        var displayName = entity.getDisplayName();
                        var userJid = entity.jid.toString();
                        var newjid = fixString(userJid);
						var contact = buildContact(displayName, userJid, newjid, grouper, thisGroup);
                        contactArray.push(contact);
                    }
                });
				
                // alphebetize the contacts and then add them
                contactArray.sort();
                var carrayLength = contactArray.length;
                for (var j = 0; j < carrayLength; j++) {
                    $("#gr" + grouper).append(contactArray[j]);
                }
            }
        };

        // Sometimes the roster has contacts that are unassigned to a group
        // This happens for various reasons (e.g. unresponseive to presence)
        // dump them into an "Unassigned" group
        _loadUnassigned = function() {
            var contactArray = [];
            DemoApp.client.entitySet.each(function(entity) {
                var groupList = entity.getGroups();
                // add groupless contacts to the "Unassigned" group
                if (entity instanceof jabberwerx.RosterContact && (groupList.length == 0)) {
                    var thisGroup = "Unassigned";
                    groupList.push(thisGroup);
                    var grouper = fixString(thisGroup);
                    var displayName = entity.getDisplayName();
                    var userJid = entity.jid.toString();
                    var newjid = fixString(userJid);
					var contact = buildContact(displayName, userJid, newjid, grouper, thisGroup);
					contactArray.push(contact);
                    DemoApp.rosterController.updateContact(userJid, displayName, groupList, _contactError);
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
        };
		
		
        // Update the presence icon and status for all contacts in all groups
        _updateRosterPresence = function(oneJid) {
            var groups = DemoApp.client.entitySet.getAllGroups();
            var arrayLength = groups.length;
            for (i = 0; i < arrayLength; i++) {
                var thisGroup = groups[i];
                grouper = fixString(thisGroup);
                DemoApp.client.entitySet.each(function(entity) {
                    groupList = entity.getGroups();
                    if (entity instanceof jabberwerx.RosterContact && ($.inArray(thisGroup, groupList) != -1)) {
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
                                        $("#gr" + grouper).find("#im" + newjid).attr('src', "JabberDemo/img/Available.png");
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
                                        $("#gr" + grouper).find("#im" + newjid).attr('src', "JabberDemo/img/Offline.png");
                                        $("#gr" + grouper).find("#im" + newjid).attr('alt', 'Offline');
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
        };

/*		
        _updateRoomPresence = function() {
			
            var arrayLength = DemoApp.roomJids.length;
			log("DemoApp","Number of persist rooms for presence check is " + arrayLength);
            grouper = fixString("Rooms");
			
            for (i = 0; i < arrayLength; i++) {
                DemoApp.client.entitySet.each(function(entity) {
					roomJid = entity.jid.toString();
					if (roomJid == DemoApp.roomJids[i]) {
						log("DemoApp","getting presence for " + roomJid);
						newjid = fixString(userJid);
						try {
							presence = entity.getPrimaryPresence();
							if (presence != null) {
								var show = presence.getType() || presence.getShow() || "available";
								var status = presence.getStatus();
								var priority = presence.getPriority();
								// don't spam log with every change if this is just one jid
								if (show == "available") {
									$("#gr" + grouper).find("#im" + newjid).attr('src', "JabberDemo/img/Available.png");
									$("#gr" + grouper).find("#im" + newjid).attr('alt', 'Available');
								}
								var src = getSrcImage(show);
								$("#gr" + grouper).find("#im" + newjid).attr('src', src);
							}
						} catch (ex) {
							log("JWA", "execption in presence " + ex);
						}
					}
                });
            }
		};
*/		
		
        // Empty the Roster
        _unloadRoster = function() {
            log("JWA", "unloading roster");
            if ($("#rosterlist").hasClass("ui-accordion")) {
                $("#rosterlist").accordion("destroy").remove();
            }
        };

        // Destroy the roster dialog
        _destroyRoster = function() {
            log("JWA", "destroying roster");
            if ($("#roster").hasClass('ui-dialog-content')) {
                $("#roster").dialog("destroy").remove();
            }
        };

        // Add a contact to your roster
        _addContact = function() {
            $('<div id="addcontact">' +
                'Display Name:<br>' +
                '<input type="text" class="jdinput" name="dname" id="dname"></input><br><br>' +
                'Contact JID:<br>' +
                '<input type="text" class="jdinput" name="jname" id="jname"></input><br><br>' +
                'Add to Group:<br>' +
                '<select name="groups" id="groups" class="pselect"></select><br><br>' +
                'Or Create New Group:<br>' +
                '<input type="text" class="jdinput" name="gname" id="gname"></input><br><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 350,
                minWidth: 300,
                minHeight: 350,
				modal: true,
                resizable: true,
                position: {
                    my: "left+20 top+20",
                    at: "center top",
                    of: window
                },
				dialogClass: "material",
                closeOnEscape: false,
                title: "Add New Contact",
                show: {
                    effect: "fold",
                    duration: 100
                },
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
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
                            _newContact(jid, nickname, thisGroup);
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
            var groups = DemoApp.client.entitySet.getAllGroups();
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
        };

        // Update Contact only allows you to change the display name (nickname)
        _updateContact = function(jid, thisGroup) {
            $('<div id="updatecontact">' +
                'Display Name:<br>' +
                '<input type="text" class="jdinput" name="dname" id="dname"></input><br><br>' +
                'Contact JID:<br><div id="jname"></div><br>' +
                'This Group:<br><div id="group"></div><br>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 280,
                minWidth: 300,
                minHeight: 280,
				modal: true,
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
                close: function(event, ui) {
                    $("#updatecontact").dialog("destroy").remove();
                },
                title: "Edit Contact",
                show: {
                    effect: "fold",
                    duration: 100
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
                            _saveContact(jid, nickname, thisGroup);
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
                var entity = DemoApp.client.entitySet.entity(jid);
                var displayName = entity.getDisplayName();
                $("#dname").val(displayName);
                $("#jname").text(jid);
            }
            if (thisGroup != null) {
                $("#group").text(thisGroup);
            }
            var grouper = fixString(thisGroup);
        };

        // Move or copy a contact from one group to another
        _updateGroups = function(jid, thisGroup, op) {
            $('<div id="updategroups">' +
                '<select name="groups" id="groups" class="pselect"></select>' +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 200,
                minWidth: 300,
                minHeight: 200,
				modal: true,
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
                close: function(event, ui) {
                    $("#updategroups").dialog("destroy").remove();
                },
                title: op + " to Group",
                show: {
                    effect: "fold",
                    duration: 100
                },
                buttons: {
                    "Update": {
                        id: "update",
                        text: op,
                        click: function() {
                            var newGroup = $("#groups").val();
                            _contactUpdateGroups(jid, thisGroup, newGroup);
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
            var groups = DemoApp.client.entitySet.getAllGroups();
            groups.sort();
            $("#groups").append('<option selected="selected" value="' + groups[0] + '">' + groups[0] + '</option>');
            for (i = 1; i < groups.length; i++) {
                $("#groups").append('<option value="' + groups[i] + '">' + groups[i] + '</option>');
            }
            $("#groups").selectmenu({
                select: function(event, ui) {}
            });
        };

        // Remove a contact from a group
        _removeContact = function(jid, thisGroup) {
            $('<div id="removecontact">' +
                '<br>Removing from group: ' + thisGroup +
                '</div>').dialog({
                autoOpen: true,
                width: 300,
                height: 150,
                minWidth: 300,
                minHeight: 150,
				modal: true,
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
                close: function(event, ui) {
                    $("#removecontact").dialog("destroy").remove();
                },
                title: "Remove Contact",
                show: {
                    effect: "fold",
                    duration: 100
                },
                buttons: {
                    "Remove": {
                        id: "remove",
                        text: "Remove",
                        click: function() {
                            _removeFromGroup(jid, thisGroup);
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
        };

        // Save a contact to the roster
        _saveContact = function(jid, nickname, thisGroup) {
            log("saveContact", jid + " " + nickname + " " + thisGroup);
            DemoApp.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact && (entity.jid == jid)) {
                    try {
                        var groups = entity.getGroups();
                    } catch (ex) {
                        log("JWA", "saveContact " + ex);
                    }
                    // Contact is already in this group, must be an update
                    if ($.inArray(thisGroup, groups)) {
                        try {
                            DemoApp.rosterController.updateContact(jid, nickname, groups, _contactError);
                        } catch (ex) {
                            log("JWA", "saveContact " + ex);
                        }
                        return;
                    } else {
                        // New group for this contact, add it to contact's groups
                        groups.push(thisGroup);
                        try {
                            DemoApp.rosterController.updateContact(jid, nickname, groups, _contactError);
                        } catch (ex) {
                            log("JWA", "saveContact" + ex);
                        }
                        return;
                    }
                }
            });
        };
		
        // This adds the contact HTML to the DOM and updates the roster
        _newContact = function(jid, nickname, thisGroup) {
            log("newContact", jid + " " + nickname + " " + thisGroup);
            var groups = DemoApp.client.entitySet.getAllGroups();
            var grouper = fixString(thisGroup);

            // see if contact already exists, get its groups
            var groupList = [];
            DemoApp.client.entitySet.each(function(entity) {
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
				var contact = buildContact(displayName, userJid, newjid, grouper, thisGroup);
                $("#gr" + grouper).append(contact);
            }
            try {
                if ($.inArray(thisGroup, groupList) == -1) {
                    groupList.push(thisGroup);
                }
                // Update the CAXL roster with this contact
                DemoApp.rosterController.updateContact(jid, nickname, groupList, _contactError);
            } catch (ex) {
                log("JWA", "newContact " + ex);
            }
        };

        // This updates the HTML in the DOM and the CAXL roster
        // when contacts are moved or copied
        _contactUpdateGroups = function(jid, oldGroup, newGroup) {
            // if oldGroup is not null, then this is a move
            // if oldGroup is null, then this is a copy

            // do this in preparation for the possibility
            // that moving away from this group will leave the group empty
            var groups = DemoApp.client.entitySet.getAllGroups();
            var ctgroups = [];
            for (i in groups) {
                ctgroups.push(groups[i]);
            }
            for (i in groups) {
                ctgroups[ctgroups[i]] = 0;
            }
            DemoApp.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
                    var cgroups = entity.getGroups();
                    for (i in cgroups) {
                        ctgroups[cgroups[i]] += 1;
                    }
                }
            });

            // now perform the move/copy
            DemoApp.client.entitySet.each(function(entity) {
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
                        DemoApp.rosterController.updateContact(jid, displayName, groups, _contactError);
						var contact = buildContact(displayName, userJid, newjid, grouper, thisGroup);
						$("#gr" + grouper).append(contact);
                        _loadGroup(newGroup);
                        _updateRosterPresence(userJid);
                        return;
                    }
                }
            });
        };

        // This updates the HTML in the DOM when a contact
        // is removed from a group
        _removeFromGroup = function(jid, thisGroup) {
            // do this in preparation for the possibility
            // that removing from this group will leave the group empty
            var groups = DemoApp.client.entitySet.getAllGroups();
            var ctgroups = [];
            for (i in groups) {
                ctgroups.push(groups[i]);
            }
            for (i in groups) {
                ctgroups[ctgroups[i]] = 0;
            }
            DemoApp.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
                    var cgroups = entity.getGroups();
                    for (i in cgroups) {
                        ctgroups[cgroups[i]] += 1;
                    }
                }
            });

            DemoApp.client.entitySet.each(function(entity) {
                if (entity instanceof jabberwerx.RosterContact) {
                    var groups = entity.getGroups();
                    var nickname = entity.getDisplayName();
                    var userJid = entity.jid.toString();
                    var grouper = fixString(thisGroup);

                    if ((userJid == jid)) {
                        // remove this contact from the groups array
                        var newjid = fixString(jid);
                        if (groups.length == 0) {
                            log("deleting from only group", thisGroup + " " + jid);
                            DemoApp.rosterController.deleteContact(jid, _contactError);
                        } else {
                            // if Contact still appears in some other group,
                            // don't delete, just update in CAXL
                            log("remove from this group", thisGroup + " " + jid);
                            DemoApp.rosterController.updateContact(jid, nickname, groups, _contactError);
                        }

                        // remove contact from group roster
                        $("#ro" + newjid + grouper).remove();
						   var groups = DemoApp.client.entitySet.getAllGroups();
						var numGroups = groups.length;

						// now load the groups
						for (i = 0; i < numGroups; i++) {
							var thisGroup = groups[i];
							log("DemoApp", "Found Group: " + thisGroup)
							_loadGroup(thisGroup);
						}
						_updateRosterPresence("all");
                        return;
                    }
                }
            });
        };

   		_setAvailable = function() {
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
            DemoApp.controller.client.sendStanza(presence);
		},

     // Logging for when errors occur
        _contactError = function(errorStanza) {
            log("JWA", "error condition: " + errorStanza.condition);
            log("JWA", "error text: " + errorStanza.text);
            log("JWA", "error type: " + errorStanza.type);
        };


});