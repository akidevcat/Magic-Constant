//##################
//REGION: ODOMETRIYA
//##################
//This code requiers:
//eLeft, eRight, pi, cpr, d, l
var odometriya = {}

//These variables are based on the given task
//If they're known then you should update them here:
odometriya.x = 0
odometriya.y = 0
odometriya.teta = 0 //90* = pi / 2; 180* = pi; 270* = 1.5 * pi; 360* = 2 * pi
//This is the delay between iterations inside the main loop (<Your MS Delay> / 1000)
//If this value is 0 then it'll be calculated automatically (!but less accurate!)
odometriya.deltat = 0 / 1000

//These are the local ones (don't edit them):
odometriya.lastrawleft = 0
odometriya.lastrawright = 0
odometriya.lasttime = Date.now()

odometriya.Reset = function() {
	this.lastrawleft = 0
	this.lastrawright = 0
	this.lasttime = Date.now()
}

odometriya.Update = function() {
	deltat = (Date.now() - this.lasttime) / 1000;
	if (deltat == 0) {
		return;
	}
	if (this.deltat > 0) {
		deltat = this.deltat;
	}
	
	rawleft = eLeft.readRawData();
	rawright = eRight.readRawData();
	
	deltaleft = rawleft - this.lastrawleft;
	deltaright = rawright - this.lastrawright;
	
	vleft = pi * d * (deltaleft / cpr) / deltat;
	vright = pi * d * (deltaright / cpr) / deltat;

	v = (vright + vleft) / 2;
	w = (vright - vleft) / l;
	
	deltateta = w * deltat;
	this.x += Math.cos((2 * this.teta + deltateta) / 2) * v * deltat;
	this.y += Math.sin((2 * this.teta + deltateta) / 2) * v * deltat;
	this.teta += deltateta;
	this.teta = this.teta % (2 * pi);
	if (this.teta < 0) {
		this.teta = 2 * pi - this.teta;
	}
	
	//print("x: " + this.x); //<<<<<<< DEBUG TUUUT <<<<<<<<
	//print("y: " + this.y);
	//print("teta: " + this.teta);
	
	this.lastrawleft = rawleft;
	this.lastrawright = rawright;
	this.lasttime = Date.now();
}
//##################
//REGION END
//##################