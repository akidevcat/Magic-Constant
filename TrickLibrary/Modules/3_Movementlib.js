//##################
//REGION ODOMETRIYA MOVEMENT
//##################
//This code requiers:
//+ Odometriya module
//+ eLeft, eRight, pi, cpr, d, l

var movementlib = {}

movementlib.cellsize = 40
//kp recommended: = 2.5
//kd recommended: = 0.1
movementlib.correctiondelay = 10

//Local variables (don't TOUCH111)
movementlib.flStop = 0

/*
Stops all the movements
*/
movementlib.stop = function() {
	movementlib.flStop = 1;
}

movementlib.unfreeze = function() {
	movementlib.flStop = 0;
}

/*
Angle - rad
*/
movementlib.rotate_encoders = function(speed, angle) {
	var lvar = {}
	if (angle == 0) {
		return;
	}
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
		if (movementlib.flStop) break;
		script.wait(1);
	}
	mLeft(0);
	mRight(0);
}

/*
Angle - rad
*/
movementlib.rotate_absolute = function(speed, angle) {
	var lvar = {}
	if (angle == 0) {
		return;
	}
	lvar.delta_angle = -odometriya.teta + angle;
	movementlib.rotate_encoders(speed, delta_angle);
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
		if (movementlib.flStop) break;
		script.wait(1);
	}
	mLeft(0);
	mRight(0);
}

/*
If distance is zero - moving until the end
*/
movementlib.move_correction = function(speed, distance, kp, kd, sLeft, sFront) {
	var lvar = {}
	lvar.initialDistance = odometriya.distance;
	lvar.perror = 0;
	while ((distance == 0 && (sFront.read() > movementlib.cellsize / 2 - l / 2)) || (distance > 0 && odometriya.distance - lvar.initialDistance < distance)) {
		if (movementlib.flStop) break;
		lvar.leftWallDistance = sLeft.read();
		lvar.error = lvar.leftWallDistance - movementlib.cellsize / 2;
		lvar.derative = (lvar.error - lvar.perror) / (movementlib.correctiondelay / 1000);
		lvar.correction = lvar.error * kp + lvar.derative * kd;
		mLeft(speed - lvar.correction);
		mRight(speed + lvar.correction);
		lvar.perror = lvar.error;
		script.wait(movementlib.correctiondelay);
	}
	mLeft(0);
	mRight(0);
}

/*
If distance is zero - moving until the end
The same as before but it doesn't rotate the robot if the distance is higher than cellsize
(Useful for path movement)
*/
movementlib.move_semicorrection = function(speed, distance, kp, kd, sLeft, sFront) {
	var lvar = {}
	lvar.initialDistance = odometriya.distance;
	lvar.perror = 0;
	while ((distance == 0 && (sFront.read() > movementlib.cellsize / 2 - l / 2)) || (distance > 0 && odometriya.distance - lvar.initialDistance < distance)) {
		if (movementlib.flStop) break;
		lvar.leftWallDistance = sLeft.read();
		lvar.error = lvar.leftWallDistance - movementlib.cellsize / 2;
		lvar.derative = (lvar.error - lvar.perror) / (movementlib.correctiondelay / 1000);
		lvar.correction = lvar.error * kp + lvar.derative * kd;
		if (lvar.leftWallDistance > movementlib.cellsize) {
			lvar.correction = 0;
		}
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
movementlib.iterate_lefthand_state = 0

movementlib.iterate_lefthand = function(speed, sLeft, sFront, kp, kd) {
	var lvar = {}
	lvar.leftWallExists = (sLeft.read() < 100);
	lvar.frontWallExists = (sFront.read() < 100);
	if (!lvar.leftWallExists) {
		movementlib.rotate_encoders(speed, pi / 2);
		movementlib.move_correction(speed, 0, kp, kd, sLeft, sFront);
		return;
	} else {
		if (lvar.frontWallExists) {
			movementlib.rotate_encoders(speed, -pi / 2);
			return;
		} else {
			movementlib.move_correction(speed, 0, kp, kd, sLeft, sFront);
			return;
		}
	}
}

/*
Movement with known path.
path - array of cell indexes
sRight - can be undefined (if you don't have one)
*/
movementlib.move_path = function(speed, path, mazesizeX, mazesizeY, sLeft, sFront, sRight, kp, kd) {
	if (kp == undefined)
		kp = 0.1
	if (kd == undefined)
		kd = 0.1
	var lvar = {}
	path = path.reverse();
	for (i = 0; i < path.length - 1; i++) {
		var curpos = trikTaxi.getPos(path[i], mazesizeX, mazesizeY);
		var nextpos = trikTaxi.getPos(path[i + 1], mazesizeX, mazesizeY);
		var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
		var angle = Math.atan2(-delta[1], delta[0]);
		var delta_angle = -odometriya.teta + angle;
		movementlib.rotate_encoders(speed, delta_angle);
		movementlib.move_semicorrection(speed, movementlib.cellsize, kp, kd, irLeftSensor, irRightSensor);
	}
}

//##################
//REGION END
//##################
