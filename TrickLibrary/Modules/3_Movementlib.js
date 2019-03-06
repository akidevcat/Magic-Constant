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
movementlib.correctiondelay = 5
movementlib.sensorscorrectiondelay = 5
movementlib.updatedelay = 5

//Local variables (don't TOUCH111)
movementlib.flStop = 0
movementlib.mLeftValue = 0
movementlib.mRightValue = 0
movementlib.mTargetLeft = 0
movementlib.mTargetRight = 0
movementlib.lerp = 0.04

movementlib.update = function() {
	movementlib.mLeftValue = movementlib.mLeftValue + movementlib.lerp * movementlib.updatedelay * (movementlib.mTargetLeft - movementlib.mLeftValue);
	movementlib.mRightValue = movementlib.mRightValue + movementlib.lerp * movementlib.updatedelay * (movementlib.mTargetRight - movementlib.mRightValue);
	mLeft(movementlib.mLeftValue);
	mRight(movementlib.mRightValue);
}

//Call this on start
movementlib.start = function() {
	var updateTimer = script.timer(movementlib.updatedelay);
	updateTimer.timeout.connect(movementlib.update);
}

movementlib.mleft = function(vel) {
	if (!isNaN(vel))
		movementlib.mTargetLeft = vel;
}

movementlib.mright = function(vel) {
	if (!isNaN(vel))
		movementlib.mTargetRight = vel;
}

movementlib.mleftforce = function(vel) {
	if (!isNaN(vel)) {
		movementlib.mleft(vel);
		movementlib.mLeftValue = vel;
	}
}

movementlib.mrightforce = function(vel) {
	if (!isNaN(vel)) {
		movementlib.mright(vel);
		movementlib.mRightValue = vel;
	}
}

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
		movementlib.mleft(-speed);
		movementlib.mright(speed);
		//mLeft(-speed)
		//mRight(speed)
	} else {
		//mLeft(speed);
		//mRight(-speed);
		movementlib.mleft(speed);
		movementlib.mright(-speed);
	}
	
	while (true) {
		if ((angle > 0 && (odometriya.teta - lvar.initialAngle) >= angle) || 
			(angle < 0 && (odometriya.teta - lvar.initialAngle) <= angle)) { break; }
		if (movementlib.flStop) break;
		//var deltaAngle = (odometriya.teta - lvar.initialAngle) / angle;
		//var vel = Math.max(0.8, Math.min(deltaAngle, 1 - deltaAngle) * 2); //max in the middle
		//movementlib.mleft(speed);
		//movementlib.mright(-speed);
		script.wait(1);
	}
	//movementlib.mleft(0);
	//movementlib.mright(0);
	//mLeft(0);
	//mRight(0);
	movementlib.mleftforce(0);
	movementlib.mrightforce(0);
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
	movementlib.mleft(speed);
	movementlib.mright(speed);
	while (odometriya.distance - lvar.initialDistance < distance) {
		if (movementlib.flStop) break;
		script.wait(1);
	}
	movementlib.mleft(0);
	movementlib.mright(0);
}

movementlib.initCorrect = function(speed, sLeft, sRight, sFront) {
	var leftD = sLeft != undefined ? sLeft.read() : Infinity;
	var rightD = sRight != undefined ? sRight.read() : Infinity;
	var frontD = sFront != undefined ? sFront.read() : Infinity;
	var leftD = Math.min(leftD, length);
	var rightD = Math.min(rightD, length);
	var frontD = Math.min(frontD, length);
	var initD = Infinity;
	var sCorrector = undefined;
	if (leftD != length) {
		//Correct using the left one
		print("Left");
		initD = leftD;
		sCorrector = sLeft;
		
	} else if (frontD != length) {
		//Correct using the front one;
		print("Front");
		initD = frontD;
		sCorrector = sFront;
		
	} else if (rightD != length) {
		//Correct using the right one
		print("Right");
		initD = rightD;
		sCorrector = sRight;
		
	} else {
		return; 
	}
	
	var lastD = Infinity;
	
	while(sCorrector.read() <= lastD) {
		print("First: " + sCorrector.read());
		movementlib.mleft(speed);
		movementlib.mright(-speed);
		lastD = sCorrector.read();
		script.wait(30);
	}
	movementlib.mleftforce(0);
	movementlib.mrightforce(0);
	
	if (lastD >= initD) {
		lastD = Infinity;
		
		while(sCorrector.read() <= lastD) {
			print("Second: " + sCorrector.read());
			movementlib.mleft(-speed);
			movementlib.mright(speed);
			lastD = sCorrector.read();
			script.wait(30);
		}
	}
	
	movementlib.mleftforce(0);
	movementlib.mrightforce(0);
}

