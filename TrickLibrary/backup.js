//Controllers
var controllers = [{}, {}, {}]
controllers[0].name = "trik-67ae70"
controllers[1].name = "trik-f657a8"
controllers[2].name = "trik-52aee1"
controllers[0].ip = "192.168.77.1"
controllers[1].ip = "192.168.77.204"
controllers[2].ip = "192.168.77.226" 
/*
Status:
0 - finished
1 - executing
*/
controllers[0].status = 0 
controllers[1].status = 0
controllers[2].status = 0

// Robot's settings
var pi = 3.141592653589793;
var d = 8.4 // wheels' diameter, cm
var l = 19.5 // Robot's base, cm
var degInRad = 180 / pi;
var cmtodeg = (pi*56)/3600;

// Motors
var mLeft = brick.motor(M2).setPower; // Default left motor in 2D simulator
var mRight = brick.motor(M1).setPower; // Default right motor in 2D simulator
var cpr = 385 // Encoder's count per round of wheel //274 or 385
var cprToDeg = 360/cpr;

// Encoders
var eLeft = brick.encoder(E2); // Default left encoder in 2D simulator
var eRight = brick.encoder(E1); // Default right encoder in 2D simulator
eLeft.reset();
eRight.reset();

//Sensors
//var uzRightSensor = brick.sensor(D1);//Ультразвуковой
//var uzLeftSensor = brick.sensor(D2);//Ультразвуковой
//var irRightSensor = brick.sensor(A1);//Инфракрасный
//var irLeftSensor = brick.sensor(A2);//Инфракрасный
//var tRightSensor = brick.sensor(A3);//Касания
//var tLeftSensor = brick.sensor(A4);//Касания
//var lRightSensor = brick.sensor(A5);//Освещенности
//var lLeftSensor = brick.sensor(A6);//Освещенности


// Cell's parameters
var cellLength = 52.5 * cpr / (pi * d);
var length = 69;

//Gyroscope settings
var timeCalibrateRealRobot = 10000;
var timeCalibrate2DRobot = 2000;
// угловая скорость по x
//brick.gyroscope().read()[0]; 
// угловая скорость по y
//brick.gyroscope().read()[1];
// угловая скорость по z
//brick.gyroscope().read()[2];
//brick.gyroscope().read()[3]; // Valid time at gyroscope measurement
// угол рысканья в миллиградусах −180 000 до 180 000
//var az = brick.gyroscope().read()[6];
// угол тангажа в миллиградусах −180 000 до 180 000
//var ax = brick.gyroscope().read()[4];
// угол крена в миллиградусах −90 000 до 90 000
//var ay = brick.gyroscope().read()[5];
var gyro = brick.gyroscope;

//=====ARTAG CODE=====


/*
	How to use:
	    var artag_obj = new artag();
	    var code = artag_obj.get_code();
*/


