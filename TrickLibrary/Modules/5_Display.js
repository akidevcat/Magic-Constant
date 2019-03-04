//##################
//REGION: TrikTaxi (Path Construction)
//##################
//This code requiers:
//-

var display.print = function(text, x, y) {
	if (x == undefined || y == undefined) {
		x = 10;
		y = 10;
	}
	brick.display().addLabel(text, x, y);
	brick.display().redraw();
}

//##################
//REGION END
//##################