//Requires: Odometriya, Movementlib, TrikTaxi
//The maze is the 2017 one

var main = function() {
	trikTaxi.walls = ["2, 3", "6, 7", "3, 11", "4, 12", "12, 13", "29, 37", "36, 37", "51, 59"]
	var maze = [1, 1, 1, 1, 1, 1, 1, 1,
		    1, 0, 1, 1, 1, 1, 0, 1,
		    1, 1, 0, 1, 0, 1, 1, 1,
		    1, 1, 1, 1, 1, 1, 0, 1,
		    0, 1, 0, 1, 1, 1, 1, 1,
		    1, 1, 1, 1, 0, 1, 0, 1,
		    0, 1, 0, 1, 1, 1, 1, 1,
		    1, 1, 1, 1, 0, 1, 0, 1]
	path = trikTaxi.astar(16, 63, maze, 8, 8);

	script.wait(100)
	
	odometriya.Start();
	
	movementlib.move_path(70, path, 8, 8, irLeftSensor, irRightSensor);
}