var artag = function()
{
	var pic = [];
	var vertexes = {};
	var main_edges = [];
	var auxiliary_vertexes = {};
	var center;
	var result_matrix = [[], [], [], []];
	var squares = [[], [], [], []];

	var height = 120;
	var height_u = 116; // area of interest
	var width = 160;
	var width_u = 156; // area of interest



	function coords(x, y) // alternative of pair in c++
	{
		this.x = x;
		this.y = y;
	}

	function line(xf, yf, xs, ys) // int
	{
	    this.x1 = xf;
	    this.y1 = yf;
	    this.x2 = xs;
	    this.y2 = ys;
	    this.length = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2));
	    this.k = (this.y2 - this.y1) / (this.x2 - this.x1);
	    this.b = this.y1 - this.k * this.x1;
	    
	    this.calculate_y = function calculate_y(x) // int x
	    {
		return this.k * x + this.b;
	    }

	    this.get_point_on_line = function get_point_on_line(len) // double len
	    {
		var result = new coords();
		result.x = (len * (this.x2 - this.x1)) / this.length + this.x1;
		result.y = (len * (this.y2 - this.y1)) / this.length + this.y1;
		//print("len = ", len, "\n", "x2 = ", this.x2, "\n", "x1 = ", this.x1, "\n", "length = ", this.length, "\n",
		//   "res = ", (len * (this.x2 - this.x1)) / this.length + this.x1, "\n\n");
		
		return result; // coords(x, y)
	    }

	    this.get_intersection_point = function get_intersection_point(l) // with line l
	    {
		var result = new coords();
		result.x = (l.b - this.b) / (this.k - l.k);
		result.y = this.k * result.x + this.b;

		return  result; // coords(x, y)
	    }
	}

	function compareNumbers(a, b) { // comparator for ascending sorting of numbers
		return a - b;
	}


	//DEBUG FUNCTIONS


	function print_matrix(m)
	{
		var le = m.length;
		for(var i = 0; i < le; ++i)
		{
			print(m[i]);
		}
	}

	function matrix_to_file(m)
	{
		var s = "";
		for(var i = 0; i < height; ++i)
		{
			for(var j = 0; j < width; ++j)
			{
				s += m[i][j].toString();
			}
			s += "\n";
		}
		script.writeToFile("matrix.txt", s);
	}


	//END DEBUG FUNCTIONS


	var max = function(a, b, c) // max for 3 nums
	{
		var m = a;
		if(b > m)
		{
			m = b;
		}
		if(c > m)
		{
			m = c;
		}
		return m;
	}

	var get_r = function(rgb)
	{
		return (rgb&16711680) >> 16;
	}
	var get_g = function(rgb)
	{
		return (rgb&65280) >> 8;
	}
	var get_b = function(rgb)
	{
		return (rgb&255);
	}

	var get_median_value = function(h_mid, w_mid, color) // in square 3x3
	{
		var getter;
		var temp_list = [];
		switch(color)
		{
			case 'r':
				getter = get_r;
			case 'g':
				getter = get_g;
			case 'b':
				getter = get_b;
		}
		
		for(var h = h_mid - 1; h <= h_mid + 1; ++h)
		{
			for(var w = w_mid - 1; w <= w_mid + 1; ++w)
			{
				temp_list.push(getter(pic[h][w]));
			}
		}
		
		temp_list.sort(compareNumbers);
		return temp_list[4];
	}

	var rgb_to_bool = function(rgb)
	{		
		var r = get_r(rgb);
		var g = get_g(rgb);
		var b = get_b(rgb);
		
		var v = max(r, g, b); // the magic way for solution
		var threshold_grey = 255 / 6; // it's too
		
		if(v < threshold_grey)
		{
			return 1; // dark
		}
		else
		{
			return 0; // light
		}
	}

	var rgb_to_num = function(r, g, b) // merge channels to decimal number
	{
		return r * 256 * 256 + g * 256 + b;
	}

	var picture_processing = function() // var pic after that looks like 1-0 matrix
	{
		
		for(var h = 1; h < height - 1; ++h)
		{
			for(var w = 1; w < width - 1; ++w)
			{
				var r = get_median_value(h, w, 'r');
				var g = get_median_value(h, w, 'g');
				var b = get_median_value(h, w, 'b');
				var num = rgb_to_num(r, g, b);
				pic[h][w] = num;
			}
		}
		
		for(var h = 0; h < height; ++h)
		{
			for(var w = 0; w < width; ++w)
			{
				pic[h][w] = rgb_to_bool(pic[h][w]);
			}
		}
	}

	function alternative_search_of_vertexes()
	{
		var goto_flag = 0;
		
		// 1
		
		for(var i = 4; i < width_u; ++i)
		{
			for(var x = i, y = 4; x >= 4 && y < height_u; --x, ++y)
			{
				if(pic[y][x] == 1)
				{
					vertexes["x1"] = x;
					vertexes["y1"] = y;
					
					goto_flag = 1;
					break
				}
			}
			if(goto_flag == 1)
			{
				break;
			}
		}
		
		//2
		
		goto_flag = 0;
		
		for(var i = width_u - 1; i >= 4; --i)
		{
			for(var x = i, y = 4; x < width_u && y < height_u; ++x, ++y)
			{
				if(pic[y][x] == 1)
				{
					vertexes["x2"] = x;
					vertexes["y2"] = y;
					
					goto_flag = 1;
					break
				}
			}
			if(goto_flag == 1)
			{
				break;
			}
		}
		
		//3
		
		goto_flag = 0;
		
		for(var i = width_u - 1; i >= 4; --i)
		{
			for(var x = i, y = height_u - 1; x < width_u && y >= 4; ++x, --y)
			{
				if(pic[y][x] == 1)
				{
					vertexes["x3"] = x;
					vertexes["y3"] = y;
					
					goto_flag = 1;
					break
				}
			}
			if(goto_flag == 1)
			{
				break;
			}
		}
		
		//4
		
		goto_flag = 0;
		
		for(var i = 4; i < width_u; ++i)
		{
			for(var x = i, y = height_u - 1; x >= 4 && y >= 4; --x, --y)
			{
				if(pic[y][x] == 1)
				{
					vertexes["x4"] = x;
					vertexes["y4"] = y;
					
					goto_flag = 1;
					break
				}
			}
			if(goto_flag == 1)
			{
				break;
			}
		}
		
		return;
	}

	function find_all_coords() // shit
	{
		main_edges.push(new line(vertexes["x1"], vertexes["y1"], vertexes["x2"], vertexes["y2"]));
		main_edges.push(new line(vertexes["x2"], vertexes["y2"], vertexes["x3"], vertexes["y3"]));
		main_edges.push(new line(vertexes["x3"], vertexes["y3"], vertexes["x4"], vertexes["y4"]));	
		main_edges.push(new line(vertexes["x4"], vertexes["y4"], vertexes["x1"], vertexes["y1"]));
		
		var first_diag = new line(vertexes["x1"], vertexes["y1"], vertexes["x3"], vertexes["y3"]);
		var second_diag = new line(vertexes["x2"], vertexes["y2"], vertexes["x4"], vertexes["y4"]);
		
		center = first_diag.get_intersection_point(second_diag); // x, y
		
		auxiliary_vertexes["xy1"] = main_edges[0].get_point_on_line(Math.round(main_edges[0].length / 2));
		auxiliary_vertexes["xy2"] = main_edges[1].get_point_on_line(Math.round(main_edges[1].length / 2));
		auxiliary_vertexes["xy3"] = main_edges[2].get_point_on_line(Math.round(main_edges[2].length / 2));
		auxiliary_vertexes["xy4"] = main_edges[3].get_point_on_line(Math.round(main_edges[3].length / 2));
		return;
	}

	function add_first_square_to_matrix() // also shit
	{
		var first = new line(vertexes["x1"], vertexes["y1"], auxiliary_vertexes["xy1"].x, auxiliary_vertexes["xy1"].y);
		var second = new line(auxiliary_vertexes["xy1"].x, auxiliary_vertexes["xy1"].y, center.x, center.y);
		var third = new line(center.x, center.y, auxiliary_vertexes["xy4"].x, auxiliary_vertexes["xy4"].y);
		var fourth = new line(auxiliary_vertexes["xy4"].x, auxiliary_vertexes["xy4"].y, vertexes["x1"], vertexes["y1"]);
		
		var first_diag = new line(vertexes["x1"], vertexes["y1"], center.x, center.y);
		var second_diag = new line(auxiliary_vertexes["xy1"].x, auxiliary_vertexes["xy1"].y,
					auxiliary_vertexes["xy4"].x, auxiliary_vertexes["xy4"].y);
		
		var temp_center = first_diag.get_intersection_point(second_diag); // 1
		squares[0][0] = temp_center;
		
		var temp_something = second.get_point_on_line(second.length / 2); // fuck my imagination
		var temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[0][1] = temp_line.get_point_on_line(temp_line.length / 3); // 2
		
		temp_line = new line(center.x, center.y, temp_center.x, temp_center.y);
		squares[1][1] = temp_line.get_point_on_line(temp_line.length / 3); // 6
		
		temp_something = third.get_point_on_line(third.length / 2);
		temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[1][0] = temp_line.get_point_on_line(temp_line.length / 3); // 5
	}

	function add_second_square_to_matrix() // also shit
	{
		var first = new line(auxiliary_vertexes["xy1"].x, auxiliary_vertexes["xy1"].y, vertexes["x2"], vertexes["y2"]);
		var second = new line(vertexes["x2"], vertexes["y2"], auxiliary_vertexes["xy2"].x, auxiliary_vertexes["xy2"].y);
		var third = new line(auxiliary_vertexes["xy2"].x, auxiliary_vertexes["xy2"].y, center.x, center.y);
		var fourth = new line(center.x, center.y, auxiliary_vertexes["xy1"].x, auxiliary_vertexes["xy1"].y);
		
		var first_diag = new line(auxiliary_vertexes["xy1"].x, auxiliary_vertexes["xy1"].y,
					auxiliary_vertexes["xy2"].x, auxiliary_vertexes["xy2"].y);
		var second_diag = new line(vertexes["x2"], vertexes["y2"], center.x, center.y);
		
		var temp_center = first_diag.get_intersection_point(second_diag); // 4
		squares[0][3] = temp_center;
		
		var temp_something = fourth.get_point_on_line(fourth.length / 2); // fuck my imagination
		var temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[0][2] = temp_line.get_point_on_line(temp_line.length / 3); // 3
		
		temp_line = new line(center.x, center.y, temp_center.x, temp_center.y);
		squares[1][2] = temp_line.get_point_on_line(temp_line.length / 3); // 7
		
		temp_something = third.get_point_on_line(third.length / 2);
		temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[1][3] = temp_line.get_point_on_line(temp_line.length / 3); // 8
	}

	function add_third_square_to_matrix() // also shit
	{
		var first = new line(auxiliary_vertexes["xy4"].x, auxiliary_vertexes["xy4"].y, center.x, center.y);
		var second = new line(center.x, center.y, auxiliary_vertexes["xy3"].x, auxiliary_vertexes["xy3"].y);
		var third = new line(auxiliary_vertexes["xy3"].x, auxiliary_vertexes["xy3"].y, vertexes["x4"], vertexes["y4"]);
		var fourth = new line(vertexes["x4"], vertexes["y4"], auxiliary_vertexes["xy4"].x, auxiliary_vertexes["xy4"].y);
		
		var first_diag = new line(auxiliary_vertexes["xy4"].x, auxiliary_vertexes["xy4"].y,
					auxiliary_vertexes["xy3"].x, auxiliary_vertexes["xy3"].y);
		var second_diag = new line(center.x, center.y, vertexes["x4"], vertexes["y4"]);
		
		var temp_center = first_diag.get_intersection_point(second_diag); // 13
		squares[3][0] = temp_center;
		
		var temp_something = first.get_point_on_line(first.length / 2); // fuck my imagination
		var temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[2][0] = temp_line.get_point_on_line(temp_line.length / 3); // 9
		
		temp_line = new line(center.x, center.y, temp_center.x, temp_center.y);
		squares[2][1] = temp_line.get_point_on_line(temp_line.length / 3); // 10
		
		temp_something = second.get_point_on_line(second.length / 2);
		temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[3][1] = temp_line.get_point_on_line(temp_line.length / 3); // 14
	}

	function add_fourth_square_to_matrix() // also shit
	{
		var first = new line(center.x, center.y, auxiliary_vertexes["xy2"].x, auxiliary_vertexes["xy2"].y);
		var second = new line(auxiliary_vertexes["xy2"].x, auxiliary_vertexes["xy2"].y, vertexes["x3"], vertexes["y3"]);
		var third = new line(vertexes["x3"], vertexes["y3"], auxiliary_vertexes["xy3"].x, auxiliary_vertexes["xy3"].y);
		var fourth = new line(auxiliary_vertexes["xy3"].x, auxiliary_vertexes["xy3"].y, center.x, center.y);
		
		var first_diag = new line(center.x, center.y, vertexes["x3"], vertexes["y3"]);
		var second_diag = new line(auxiliary_vertexes["xy2"].x, auxiliary_vertexes["xy2"].y,
					auxiliary_vertexes["xy3"].x, auxiliary_vertexes["xy3"].y);
		
		var temp_center = first_diag.get_intersection_point(second_diag); // 16
		squares[3][3] = temp_center;
		
		var temp_something = first.get_point_on_line(first.length / 2); // fuck my imagination
		var temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[2][3] = temp_line.get_point_on_line(temp_line.length / 3); // 12
		
		temp_line = new line(center.x, center.y, temp_center.x, temp_center.y);
		squares[2][2] = temp_line.get_point_on_line(temp_line.length / 3); // 11
		
		temp_something = fourth.get_point_on_line(fourth.length / 2);
		temp_line = new line(temp_something.x, temp_something.y, temp_center.x, temp_center.y);
		squares[3][2] = temp_line.get_point_on_line(temp_line.length / 3); // 15
	}

	function matrix_coords_to_bool() // for known coords we're create result artag matrix
	{
		var now_x;
		var now_y;
		for(var i = 0; i < 4; ++i)
		{
			for(var j = 0; j < 4; ++j)
			{
				now_x = Math.round(squares[i][j].x);
				now_y = Math.round(squares[i][j].y);
				result_matrix[i][j] =  pic[now_y][now_x];
			}
		}
		
		return;
	}

	function artag_decode()
	{
		var n, x, y;
		if(result_matrix[0][0] == 0)
		{
			n = result_matrix[2][3] * 2 + result_matrix[2][1];
			x = result_matrix[2][0] * 4 + result_matrix[1][3] * 2 + result_matrix[1][1];
			y = result_matrix[1][0] * 4 + result_matrix[0][2] * 2 + result_matrix[0][1];
		}
		else if(result_matrix[0][3] == 0)
		{
			n = result_matrix[3][1] * 2 + result_matrix[1][1];
			x = result_matrix[0][1] * 4 + result_matrix[3][2] * 2 + result_matrix[1][2];
			y = result_matrix[0][2] * 4 + result_matrix[2][3] * 2 + result_matrix[1][3];
		}
		else if(result_matrix[3][0] == 0)
		{
			n = result_matrix[0][2] * 2 + result_matrix[2][2];
			x = result_matrix[3][2] * 4 + result_matrix[0][1] * 2 + result_matrix[2][1];
			y = result_matrix[3][1] * 4 + result_matrix[1][0] * 2 + result_matrix[2][0];
		}
		else if(result_matrix[3][3] == 0)
		{
			n = result_matrix[1][0] * 2 + result_matrix[1][2];
			x = result_matrix[1][3] * 4 + result_matrix[2][0] * 2 + result_matrix[2][2];
			y = result_matrix[2][3] * 4 + result_matrix[3][1] * 2 + result_matrix[3][2];
		}
		return [x, y, n];
	}

	this.get_code = function()
	{	
		var temp_pic = brick.getPhoto().toString().split(","); // TODO: check workability of getPhoto()
		
		for(var h = 0; h < height; ++h)
		{
			pic[h] = [];
			for(var w = 0; w < width; ++w)
			{
				pic[h][w] = parseInt(temp_pic[h * width + w], 10);
			}
		}	
		picture_processing();
		alternative_search_of_vertexes();
		find_all_coords();
		
		add_first_square_to_matrix();
		add_second_square_to_matrix();
		add_third_square_to_matrix();
		add_fourth_square_to_matrix();
		
		matrix_coords_to_bool();
		
		var res_numbers = artag_decode(); // [x, y, n]
		
		return res_numbers; // [x, y, n]
	}
}


