/*
Copyright (c) 2018 Cisco and/or its affiliates

These terms govern this Cisco Systems, Inc. ("Cisco"), example or demo
source code and its associated documentation (together, the "Sample
Code"). By downloading, copying, modifying, compiling, or redistributing
the Sample Code, you accept and agree to be bound by the following terms
and conditions (the "License"). If you are accepting the License on
behalf of an entity, you represent that you have the authority to do so
(either you or the entity, "you"). Sample Code is not supported by Cisco
TAC and is not tested for quality or performance. This is your only
license to the Sample Code and all rights not expressly granted are
reserved.

1. LICENSE GRANT: Subject to the terms and conditions of this License,
Cisco hereby grants to you a perpetual, worldwide, non-exclusive, non-
transferable, non-sublicensable, royalty-free license to copy and
modify the Sample Code in source code form, and compile and
redistribute the Sample Code in binary/object code or other executable
forms, in whole or in part, solely for use with Cisco products and
services. For interpreted languages like Java and Python, the
executable form of the software may include source code and
compilation is not required.

2. CONDITIONS: You shall not use the Sample Code independent of, or to
replicate or compete with, a Cisco product or service. Cisco products
and services are licensed under their own separate terms and you shall
not use the Sample Code in any way that violates or is inconsistent
with those terms (for more information, please visit:
www.cisco.com/go/terms).

3. OWNERSHIP: Cisco retains sole and exclusive ownership of the Sample
Code, including all intellectual property rights therein, except with
respect to any third-party material that may be used in or by the
Sample Code. Any such third-party material is licensed under its own
separate terms (such as an open source license) and all use must be in
full accordance with the applicable license. This License does not
grant you permission to use any trade names, trademarks, service
marks, or product names of Cisco. If you provide any feedback to Cisco
regarding the Sample Code, you agree that Cisco, its partners, and its
customers shall be free to use and incorporate such feedback into the
Sample Code, and Cisco products and services, for any purpose, and
without restriction, payment, or additional consideration of any kind.
If you initiate or participate in any litigation against Cisco, its
partners, or its customers (including cross-claims and counter-claims)
alleging that the Sample Code and/or its use infringe any patent,
copyright, or other intellectual property right, then all rights
granted to you under this License shall terminate immediately without
notice.

4. LIMITATION OF LIABILITY: CISCO SHALL HAVE NO LIABILITY IN CONNECTION
WITH OR RELATING TO THIS LICENSE OR USE OF THE SAMPLE CODE, FOR
DAMAGES OF ANY KIND, INCLUDING BUT NOT LIMITED TO DIRECT, INCIDENTAL,
AND CONSEQUENTIAL DAMAGES, OR FOR ANY LOSS OF USE, DATA, INFORMATION,
PROFITS, BUSINESS, OR GOODWILL, HOWEVER CAUSED, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGES.

5. DISCLAIMER OF WARRANTY: SAMPLE CODE IS INTENDED FOR EXAMPLE PURPOSES
ONLY AND IS PROVIDED BY CISCO "AS IS" WITH ALL FAULTS AND WITHOUT
WARRANTY OR SUPPORT OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY
LAW, ALL EXPRESS AND IMPLIED CONDITIONS, REPRESENTATIONS, AND
WARRANTIES INCLUDING, WITHOUT LIMITATION, ANY IMPLIED WARRANTY OR
CONDITION OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-
INFRINGEMENT, SATISFACTORY QUALITY, NON-INTERFERENCE, AND ACCURACY,
ARE HEREBY EXCLUDED AND EXPRESSLY DISCLAIMED BY CISCO. CISCO DOES NOT
WARRANT THAT THE SAMPLE CODE IS SUITABLE FOR PRODUCTION OR COMMERCIAL
USE, WILL OPERATE PROPERLY, IS ACCURATE OR COMPLETE, OR IS WITHOUT
ERROR OR DEFECT.

6. GENERAL: This License shall be governed by and interpreted in
accordance with the laws of the State of California, excluding its
conflict of laws provisions. You agree to comply with all applicable
United States export laws, rules, and regulations. If any provision of
this License is judged illegal, invalid, or otherwise unenforceable,
that provision shall be severed and the rest of the License shall
remain in full force and effect. No failure by Cisco to enforce any of
its rights related to the Sample Code or to a breach of this License
in a particular situation will act as a waiver of such rights. In the
event of any inconsistencies with any other terms, this License shall
take precedence.
*/


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
