//Requires: Odometriya, Movementlib

var main = function() {
	script.wait(1000); //Sometimes I fail to understand trik

	odometriya.Start();
	while (true) {
		movementlib.iterate_lefthand(70, irLeftSensor, irRightSensor);
	}
}