//=====ARTAG CODE END=====


//##################
//REGION: ODOMETRIYA
//##################
/*
Usage:
Add 'Start' method when initializing.
Also, you have to call 'Reset' method when you're making a reset of the encoders
Or 'ResetRight' and 'ResetLeft' instead of 'eRight.reset' and 'eLeft.reset'
You can change 'deltat' according to the loop delay value. For example: 
	while(true) { odometriya.Update(); script.wait(10); }
	> Change deltat to 10
*/
//This code requiers:
//+ eLeft, eRight, pi, cpr, d, l
var odometriya = {}

//These variables are based on the given task
//If they're known then you should update them here:
odometriya.x = 0
odometriya.y = 0
odometriya.distance = 0
odometriya.teta = 0 //90* = pi / 2; 180* = pi; 270* = 1.5 * pi; 360* = 2 * pi
//This is the delay between iterations inside the main loop (<Your MS Delay> / 1000)
//If this value is 0 then it'll be calculated automatically (!but less accurate!)
odometriya.deltat = 0 / 1000
odometriya.updatedelay = 1

//These are the local ones (don't edit them):
odometriya.lastrawleft = 0
odometriya.lastrawright = 0
odometriya.lasttime = Date.now()

odometriya.ResetLeft = function() {
	odometriya.lastrawleft = 0
	odometriya.lastrawright = eRight.read();
	eLeft.reset();
	odometriya.lasttime = Date.now()
}

