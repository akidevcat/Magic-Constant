//##################
//REGION POLLING
//##################
//This code requiers:
//Header
var polling = {}

polling.refreshDelay = 100
//Local variables (Don't touch)
polling.log = [] //server-only


/*
Call this method on init. 
When the message recieved onMessageEvent will be called.
*/
polling.start = function() {
    /*
    polling.onMessageEvent = onMessageEvent;
    if (hullid != 0) //Main controller
        mailbox.connect(trikMain.ip);
	var updateTimer = script.timer(polling.refreshDelay);
    updateTimer.timeout.connect(polling.update);
    */
    //mailbox.newMessage.connect(function(sender, message) { print(message); });
    mailbox.newMessage.connect(polling.onMessage);
}

polling.send = function (hull, text) {
    if (text == "")
        return;
    mailbox.send(hull, text);
    if (hull == 0 && text[0] == "#") {
        controllers[sender].status = 1;
    }
}

//Local methods
/*
polling.update = function() {
    if (mailbox.hasMessage()) {
        var msg = mailbox.receive();
        if (msg.length > 0) {
            var packet = {};
            packet.time = Date.now();
            packet.msg = msg;
            packet.hullid = 
            if (msg[0] == "#") {
                eval(msg.slice(1, msg.length));
            } else {
                polling.onMessageEvent(msg);
            }
        }
    }
}*/
polling.onMessage = function (sender, msg) {
    print("Message received: CurrentHullId: " + mailbox.myHullNumber() + " From: " + sender);
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
//##################
//REGION END
//##################

polling.send(1, "#move_encoders(100, 69);");
polling.send(2, "#eLeft.read();");
while (controllers[1].status == 1 &&
       controllers[2].status == 1) {
           script.wait(1);
       }
print("finished! Controller 2 value: " + controllers[2].callback)