//TODO: ERROR HAS TO BE A DIFFERENCE BETWEEN THE MAIN LINE AND CONTROLLER'S POSITION
movementlib.move_correction = function(speed, distance, kp, kd) {
	var lvar = {}
	lvar.initX = odometriya.x;
	lvar.initY = odometriya.y;
	lvar.initT = odometriya.teta;
	lvar.initialDistance = odometriya.distance;
	lvar.lInitialDistance = odometriya.lDistance;
	lvar.rInitialDistance = odometriya.rDistance;
	lvar.integral = 0;
	//movementlib.mleft(speed);
	//movementlib.mright(speed);
	while (odometriya.distance - lvar.initialDistance < distance) {
		if (movementlib.flStop) break;
		lvar.dt =  movementlib.sensorscorrectiondelay / 1000;
		lvar.lDeltaD = lvar.lInitialDistance - odometriya.lDistance;
		lvar.rDeltaD = lvar.rInitialDistance - odometriya.rDistance;
		//lvar.error = lvar.rDeltaD - lvar.lDeltaD;
		lvar.y = odometriya.y - lvar.initY;
		lvar.x = odometriya.x - lvar.initX;
		//lvar.error = -Math.cos(lvar.initT) * (lvar.y - Math.tan(lvar.initT) * lvar.x);
		lvar.error = (lvar.initT - odometriya.teta);
		print(lvar.error);
		lvar.integral = lvar.integral + lvar.error * lvar.dt;
		lvar.derative = (lvar.error - lvar.perror) / lvar.dt;
		lvar.correction = lvar.error * kp + lvar.derative * kd;
		movementlib.mleft(speed - lvar.correction);
		movementlib.mright(speed + lvar.correction);
		lvar.perror = lvar.error;
		//print(lvar.error);
		script.wait(movementlib.correctiondelay);
	}
	movementlib.mleft(0);
	movementlib.mright(0);
}

/*
If distance is zero - moving until the end
*/
movementlib.move_correction_sensors = function(speed, distance, kp, kd, ki, sLeft, sRight, sFront) {
	var lvar = {}
	lvar.initialDistance = odometriya.distance;
	lvar.perror = 0;
	lvar.integral = 0;
	while ((distance == 0 && (sFront.read() + sensorOffsetFront > length / 2)) || (distance > 0 && odometriya.distance - lvar.initialDistance < distance)) {
		if (movementlib.flStop) break;
		lvar.dt =  movementlib.sensorscorrectiondelay / 1000;
		lvar.leftWallDistance = sLeft.read() + sensorOffsetLeft;
		lvar.leftWallDistance = Math.min(lvar.leftWallDistance, length);
		lvar.error = lvar.leftWallDistance - length / 2;
		lvar.integral = lvar.integral + lvar.error * lvar.dt;
		lvar.derative = (lvar.error - lvar.perror) / lvar.dt;
		lvar.correction = lvar.error * kp + lvar.derative * kd + ki * lvar.integral;
		movementlib.mleft(speed - lvar.correction);
		movementlib.mright(speed + lvar.correction);
		lvar.perror = lvar.error;
		script.wait(movementlib.sensorscorrectiondelay);
	}
	movementlib.mleft(0);
	movementlib.mright(0);
}

