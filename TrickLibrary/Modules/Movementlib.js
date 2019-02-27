//##################
//REGION ODOMETRIYA MOVEMENT
//##################
//This code requiers:
//+ Odometriya module
//+ eLeft, eRight, pi, cpr, d, l

var movementlib = {}

movementlib.cellsize = 69
movementlib.kp = 2.5
movementlib.kd = 0.1
movementlib.correctiondelay = 1

/*
Angle - rad
*/
movementlib.rotate_encoders = function(speed, angle) {
	var lvar = {}
	lvar.initialAngle = odometriya.teta;
	if (angle > 0) {
		mLeft(-speed);
		mRight(speed);
	} else {
		mLeft(speed);
		mRight(-speed);
	}
	
	while (true) {
		if ((angle > 0 && (odometriya.teta - lvar.initialAngle) >= angle) || 
			(angle < 0 && (odometriya.teta - lvar.initialAngle) <= angle)) { break; }
		script.wait(1);
	}
	mLeft(0);
	mRight(0);
	odometriya.Reset();
}

/*
Distance - cm
*/
movementlib.move_encoders = function(speed, distance) {
	var lvar = {}
	lvar.initialDistance = odometriya.distance;
	mLeft(speed);
	mRight(speed);
	while (odometriya.distance - lvar.initialDistance < distance) {
		script.wait(1);
	}
	mLeft(0);
	mRight(0);
	odometriya.Reset();
}

/*
If distance is zero - moving until the end
*/
movementlib.move_correction = function(speed, distance, sLeft, sFront) {
	var lvar = {}
	lvar.perror = 0;
	while (sFront.read() > movementlib.cellsize / 2 - l / 2) {
		lvar.leftWallDistance = sLeft.read();
		lvar.error = lvar.leftWallDistance - movementlib.cellsize / 2;
		lvar.derative = (lvar.error - lvar.perror) / (movementlib.correctiondelay / 1000);
		lvar.correction = lvar.error * movementlib.kp + lvar.derative * movementlib.kd;
		mLeft(speed - lvar.correction);
		mRight(speed + lvar.correction);
		lvar.perror = lvar.error;
		script.wait(movementlib.correctiondelay);
	}
	mLeft(0);
	mRight(0);
}

/*
One left-hand movement iteration. Just call it inside a loop.
sLeft is the left sensor. sFront is the front sensor.
*/
movementlib.iterate_lefthand = function(speed, sLeft, sFront) {
	var lvar = {}
	lvar.leftWallExists = (sLeft.read() < 100);
	lvar.frontWallExists = (sFront.read() < 100);
	if (!lvar.leftWallExists) {
		movementlib.rotate_encoders(speed, pi / 2);
		movementlib.move_correction(speed, 0, sLeft, sFront);
		return;
	} else {
		if (lvar.frontWallExists) {
			movementlib.rotate_encoders(speed, -pi / 2);
			return;
		} else {
			movementlib.move_correction(speed, 0, sLeft, sFront);
			return;
		}
	}
}

//##################
//REGION END
//##################