odometriya.ResetRight = function() {
	odometriya.lastrawright = 0
	odometriya.lastrawleft = eLeft.read();
	eRight.reset();
	odometriya.lasttime = Date.now()
}

odometriya.Reset = function() {
	odometriya.lastrawleft = 0
	odometriya.lastrawright = 0
	eLeft.reset();
	eRight.reset();
	odometriya.lasttime = Date.now()
}

odometriya.Update = function() {
	var lvar = {}
	lvar.deltat = (Date.now() - odometriya.lasttime) / 1000;

	if (lvar.deltat == 0) {
		return;
	}
	if (odometriya.deltat > 0) {
		lvar.deltat = odometriya.deltat;
	}
	
	lvar.rawleft = eLeft.read();
	lvar.rawright = eRight.read();
	
	lvar.deltaleft = lvar.rawleft - odometriya.lastrawleft;
	lvar.deltaright = lvar.rawright - odometriya.lastrawright;
	
	lvar.vleft = pi * d * (lvar.deltaleft / cpr) / lvar.deltat;
	lvar.vright = pi * d * (lvar.deltaright / cpr) / lvar.deltat;

	lvar.v = (lvar.vleft + lvar.vright) / 2;
	lvar.w = (lvar.vright - lvar.vleft) / l;
	
	lvar.deltateta = lvar.w * lvar.deltat;
	odometriya.x += Math.cos(odometriya.teta) * lvar.v * lvar.deltat;
	odometriya.y += Math.sin(odometriya.teta) * lvar.v * lvar.deltat;
	odometriya.distance += Math.abs(lvar.v * lvar.deltat);
	odometriya.teta += lvar.deltateta;
	
	
	//print("GyroTETA = " + (-brick.gyroscope().read()[6] * pi ) / 180000);//GYROSCOPE ANGLE(PblCKAHIE)
	//print("x: " + odometriya.x); //<<<<<<< DEBUG TUUUT <<<<<<<<
	//print("y: " + odometriya.y);
	//print("teta: " + odometriya.teta);
	//print("distance: " + odometriya.distance);
	//print("x_cell: " + Math.round(odometriya.x / length));
	//print("y_cell: " + Math.round(odometriya.y / length));
	//print("distance_cell: " + Math.round(odometriya.distance / length));
	
	odometriya.lastrawleft = lvar.rawleft;
	odometriya.lastrawright = lvar.rawright;
	odometriya.lasttime = Date.now();
}