/*
If distance is zero - moving until the end
The same as before but it doesn't rotate the robot if the distance is higher than cellsize
(Useful for path movement)
*/
movementlib.move_semicorrection_sensors = function(speed, distance, kp, kd, ki, sLeft, sRight, sFront) {
	var lvar = {}
	lvar.initialDistance = odometriya.distance;
	lvar.perror = 0;
	lvar.integral = 0;
	while ((distance == 0 && (sFront.read() + sensorOffsetFront > length / 2)) || (distance > 0 && odometriya.distance - lvar.initialDistance < distance)) {
		if (movementlib.flStop) break;
		lvar.dt =  movementlib.sensorscorrectiondelay / 1000;
		lvar.leftWallDistance = sLeft.read() + sensorOffsetLeft;
		lvar.rightWallDistance = sRight.read() + sensorOffsetLeft;
		lvar.leftWallDistance = Math.min(lvar.leftWallDistance, length / 2);
		lvar.rightWallDistance = Math.min(lvar.rightWallDistance, length / 2);
		
		lvar.leftWallDistance = lvar.leftWallDistance <= lvar.rightWallDistance ? lvar.leftWallDistance : (length - lvar.rightWallDistance);
		
		lvar.error = lvar.leftWallDistance - length / 2;
		lvar.integral = lvar.integral + lvar.error * lvar.dt;
		lvar.derative = (lvar.error - lvar.perror) / lvar.dt;
		lvar.correction = lvar.error * kp + lvar.derative * kd + lvar.derative;
		if (lvar.leftWallDistance > length - (l / 2 + sensorOffsetLeft)) {
			lvar.correction = 0;
		}
		movementlib.mleft(speed - lvar.correction);
		movementlib.mright(speed + lvar.correction);
		lvar.perror = lvar.error;
		script.wait(movementlib.sensorscorrectiondelay);
	}
	movementlib.mleft(0);
	movementlib.mright(0);
}

/*
One left-hand movement iteration. Just call it inside a loop.
sLeft is the left sensor. sFront is the front sensor.
*/
movementlib.iterate_lefthand_state = 0

movementlib.iterate_lefthand = function(speed, sLeft, sRight, sFront, kp, kd, ki) {
	var lvar = {}
	lvar.leftWallExists = (sLeft.read() + sensorOffsetLeft < length);
	lvar.frontWallExists = (sFront.read() + sensorOffsetFront < length);
	if (!lvar.leftWallExists) {
		movementlib.rotate_encoders(speed, pi / 2);
		movementlib.move_correction_sensors(speed, 0, kp, kd, ki, sLeft, sRight, sFront);
		return;
	} else {
		if (lvar.frontWallExists) {
			movementlib.rotate_encoders(speed, -pi / 2);
			return;
		} else {
			movementlib.move_correction_sensors(speed, 0, kp, kd, ki, sLeft, sRight, sFront);
			return;
		}
	}
}

/*
Movement with known path.
path - array of cell indexes
sRight - can be undefined (if you don't have one)
*/
movementlib.move_path = function(speed, path, mazesizeX, mazesizeY, sLeft, sRight, sFront, kp, kd, ki) {
	if (kp == undefined)
		kp = 0.1
	if (kd == undefined)
		kd = 0.1
	if (ki == undefined)
		ki = 0.1
	var lvar = {}
	path = path.reverse();
	var initPos = trikTaxi.getPos(path[0], mazesizeX, mazesizeY);
	//TODO: ADD MOVEMENT TO THE START POS AND REMOVE THE CODE BELOW
	odometriya.x = initPos[0] * length;
	odometriya.y = -initPos[1] * length;
	for (i = 0; i < path.length - 1; i++) {
		//var curpos = trikTaxi.getPos(path[i], mazesizeX, mazesizeY);
		var curpos = [odometriya.x / length, odometriya.y / length];
		//print(curpos);
		var nextpos = trikTaxi.getPos(path[i + 1], mazesizeX, mazesizeY);
		nextpos[1] = -nextpos[1];
		var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
		var angle = Math.atan2(delta[1], delta[0]);
		//print(angle);
		var delta_angle = -odometriya.teta + angle;
		print(delta, " ", delta_angle, " ", angle);
		movementlib.rotate_encoders(speed * 0.8, delta_angle);
		//movementlib.move_semicorrection_sensors(speed, length, kp, kd, ki, sLeft, sRight, sFront);
		//movementlib.move_correction(speed, length, kp, kd, ki);
		movementlib.move_encoders(speed, length)
	}
}

//##################
//REGION END
//##################
