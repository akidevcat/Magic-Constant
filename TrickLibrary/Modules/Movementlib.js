//##################
//REGION ODOMETRIYA MOVEMENT
//##################
//This code requiers:
//+ Odometriya module
//+ eLeft, eRight, pi, cpr, d, l

var movementlib = {}

/*
Angle - rad
*/
movementlib.robot_rotate = function(speed, angle) {
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
movementlib.robot_move = function(speed, distance) {
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
//##################
//REGION END
//##################
