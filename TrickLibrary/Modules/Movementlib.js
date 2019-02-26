//##################
//REGION ODOMETRIYA MOVEMENT
//##################
//This code requiers:
//+ Odometriya module
//+ eLeft, eRight, pi, cpr, d, l

var movementlib = {}

movementlib.loopDelay = 3 //Magic value. Changes accuracy slightly. (ms, default: 3-10)

/*
Angle - rad
*/
movementlib.robot_rotate = function(speed, angle) {
	initialAngle = odometriya.teta;
	if (angle > 0) {
		mLeft(speed);
		mRight(-speed);
	} else {
		mLeft(-speed);
		mRight(speed);
	}
	
	while (true) {
		odometriya.Update();
		if ((angle > 0 && (odometriya.teta - initialAngle) >= angle) || 
			(angle < 0 && (odometriya.teta - initialAngle) <= angle)) { break; }
		script.wait(this.loopDelay);
	}
	mLeft(0);
	mRight(0);
	odometriya.Reset();
}

/*
Distance - cm
*/
movementlib.robot_move = function(speed, distance) {
	initialDistance = odometriya.distance;
	mLeft(speed);
	mRight(speed);
	while (odometriya.distance - initialDistance < distance) {
		odometriya.Update();
		print(initialDistance);
		script.wait(this.loopDelay);
	}
	mLeft(0);
	mRight(0);
	odometriya.Reset();
}
//##################
//REGION END
//##################