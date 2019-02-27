//##################
//REGION: ODOMETRIYA
//##################
/*
Usage:
Add 'Start' method when initializing.
Also, you have to call 'Reset' method when you're making a reset of the encoders
Or 'ResetRight' and 'ResetRight' instead of 'eRight.reset' and 'eLeft.reset'
You can change 'deltat' according to the loop delay value. For example: 
	while(true) { odometriya.Update(); script.wait(10); }
	> Change deltat to 10
*/
//This code requiers:
//+ eLeft, eRight, pi, cpr, d, l, length(of cell, in pomoika studio is 69)
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
odometriya.updatedelay = 4

//These are the local ones (don't edit them):
odometriya.lastrawleft = 0
odometriya.lastrawright = 0
odometriya.lasttime = Date.now()

odometriya.ResetLeft = function() {
	odometriya.lastrawleft = 0
	odometriya.lastrawright = eRight.read();
	eLeft.reset();
	odometriya.lasttime = Date.now()
}

odometriya.ResetRight = function() {
	odometriya.lastrawright = 0
	odometriya.lastrawleft = eLeft.read();
	eRight.reset();
	odometriya.lasttime = Date.now()
}

odometriya.Reset = function() {
	odometriya.lastrawleft = 0
	odometriya.lastrawright = 0
	eLeft.reset();
	eRight.reset();
	odometriya.lasttime = Date.now()
}

odometriya.Update = function() {
	var lvar = {}
	lvar.deltat = (Date.now() - odometriya.lasttime) / 1000;

	if (lvar.deltat == 0) {
		return;
	}
	if (odometriya.deltat > 0) {
		lvar.deltat = odometriya.deltat;
	}
	
	lvar.rawleft = eLeft.readRawData();
	lvar.rawright = eRight.readRawData();
	
	lvar.deltaleft = lvar.rawleft - odometriya.lastrawleft;
	lvar.deltaright = lvar.rawright - odometriya.lastrawright;
	
	lvar.vleft = pi * d * (lvar.deltaleft / cpr) / lvar.deltat;
	lvar.vright = pi * d * (lvar.deltaright / cpr) / lvar.deltat;

	lvar.v = (lvar.vleft + lvar.vright) / 2;
	lvar.w = (lvar.vright - lvar.vleft) / l;
	
	lvar.deltateta = lvar.w * lvar.deltat;
	odometriya.x += Math.cos(odometriya.teta) * lvar.v * lvar.deltat;
	odometriya.y += Math.sin(odometriya.teta) * lvar.v * lvar.deltat;
	odometriya.distance += Math.abs(lvar.v * lvar.deltat);
	odometriya.teta += lvar.deltateta;
	
	//print("x: " + odometriya.x); //<<<<<<< DEBUG TUUUT <<<<<<<<
	//print("y: " + odometriya.y);
	//print("teta: " + odometriya.teta);
	//print("distance: " + odometriya.distance);
	//print("x_cell: " + Math.round(odometriya.x / length));
	//print("y_cell: " + Math.round(odometriya.y / length));
	//print("distance_cell: " + Math.round(odometriya.distance / length));
	
	odometriya.lastrawleft = lvar.rawleft;
	odometriya.lastrawright = lvar.rawright;
	odometriya.lasttime = Date.now();
}

odometriya.Start = function() {
	var lvar = {}
	lvar.updateTimer = script.timer(odometriya.updatedelay);
	lvar.updateTimer.timeout.connect(odometriya.Update);
}
//##################
//REGION END
//##################