odometriya.Start = function() {
	var lvar = {}
	lvar.updateTimer = script.timer(odometriya.updatedelay);
	lvar.updateTimer.timeout.connect(odometriya.Update);
}
//##################
//REGION END
//##################


//##################
//REGION ODOMETRIYA MOVEMENT
//##################
//This code requiers:
//+ Odometriya module
//+ eLeft, eRight, pi, cpr, d, l

var movementlib = {}

movementlib.cellsize = 69
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


//##################
//REGION: TrikTaxi (Path Construction)
//##################
//This code requiers:
//-
/*
Usage:
1) Create the maze matrix
2) Set trikTaxi.walls
3) Use A* (or something else but dunno why)
*/
var trikTaxi = {}

//Write walls here (between which cells walls are). PUT THEM IN ASCENDING ORDER! (x, y) where x < y
trikTaxi.walls = ["2, 3", "6, 7", "3, 11", "4, 12", "12, 13", "29, 37", "36, 37", "51, 59"]

trikTaxi.getPos = function (cell, xsize, ysize) {
    return [cell % xsize, Math.floor(cell/ysize)]
}

trikTaxi.getEuclideanDistance = function (cell1, cell2, xsize, ysize) {
    p1 = trikTaxi.getPos(cell1, xsize, ysize)
    p2 = trikTaxi.getPos(cell2, xsize, ysize)
    deltax2 = (p1[0] - p2[0])
    deltax2 *= deltax2
    deltay2 = (p1[1] - p2[1])
    deltay2 *= deltay2
    return Math.sqrt(deltax2 + deltay2)
}

