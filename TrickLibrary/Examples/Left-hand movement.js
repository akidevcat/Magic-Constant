var main = function() {
	script.wait(10);

	odometriya.Start();
	while (true) {
		movementlib.iterate_lefthand(70, irLeftSensor, irRightSensor, 2.5, 0.1);
	}
}
