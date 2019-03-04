//Requires: Odometriya, Movementlib, TrikTaxi
//The maze is the 2017 one

var main = function() {
	trikTaxi.walls = ["3, 11", "10, 11", "18, 19", "16, 24", "26, 27", "27, 35", "39, 47", "40, 48", "53, 61"]
	var maze = [1, 1, 1, 1, 1, 1, 0, 1,
		    1, 0, 1, 1, 0, 1, 1, 1,
		    1, 1, 1, 1, 1, 1, 0, 1,
		    1, 0, 1, 1, 0, 1, 1, 1,
		    1, 1, 1, 1, 1, 1, 0, 1,
		    1, 0, 1, 0, 1, 1, 1, 1,
		    1, 1, 1, 1, 0, 1, 0, 1,
		    1, 0, 1, 1, 1, 1, 1, 1]
	path = trikTaxi.astar(63, 58, maze, 8, 8); //16 and 63 are the cell ids

	script.wait(10);
	
	odometriya.Start();
	
	movementlib.move_path(70, path, 8, 8, irLeftSensor, irRightSensor);
}