trikTaxi.getManhattanDistance = function (cell1, cell2, xsize, ysize) {
    p1 = trikTaxi.getPos(cell1, xsize, ysize)
    p2 = trikTaxi.getPos(cell2, xsize, ysize)
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1])
}

trikTaxi.getNeighbors = function (cell, xsize, ysize) {
    result = []
    up = cell - xsize
    if (up >= 0 && up < xsize * ysize && trikTaxi.walls.indexOf(up + ", " + cell) == -1)
        result.push(up)
    right = cell + 1
    if (right % xsize == 0) {
        right = -1
    }
    if (right >= 0 && right < xsize * ysize && trikTaxi.walls.indexOf(cell + ", " + right) == -1)
        result.push(right)
    down = cell + xsize
    if (down >= 0 && down < xsize * ysize && trikTaxi.walls.indexOf(cell + ", " + down) == -1)
        result.push(down)
    left = cell - 1
    if (left % xsize == xsize - 1) {
        left = -1
    }
    if (left >= 0 && left < xsize * ysize && trikTaxi.walls.indexOf(left + ", " + cell) == -1)
        result.push(left)
    return result
}

trikTaxi.reconstructPath = function (start, end, tree) {
    path = []
    x = end
    while (x != start) {
        path.push(x)
        x = tree[x]
        if (x === undefined)
            return []
    }    
    path.push(start)
    return path
}

