//##################
//REGION: ODOMETRIYA
//##################
/*
Usage:
Add 'Update' method inside a loop. while(true), for example.
Also, you have to call 'Reset' method when you're making a reset of the encoders
You can change 'deltat' to the loop delay value. For example: 
	while(true) { odometriya.Update(); script.wait(10); }
	> Change deltat to 10
*/
//This code requiers:
//+ eLeft, eRight, pi, cpr, d, l
var odometriya = {}

//These variables are based on the given task
//If they're known then you should update them here:
odometriya.x = 0
odometriya.y = 0
odometriya.distance = 0
odometriya.teta = 0 //90* = pi / 2; 180* = pi; 270* = 1.5 * pi; 360* = 2 * pi
//This is the delay between iterations inside the main loop (<Your MS Delay> / 1000)
//If this value is 0 then it'll be calculated automatically (!but less accurate!)
odometriya.deltat = 0 / 1000

//These are the local ones (don't edit them):
odometriya.lastrawleft = 0
odometriya.lastrawright = 0
odometriya.lasttime = Date.now()

odometriya.ResetLeft = function() {
	this.lastrawleft = 0
	this.lastrawright = eRight.read();
	eLeft.reset();
	this.lasttime = Date.now()
}

odometriya.ResetRight = function() {
	this.lastrawright = 0
	this.lastrawleft = eLeft.read();
	eRight.reset();
	this.lasttime = Date.now()
}

odometriya.Reset = function() {
	this.lastrawleft = 0
	this.lastrawright = 0
	eLeft.reset();
	eRight.reset();
	this.lasttime = Date.now()
}

odometriya.Update = function() {
	lvar = {}
	lvar.deltat = (Date.now() - this.lasttime) / 1000;
	
	if (lvar.deltat == 0) {
		return;
	}
	if (this.deltat > 0) {
		lvar.deltat = this.deltat;
	}
	
	lvar.rawleft = eLeft.readRawData();
	lvar.rawright = eRight.readRawData();
	
	lvar.deltaleft = lvar.rawleft - this.lastrawleft;
	lvar.deltaright = lvar.rawright - this.lastrawright;
	
	lvar.vleft = pi * d * (lvar.deltaleft / cpr) / lvar.deltat;
	lvar.vright = pi * d * (lvar.deltaright / cpr) / lvar.deltat;

	lvar.v = (lvar.vleft + lvar.vright) / 2;
	lvar.w = (lvar.vright - lvar.vleft) / l;
	
	lvar.deltateta = lvar.w * lvar.deltat;
	this.x += Math.cos((2 * this.teta + lvar.deltateta) / 2) * lvar.v * lvar.deltat;
	this.y += Math.sin((2 * this.teta + lvar.deltateta) / 2) * lvar.v * lvar.deltat;
	this.distance += Math.abs(lvar.v * lvar.deltat);
	this.teta += lvar.deltateta;
	
	//print("x: " + this.x); //<<<<<<< DEBUG TUUUT <<<<<<<<
	print("y: " + this.y);
	//print("teta: " + this.teta);
	
	this.lastrawleft = lvar.rawleft;
	this.lastrawright = lvar.rawright;
	this.lasttime = Date.now();
}

odometriya.Start = function() {
	lvar = {}
	lvar.updateTimer = script.timer(100);
	lvar.updateTimer.timeout.connect(odometriya.Update);
}
//##################
//REGION END
//##################
