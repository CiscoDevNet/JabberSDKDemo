$(document).ready( function () {

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

    // utility function to remove an element from an array
    remove = function (arr, item) {
		var index = arr.indexOf(item);
		if (index > -1) {
			arr.splice(index, 1);
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
            log("DemoApp", "got null in fixString");
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
                my: "right-10 bottom-10",
                at: "right bottom",
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
	
	toggleLog = function() {
		if ($("#logdialog").dialog("isOpen") === true) {
			$("#logdialog").dialog("close");
		} else {
			$("#logdialog").dialog("open");
		}
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
            '<input type="text" class="jdinput" name="username" id="username"></input><br><br>' +
            'Password:<br><input type="password" class="jdinput" name="password" id="password"></input><br><br>' +
            'BOSH URL:<br><input type="text" class="jdinput" name="boshurl" id="boshurl"></input><br><br>' +
            'Domain:<br><input type="text" class="jdinput" name="domain" id="domain"></input><br><br>' +
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
                        DemoApp._connect();
                        $("#logindialog").dialog("close");
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

	buildContact = function(displayName, userJid, newjid, grouper, thisGroup) {
		contact = '<div title="' + displayName + ' (' + userJid + ')" id="ro' + newjid + grouper + '" group="' + thisGroup + '" jid="' + userJid + '" ondblclick="DemoApp._openChat(\'' + userJid + '\')" class="contact">' +
			'<section class="section">' +
			'<img class="pimage" title="' + displayName + ' (' + userJid + ')" id="im' + newjid + '" src="JabberDemo/img/Offline.png">' +
			'<div id="dn' + newjid + '">' + displayName + '</div>' +
			'</section>' + 
			'<section><div class="status" id="st' + newjid + '"></div>' +
			'<div>' +
			
			'<span title="Get Contact Info" onclick="DemoApp._getLDAP(\'' + userJid + '\')" class="options ui-icon ui-icon-contact"></span>' +
			'<span title="Remove" onclick="_removeContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-close"></span>' +
			'<span title="Copy to Group" onclick="_updateGroups(\'' + userJid + '\',null,\'Copy\')" class="options ui-icon ui-icon-copy"></span>' +
			'<span title="Move to Group" onclick="_updateGroups(\'' + userJid + '\',\'' + thisGroup + '\',\'Move\')" class="options ui-icon ui-icon-arrowthick-1-e"></span>' +
			'<span title="Edit Contact" onclick="_updateContact(\'' + userJid + '\',\'' + thisGroup + '\')" class="options ui-icon ui-icon-pencil"></span>' +
			'<span title="Chat" onclick="DemoApp._openChat(\'' + userJid + '\')" class="options ui-icon ui-icon-comment"></span>' +
	
			'</section></div>';
		return (contact);
	};

	buildRoom = function(roomJid,roomName) {
		var newjid = fixString(roomJid);
		room = '<div title="' + roomName + ' (' + roomJid + ')" jid="' + roomJid + '" ondblclick="_openRoom(\''+ roomName +'\',\'\',\'\')" class="contact">' +
			'<section class="section">' +
			'<img class="pimage" title="' + roomName + ' (' + roomJid + ')" id="im' + newjid + '" src="JabberDemo/img/Offline.png">' +
			'<div id="dn' + newjid + '">' + roomName + '</div>' +
			'</section></div>';
		return (room);
	};

	// create a jQuery UI tabbed div for a chat window
    openChat = function (displayName, userJid) {
        newjid = fixString(userJid);

        // if the "tabs" section doesn't exist, create it
        if ($("#tabs").hasClass('tabchatarea') != true) {
            $("#mainDemoContainer").append('<div id="chattabs" class="chattabs"></div>');
            $("#chattabs").dialog({
                position: {
                    my: "right-10 top+10",
                    at: "right top",
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
            '<div class="chatstate" id="cs' + newjid + '"><img id="csi"' + newjid + '" class="csimage" src="JabberDemo/img/csIdle.png">' +
            '</div>' +
            '<textarea class="messagetext" alt="' + newjid + '" id="mt' + newjid + '"></textarea>' +
            '<input class="sendbutton" type="button" value="Send" onclick="DemoApp._sendMessage(\'' + userJid + '\')" id="sb' + newjid + '"/>' +
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
        DemoApp._closeSession(userJid);
    };

    // return the image src for various presence states
    // such as Available, Away, etc.
    getSrcImage = function (show) {
        var src;
        switch (show) {
            case "away":
                src = "JabberDemo/img/Away.png";
                break;
            case "xa":
                src = "JabberDemo/img/Away.png";
                break;
            case "unavailable":
                src = "JabberDemo/img/Offline.png";
                break;
            case "Meeting":
                src = "JabberDemo/img/Meeting.png";
                break;
            case "available":
            case "chat":
                src = "JabberDemo/img/Available.png";
                break;
            case "dnd":
                src = "JabberDemo/img/DND.png";
                break;
            default:
                src = "JabberDemo/img/Offline.png";
                break;
        }
        return (src);
    };

});