/*
Breadth First Search
start is int
end is int
maze is a binary array of cells
xsize, ysize are the maze sizes
*/
trikTaxi.bfs = function (start, end, maze, xsize, ysize) {
    open = [start]
    closed = []
    tree = new Array(xsize * ysize)
    while (open.length > 0) {
        x = open.pop();

        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] === undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i])
                }
            }
        }
    }
    return []
} 

/*
Depth First Search
start is int
end is int
maze is a binary array of cells
xsize, ysize are the maze sizes
*/
trikTaxi.dfs = function (start, end, maze, xsize, ysize) {
    open = [start]
    closed = []
    tree = new Array(xsize * ysize)
    while (open.length > 0) {
        x = open.pop();

        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] === undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i])
                    break;
                }
            }
        }
    }
}

/*
A*
start is int
end is int
maze is a binary array of cells
xsize, ysize are the maze sizes
*/
trikTaxi.astar = function (start, end, maze, xsize, ysize) {
    var lvar = {}
    lvar.open = [start]
    lvar.closed = []
    lvar.gscores = new Array(xsize * ysize)
    lvar.fscores = new Array(xsize * ysize)
    for (i = 0; i < xsize * ysize; i++) {
        lvar.gscores[i] = Infinity
        lvar.fscores[i] = Infinity
    }
    lvar.gscores[start] = 0
    lvar.fscores[start] = trikTaxi.getManhattanDistance(start, end, xsize, ysize)
    lvar.tree = new Array(xsize * ysize)
    while (lvar.open.length > 0) {
        lvar.x = lvar.open[lvar.open.length - 1]
        lvar.xi = lvar.open.length - 1
        for (i = 0; i < lvar.open.length; i++) {
            if (lvar.fscores[lvar.open[i]] < lvar.fscores[lvar.x]) {
                lvar.x = lvar.open[i]
                lvar.xi = i
            }
        }

        if (lvar.x == end) {
            return trikTaxi.reconstructPath(start, end, lvar.tree)
        }
        lvar.open.splice(lvar.xi, 1)
        lvar.closed.push(lvar.x)

        lvar.neighbors = trikTaxi.getNeighbors(lvar.x, xsize, ysize)
        
        for (i = 0; i < lvar.neighbors.length; i++) {
            lvar.y = lvar.neighbors[i]
            if (!maze[lvar.y] || lvar.closed.indexOf(lvar.y) > -1) {
                continue
            }
            
            lvar.tentativeg = lvar.gscores[lvar.x] + trikTaxi.getEuclideanDistance(lvar.x, lvar.y, xsize, ysize)

            if (lvar.open.indexOf(lvar.y) == -1) {
                lvar.open.push(lvar.y)
            } else if (lvar.tentativeg >= lvar.gscores[lvar.y]) {
                continue
            }
            lvar.tree[lvar.y] = lvar.x
            lvar.gscores[lvar.y] = lvar.tentativeg
            lvar.fscores[lvar.y] = lvar.gscores[lvar.y] + trikTaxi.getManhattanDistance(lvar.y, end, xsize, ysize)
        }
    }
    return []
}
//##################
//REGION END
//##################


