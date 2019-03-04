//##################
//REGION POLLING
//##################
//This code requiers:
//Header
var polling = {}

//Local variables (Don't touch)
polling.log = [] //server-only TODO

polling.onMessage = function (sender, msg) {
    if (msg.length > 0) {
        if (mailbox.myHullNumber == 0) {
            var packet = {};
            packet.time = Date.now();
            packet.msg = msg;
            packet.hullid = sender;
            polling.log.push(packet);
        }
        if (msg[0] == "#") {
            var result = eval(msg.slice(1, msg.length));
            mailbox.send(0, "$" + result);
        }
        if (msg[0] == "$" && mailbox.myHullNumber() == 0) { //from client to server - cmd finished
            controllers[sender].status = 0;
            controllers[sender].callback = msg.slice(1, msg.length);
        }
    }
}

/*
Call this method on init. 
When the message recieved onMessageEvent will be called.
*/
polling.start = function() {
	//if (mailbox.myHullNumber() != 0) //Main controller
        mailbox.connect(controllers[0].ip);
    mailbox.newMessage.connect(polling.onMessage);
}

/*
Call instead of mailbox.send();
*/
polling.send = function (hull, text) {
    if (text == "")
        return;
    mailbox.send(hull, text);
    if (mailbox.myHullNumber() == 0 && text[0] == "#") {
        controllers[hull].status = 1;
    }
}

/*
Returns are all the robots finished the cmds
*/
polling.ready = function() {
	for (var i = 1; i < controllers.length; i++) {
		if (controllers[i].status == 1)
			return false;
	}
	return true;
}
//##################
//REGION END
//##################