//##################
//REGION: TrikTaxi (Path Construction)
//##################
//This code requiers:
//-

var display = {}

display.print = function(text, x, y) {
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

//##################
//REGION POLLING
//##################
//This code requiers:
//Header
var polling = {}

polling.refreshDelay = 100
//Local variables (Don't touch)
polling.log = [] //server-only


/*
Call this method on init. 
When the message recieved onMessageEvent will be called.
*/
polling.start = function() {
    /*
    polling.onMessageEvent = onMessageEvent;
    if (hullid != 0) //Main controller
        mailbox.connect(trikMain.ip);
	var updateTimer = script.timer(polling.refreshDelay);
    updateTimer.timeout.connect(polling.update);
    */
    //mailbox.newMessage.connect(function(sender, message) { print(message); });
    mailbox.newMessage.connect(polling.onMessage);
}

polling.send = function (hull, text) {
    if (text == "")
        return;
    mailbox.send(hull, text);
    if (hull == 0 && text[0] == "#") {
        controllers[sender].status = 1;
    }
}

//Local methods
/*
polling.update = function() {
    if (mailbox.hasMessage()) {
        var msg = mailbox.receive();
        if (msg.length > 0) {
            var packet = {};
            packet.time = Date.now();
            packet.msg = msg;
            packet.hullid = 
            if (msg[0] == "#") {
                eval(msg.slice(1, msg.length));
            } else {
                polling.onMessageEvent(msg);
            }
        }
    }
}*/
polling.onMessage = function (sender, msg) {
    print("Message received: CurrentHullId: " + mailbox.myHullNumber() + " From: " + sender);
    if (msg.length > 0) {
        if (mailbox.myHullNumber == 0) {
            var packet = {};
            packet.time = Date.now();
            packet.msg = msg;
            packet.hullid = sender;
            polling.log.push(packet);
        }
        if (msg[0] == "#") {
            var result = eval(msg.slice(1, msg.length));
            mailbox.send(0, "$" + result);
        }
        if (msg[0] == "$" && mailbox.myHullNumber() == 0) { //from client to server - cmd finished
            controllers[sender].status = 0;
            controllers[sender].callback = msg.slice(1, msg.length);
        }
    }
}
//##################
//REGION END
//##################



function gyro_move_forward(vel)
{
	var kp, kd, ki, kE, kG, P = 0, D = 0, I = 0, G = 0;
	kp = 1
	kd = 1
	ki = 0
	kG = 0
	var z0 = gyro().read()[6]/1000;//degrees
	var z = 0;
	delta_old = 0;
	print("INITIAL Z ANGLE = " + z0);
	while (true)
	{
		z = gyro().read()[6]/1000;//degrees
		print("Z ANGLE = " + z);
		delta_ang = z0 - z;
		print("DELTA ANGLE = " + delta_ang);
		P = kp * delta_ang;		
		D = (delta_ang - delta_old) * kd;
		I = delta_ang * ki;
		G = delta_ang * kG;
		print("P = " + P);
		print("D = " + D);
		print("I = " + I);
		print("G = " + G);
		
		mRight((vel + (P+D+I+G)) % 100);
		mLeft((vel - (P+D+I+G)) % 100);
		
		print("RIGHT = " + ((vel - (P+D+I+G)) % 100));
		print("LEFT = " + ((vel - (P+D+I+G)) % 100));
		script.wait(10);
		delta_old = delta_ang;
	}
	
	
}

var main = function()
{
	
	print("Initializing...");
	script.wait(1000);
	gyro().calibrate(10000);
	script.wait(11000);
	print("Initialized");
	
	//odometriya.Start();
	
	gyro_move_forward(100);
	
	return;
}
