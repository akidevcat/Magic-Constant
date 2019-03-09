//Controllers
var controllers = [{}, {}, {}]
controllers[0].name = "trik-52aee1"
controllers[1].name = "trik-f657a8"
controllers[2].name = "trik-67ae70"
controllers[0].ip = "192.168.77.1"
controllers[1].ip = "192.168.77.204"
controllers[2].ip = "192.168.77.221"
controllers[2].kp = 1.1;
controllers[2].kd = 0.5;
controllers[2].ki = 0;
controllers[0].cprl = 392;
controllers[0].cprr = 392;
controllers[1].cprl = 366;
controllers[1].cprr = 326;
controllers[2].cprl = 394;
controllers[2].cprr = 394; 
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
var sensorOffsetLeft = 7;
var sensorOffsetFront = 10;
var degInRad = 180 / pi;
var cmtodeg = (pi*56)/3600;

// Motors
var mLeft = brick.motor(M2).setPower; // Default left motor in 2D simulator
var mRight = brick.motor(M1).setPower; // Default right motor in 2D simulator
var mLeftGet = brick.motor(M2).power; // Default left motor in 2D simulator
var mRightGet = brick.motor(M1).power; // Default right motor in 2D simulator
var cpr = 392; // Encoder's count per round of wheel //350
var cpr0 = 392;
var cprToDeg = 360/cpr;
var kp2 = 1.1;
var kd2 = 0.5;
var ki2 = 0;

// Encoders
var eLeft = brick.encoder(E2); // Default left encoder in 2D simulator
var eRight = brick.encoder(E1); // Default right encoder in 2D simulator
eLeft.reset();
eRight.reset();

//Sensors
var uzFrontSensor = brick.sensor(D1);//??????????????
//var uzLeftSensor = brick.sensor(D2);//??????????????
var irRightSensor = brick.sensor(A1);//????????????
var irLeftSensor = brick.sensor(A2);//????????????
//var tRightSensor = brick.sensor(A3);//???????
//var tLeftSensor = brick.sensor(A4);//???????
//var lRightSensor = brick.sensor(A5);//????????????
//var lLeftSensor = brick.sensor(A6);//????????????


// Cell's parameters
var cellLength = 52.5 * cpr / (pi * d);
var length = 40;

//Gyroscope settings
var timeCalibrateRealRobot = 10000;
var timeCalibrate2DRobot = 2000;
// ??????? ???????? ?? x
//brick.gyroscope().read()[0]; 
// ??????? ???????? ?? y
//brick.gyroscope().read()[1];
// ??????? ???????? ?? z
//brick.gyroscope().read()[2];
//brick.gyroscope().read()[3]; // Valid time at gyroscope measurement
// ???? ???????? ? ????????????? -180 000 ?? 180 000
//var az = brick.gyroscope().read()[6];
// ???? ??????? ? ????????????? -180 000 ?? 180 000
//var ax = brick.gyroscope().read()[4];
// ???? ????? ? ????????????? -90 000 ?? 90 000
//var ay = brick.gyroscope().read()[5];






wait = script.wait;
sign = function(n) { return n > 0 ? 1 : n = 0 ? 0 : -1; }
sqr = function(n) { return n * n; }
sqrt = Math.sqrt;
min = function(a, b) { return a < b ? a : b; }
max = function(a, b) { return a > b ? a : b; }
abs = Math.abs;
sin = Math.sin;
cos = Math.cos;
round = Math.round;

//=====ARTAG CODE=====


/*
	How to use:
	    var artag_obj = new artag();
		
		while(true)
		{
			code = artag_obj.get_code();
			if(code != "repeat")
			{
				break;
			}
			*some movings*
		}
		*using of code*
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
		this.calculate_x = function calculate_x(y)
		{
			return (y - this.b) / this.k;
		}
		
		this.calculate_y = function calculate_y(x) // int x
	    {
			return this.k * x + this.b;
	    }
		
		this.calculate_b = function calculate_b(k)
		{
			return this.y1 - k * this.x1;
		}
		
		this.calculate_k = function calculate_k()
		{
			return (this.y2 - this.y1) / (this.x2 - this.x1);
		}
		
		this.calculate_length = function calculate_length()
		{
			return Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2));
		}
		
	    this.x1 = xf;
	    this.y1 = yf;
	    this.x2 = xs;
	    this.y2 = ys;
	    this.length = this.calculate_length();
	    this.k = this.calculate_k();
	    this.b = this.calculate_b(this.k);

	    this.get_point_on_line = function get_point_on_line(len) // double len
	    {
			var result = new coords();
			result.x = (len * (this.x2 - this.x1)) / this.length + this.x1;
			result.y = (len * (this.y2 - this.y1)) / this.length + this.y1;
			//print("get_point_on_line: \n", "len = ", len, "\n", "x2 = ", this.x2, "\n", "x1 = ", this.x1, "\n", "length = ", this.length, "\n",
			//   "res = ", (len * (this.x2 - this.x1)) / this.length + this.x1, "\n\n");
			
			return result; // coords(x, y)
	    }

	    this.get_intersection_point = function get_intersection_point(l) // with line l
	    {
			var result = new coords();
			result.x = (l.b - this.b) / (this.k - l.k);
			result.y = this.k * result.x + this.b;
			//print("get_intersection_point: \n", "l.b = ", l.b, "\n", "this.b = ", this.b, "\n", "l.k = ", l.k, "\n", "this.k = ", this.k, 
			//		"\nx: ", result.x, "\ny: ", result.y, "\n\n");
			return  result; // coords(x, y)
	    }
		
		this.get_parallel_line = function get_parallel_line(x1, y1)
		{
			var res_line = new line();
			res_line.x1 = x1;
			res_line.y1 = y1;
			res_line.k = this.k;
			res_line.b = res_line.calculate_b(res_line.k);
			//print("get_parallel_line: ")
			/*
			for(var key in res_line)
			{
				print(key, " ", res_line[key])
			}
			*/
			return res_line;
		}
	}

	function compareNumbers(a, b) { // comparator for ascending sorting of numbers
		return a - b;
	}


	//DEBUG FUNCTIONS


	function print_matrix(m)
	{
		//var le = m.length;
		//for(var i = 0; i < le; ++i)
		//{
		//	print(m[i]);
		//}
		var s = "";
		for(var i = 0; i < height; ++i)
		{
			for(var j = 0; j < width; ++j)
			{
				s += m[i][j].toString();
			}
			s += "\n";
		}
		print(s);
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

	var alternative_rgb_to_bool = function(rgb)
	{
		var r = get_r(rgb);
		var g = get_g(rgb);
		var b = get_b(rgb);
		
		var brightness_const = 120;
		
		
		if (r + g + b < brightness_const)
		{
			return 1; //dark
		}
		else
		{
			return 0; //light
		}
	}

	var alternative1_rgb_to_bool = function(rgb)
	{
		var r = get_r(rgb);
		var g = get_g(rgb);
		var b = get_b(rgb);
		
		
	}

	var picture_processing = function() // var pic after that looks like 1-0 matrix
	{
		 // first version
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
		/*
		// second version
		for(var h = 1; h < height - 1; ++h)
		{
			for(var w = 1; w < width - 1; ++w)
			{
				var r = get_r(pic[h][w]);
				var g = get_g(pic[h][w]);
				var b = get_b(pic[h][w]);
				var avg = (r + g + b) / 3;
				pic[h][w] = avg;
			}
		}
		*/
		
		for(var h = 0; h < height; ++h)
		{
			for(var w = 0; w < width; ++w)
			{
				pic[h][w] = rgb_to_bool(pic[h][w]);
			}
		}
	}
	
	var borders_is_clear = function()
	{
		for(var w = 3; w < width; ++w)
		{
			if(pic[0][w] == 1 || pic[height-1][w] == 1)
			{
				return 0;
			}
		}
		for(var h = 0; h < height; ++h)
		{
			if(pic[h][3] == 1 || pic[h][width-1] == 1)
			{
				return 0;
			}
		}
		return 1;
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
		if(goto_flag == 0)
		{
			print("bad");
			for(var i = 4; i < height_u; ++i)
			{
				for(var x = width_u, y = i; x >= 4 && y < height_u; --x, ++y)
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
		if(goto_flag == 0)
		{
			print("bad");
			for(var i = 4; i < height_u; ++i)
			{
				for(var x = 4, y = i; x < width_u && y < height_u; ++x, ++y)
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
		if(goto_flag == 0)
		{
			print("bad");
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
		if(goto_flag == 0)
		{
			print("bad");
		}
		
		print("vert: ", vertexes, "end_vert");
		return;
	}

function full_area_alternative_search_of_vertexes()
	{
		var goto_flag = 0;
		
		// 1
		
		for(var i = 3; i < width; ++i)
		{
			for(var x = i, y = 0; x >= 3 && y < height; --x, ++y)
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
		if(goto_flag == 0)
		{
			print("bad");
			return 0;
			for(var i = 0; i < height; ++i)
			{
				for(var x = width-1, y = i; x >= 3 && y < height; --x, ++y)
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
		}
		
		//2
		
		goto_flag = 0;
		
		for(var i = width - 1; i >= 3; --i)
		{
			for(var x = i, y = 3; x < width && y < height; ++x, ++y)
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
		if(goto_flag == 0)
		{
			print("bad");
			return 0;
			for(var i = 0; i < height; ++i)
			{
				for(var x = 3, y = i; x < width && y < height; ++x, ++y)
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
			
		}
		
		//3
		
		goto_flag = 0;
		
		for(var i = width - 1; i >= 3; --i)
		{
			for(var x = i, y = height - 1; x < width && y >= 0; ++x, --y)
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
		if(goto_flag == 0)
		{
			print("bad");
			return 0;
		}
		
		//4
		
		goto_flag = 0;
		
		for(var i = 3; i < width; ++i)
		{
			for(var x = i, y = height - 1; x >= 3 && y >= 0; --x, --y)
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
		if(goto_flag == 0)
		{
			print("bad");
			return 0;
		}
		
		print("vert: ", vertexes["x1"], " ", vertexes["y1"], "end_vert");
		return 1;
	}

	function get_startpoint_of_line(fp, x1, y1, x2, y2)
	{
		var res = new coords();
		var first_line = new line(fp.x, fp.y, x1, y1);
		var second_line = new line(fp.x, fp.y, x2, y2);
		if(first_line.length > second_line.length)
		{
			//print("f");
			res.x = x1;
			res.y = y1;
			return res;
		}
		else
		{
			//print("ff");
			res.x = x2;
			res.y = y2;
			return res;
		}
	}

	function get_sum_of_vectors(l1, l2) // line objs
	{
		var first_point = l1.get_intersection_point(l2);
		//print("1", " x: ", first_point.x, " y: ", first_point.y);
		
		var first_startpoint = get_startpoint_of_line(first_point, l1.x1, l1.y1, l1.x2, l1.y2);
		//print("2", " x: ", first_startpoint.x, " y: ", first_startpoint.y);
		var second_startpoint = get_startpoint_of_line(first_point, l2.x1, l2.y1, l2.x2, l2.y2);
		//print("3", " x: ", second_startpoint.x, " y: ", second_startpoint.y);
		
		
		var first_parallel_line = l1.get_parallel_line(second_startpoint.x, second_startpoint.y);
		
		for(var key in first_parallel_line)
		{
			print(key, " ", first_parallel_line[key]);
		}
		var second_parallel_line = l2.get_parallel_line(first_startpoint.x, first_startpoint.y);
		/*
		for(var key in second_parallel_line)
		{
			print(key, " ", second_parallel_line[key]);
		}
		*/
		var second_point = first_parallel_line.get_intersection_point(second_parallel_line);
		//print("4", " x: ",second_point.x, " y: ", second_point.y);
		
		var res_line = new line(first_point.x, first_point.y, second_point.x, second_point.y);
		return res_line;
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
	
	function find_all_coords_with_vectors()
	{
		main_edges.push(new line(vertexes["x1"], vertexes["y1"], vertexes["x2"], vertexes["y2"]));
		main_edges.push(new line(vertexes["x2"], vertexes["y2"], vertexes["x3"], vertexes["y3"]));
		main_edges.push(new line(vertexes["x3"], vertexes["y3"], vertexes["x4"], vertexes["y4"]));	
		main_edges.push(new line(vertexes["x4"], vertexes["y4"], vertexes["x1"], vertexes["y1"]));
		
		var first_diag = new line(vertexes["x1"], vertexes["y1"], vertexes["x3"], vertexes["y3"]);
		var second_diag = new line(vertexes["x2"], vertexes["y2"], vertexes["x4"], vertexes["y4"]);
		
		center = first_diag.get_intersection_point(second_diag); // x, y
		
		var first_main_vector = get_sum_of_vectors(main_edges[0], main_edges[2]);
		/*
		for(var key in first_main_vector)
		{
			print(key, " ", first_main_vector[key]);
		}
		*/
		var second_main_vector = get_sum_of_vectors(main_edges[1], main_edges[3]);
		
		auxiliary_vertexes["xy1"] = first_main_vector.get_intersection_point(main_edges[0]);
		auxiliary_vertexes["xy2"] = second_main_vector.get_intersection_point(main_edges[1]);
		auxiliary_vertexes["xy3"] = first_main_vector.get_intersection_point(main_edges[2]);
		auxiliary_vertexes["xy4"] = second_main_vector.get_intersection_point(main_edges[3]);
		/*
		for(var key in auxiliary_vertexes)
		{
			print(key, " ", auxiliary_vertexes[key].x, auxiliary_vertexes[key].y);
		}
		*/
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

	function artag_coords_to_bool() // we're create result artag matrix for known coords
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
				pic[now_y][now_x] = 2;
			}
		}
		
		return;
	}

	function artag_decode_old()
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
		else
		{
			return "not a number";
		}
		return [x, y, n];
	}
	
	function artag_decode()
	{
		print("result_matrix: ", result_matrix);
		// verify the number of checking bits
		
		var sum = 0;
		
		for(var i = 0; i < 4; i += 3)
		{
			for(var j = 0; j < 4; j += 3)
			{
				sum += result_matrix[i][j];
			}
		}
		if(sum != 3)
		{
			print("returned not a number");
			return "not a number";
		}
		print("sum: ", sum);
		
		// rotating result_matrix to base view
		
		var completed_matrix = [[], [], [], []];
		
		if(!result_matrix[3][0])
		{
			for(var y = 0; y < 4; ++y)
			{
				for(var x = 0; x < 4; ++x)
				{
					completed_matrix[3 - x][y] = result_matrix[y][x];
				}
			}
		}
		else if(!result_matrix[0][0])
		{
			for(var y = 0; y < 4; ++y)
			{
				for(var x = 0; x < 4; ++x)
				{
					completed_matrix[3 - y][3 - x] = result_matrix[y][x]; 
				}
			}
		}
		else if(!result_matrix[0][3])
		{
			for(var y = 0; y < 4; ++y)
			{
				for(var x = 0; x < 4; ++x)
				{
					completed_matrix[x][3 - y] = result_matrix[y][x]; 
				}
			}
		}
		else
		{
			completed_matrix = result_matrix;
		}
		print("completed_matrix: ", completed_matrix);
		
		
		// two dimensional completed_matrix to Hamming's code
		
		var hamm_code = [];
		
		for(var y = 0; y < 4; ++y)
		{
			for(var x = 0; x < 4; ++x)
			{
				if((x == 0 && y == 0) || (x == 0 && y == 3) || (x == 3 && y == 0) || (x == 3 && y == 3))
				{
					print("pass");
					continue;
				}
				hamm_code.push(completed_matrix[y][x]);
			}
		}
		print("hamm_code: ", hamm_code);
		
		// parity checking of bits
		
		// first 
		if(hamm_code[0] != (hamm_code[2] + hamm_code[4] + hamm_code[6] + hamm_code[8] + hamm_code[10]) % 2)
		{
			print("hamm_code returned not a number");
			return "not a number";
		}
		
		//second
		if(hamm_code[1] != (hamm_code[2] + hamm_code[5] + hamm_code[6] + hamm_code[9] + hamm_code[10]) % 2)
		{
			print("hamm_code returned not a number");
			return "not a number";
		}
		
		//fourth
		if(hamm_code[3] != (hamm_code[4] + hamm_code[5] + hamm_code[6] + hamm_code[11]) % 2)
		{
			print("hamm_code returned not a number");
			return "not a number";
		}
		
		//eighth
		if(hamm_code[7] != (hamm_code[8] + hamm_code[9] + hamm_code[10] + hamm_code[11]) % 2)
		{
			print("hamm_code returned not a number");
			return "not a number";
		}
		
		var n = hamm_code[2] * 2 + hamm_code[4];
		var x = hamm_code[5] * 4 + hamm_code[6] * 2 + hamm_code[8];
		var y = hamm_code[9] * 4 + hamm_code[10] * 2 + hamm_code[11];
		
		return [x, y, n];
	}

	this.get_code = function()
	{
		// video from camera to display below
		/*
		brick.configure("video2", "lineSensor");
		brick.lineSensor("video2").init(true);
		while(!brick.keys().wasPressed(KeysEnum.Up))
			script.wait(100);
		*/
		var temp_pic = getPhoto().toString().split(",");
		
		
		for(var h = 0; h < height; ++h)
		{
			pic[h] = [];
			for(var w = 0; w < width; ++w)
			{
				pic[h][w] = parseInt(temp_pic[h * width + w], 10);
			}
		}	
		picture_processing();
		if(borders_is_clear() && full_area_alternative_search_of_vertexes())
		{
			find_all_coords();
			
			add_first_square_to_matrix();
			add_second_square_to_matrix();
			add_third_square_to_matrix();
			add_fourth_square_to_matrix();
			
			artag_coords_to_bool();
			
			print_matrix(pic);
			
			var res_numbers = artag_decode(); // [x, y, n] or "not a number"
			
			return (res_numbers == "not a number" ? "repeat" : res_numbers);
		}
		else
		{
			print("borders isn't clear")
			print_matrix(pic);
			return "repeat";
		}
		
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
odometriya.lDistance = 0
odometriya.rDistance = 0
odometriya.teta = 0 //90* = pi / 2; 180* = pi; 270* = 1.5 * pi; 360* = 2 * pi
//This is the delay between iterations inside the main loop (<Your MS Delay> / 1000)
//If this value is 0 then it'll be calculated automatically (!but less accurate!)
odometriya.deltat = 10 / 1000
odometriya.updatedelay = 10

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
	
	//lvar.vleft = pi * d * (lvar.deltaleft / cpr) / lvar.deltat;
	//lvar.vright = pi * d * (lvar.deltaright / cpr) / lvar.deltat;
	lvar.vleft = pi * d * (lvar.deltaleft / cpr) / lvar.deltat;
	lvar.vright = pi * d * (lvar.deltaright / cpr) / lvar.deltat;
	
	lvar.v = (lvar.vleft + lvar.vright) / 2;
	lvar.w = (lvar.vright - lvar.vleft) / l;
	
	lvar.deltateta = lvar.w * lvar.deltat;
	odometriya.x += Math.cos(odometriya.teta) * lvar.v * lvar.deltat;
	odometriya.y += Math.sin(odometriya.teta) * lvar.v * lvar.deltat;
	odometriya.distance += Math.abs(lvar.v * lvar.deltat);
	odometriya.lDistance += Math.abs(lvar.vleft * lvar.deltat);
	odometriya.rDistance += Math.abs(lvar.vright * lvar.deltat);
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

movementlib.cellsize = 40
//kp recommended: = 2.5
//kd recommended: = 0.1
movementlib.correctiondelay = 5
movementlib.sensorscorrectiondelay = 50
//movementlib.correctionthreshold = length / 1.5; //for real

movementlib.correctionthreshold = length / 2; //for sim
movementlib.updatedelay = 5

//Local variables (don't TOUCH111)
movementlib.flStop = 0
movementlib.mLeftValue = 0
movementlib.mRightValue = 0
movementlib.mTargetLeft = 0
movementlib.mTargetRight = 0
movementlib.lerp = 0.1

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

movementlib.rotate_encoderssmooth = function(speed, angle) {
	var lvar = {}
	if (angle == 0) {
		return;
	}
	lvar.initialAngle = odometriya.teta;
	if (angle > 0) {
		lvar.initLeft = -speed;
		lvar.initRight = speed;
		//movementlib.mleft(-speed);
		//movementlib.mright(speed);
		//mLeft(-speed)
		//mRight(speed)
	} else {
		//mLeft(speed);
		//mRight(-speed);
		lvar.initLeft = speed;
		lvar.initRight = -speed;
		//movementlib.mleft(speed);
		//movementlib.mright(-speed);
	}
	
	while (true) {
		if ((angle > 0 && (odometriya.teta - lvar.initialAngle) >= angle) || 
			(angle < 0 && (odometriya.teta - lvar.initialAngle) <= angle)) { break; }
		if (movementlib.flStop) break;
		var progress = (odometriya.teta - lvar.initialAngle) / angle; //0 - 1
		var progressD = Math.min(progress, 1 - progress) * 1.7;
		var velPower = Math.max(progressD, 0.3);
		//print(velPower);
		movementlib.mleftforce(lvar.initLeft * velPower);
		movementlib.mrightforce(lvar.initRight * velPower);
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
	var delta_angle = -odometriya.teta + angle;
	movementlib.rotate_encoders(speed, delta_angle);
}

movementlib.look_at = function(speed, x, y) {
	var delta = [x - odometriya.x, y - odometriya.y];
	var delta_angle = -odometriya.teta + Math.atan2(delta[1], delta[0]);
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
		//print("Left");
		initD = leftD;
		sCorrector = sLeft;
		
	} else if (frontD != length) {
		//Correct using the front one;
		//print("Front");
		initD = frontD;
		sCorrector = sFront;
		
	} else if (rightD != length) {
		//Correct using the right one
		//print("Right");
		initD = rightD;
		sCorrector = sRight;
		
	} else {
		return; 
	}
	
	var lastD = Infinity;
	
	while(sCorrector.read() <= lastD) {
		//print("First: " + sCorrector.read());
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
			//print("Second: " + sCorrector.read());
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
		//print(lvar.error);
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
	while ((distance == 0 && (sFront.read() + sensorOffsetFront > length / 3)) || (distance > 0 && odometriya.distance - lvar.initialDistance < distance)) {
		if (movementlib.flStop) break;
		lvar.dt =  movementlib.sensorscorrectiondelay / 1000;
		lvar.leftWallDistance = sLeft.read() + sensorOffsetLeft;
		lvar.leftWallDistance = Math.min(lvar.leftWallDistance, movementlib.correctionthreshold);
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

movementlib.move_doublecorrection = function(speed, distance, kp, kd, ki, sLeft, sRight, sFront) {
	var lvar = {}
	lvar.initialDistance = odometriya.distance;
	lvar.initT = odometriya.teta;
	lvar.perror = 0;
	lvar.integral = 0;
	while ((distance == 0 && (sFront.read() + sensorOffsetFront > length / 2.35)) || (distance > 0 && odometriya.distance - lvar.initialDistance < distance)) {
		if (movementlib.flStop) break;
		if (sFront != undefined && sFront.read() + sensorOffsetFront < length / 2) break;
		lvar.dt =  movementlib.sensorscorrectiondelay / 1000;
		lvar.leftWallDistance = sLeft.read() + sensorOffsetLeft;
		lvar.rightWallDistance = sRight.read() + sensorOffsetLeft;
		lvar.leftWallDistance = Math.min(lvar.leftWallDistance, movementlib.correctionthreshold + sensorOffsetLeft);
		lvar.rightWallDistance = Math.min(lvar.rightWallDistance, movementlib.correctionthreshold + sensorOffsetLeft);
		lvar.leftWallExists = (lvar.leftWallDistance != movementlib.correctionthreshold + sensorOffsetLeft);
		lvar.rightWallExists = (lvar.rightWallDistance != movementlib.correctionthreshold + sensorOffsetLeft);
		
		//lvar.wallDistance = lvar.leftWallDistance <= lvar.rightWallDistance ? lvar.leftWallDistance : (length - lvar.rightWallDistance);
		lvar.wallDistance = 0;
		if (lvar.leftWallExists)
			lvar.wallDistance += lvar.leftWallDistance;
		if (lvar.rightWallExists) {
			if (lvar.wallDistance == 0) {
				lvar.wallDistance += (length - lvar.rightWallDistance);
			} else {
				lvar.wallDistance += (length - lvar.rightWallDistance);
				lvar.wallDistance /= 2;
			}
		}
		//print(lvar.leftWallDistance);
		//lvar.wallDistance = (lvar.leftWallDistance + length - lvar.rightWallDistance) / 2;
		
		//print("left: " + lvar.leftWallDistance, " right: " + lvar.rightWallDistance);
		//print("leftraw: " + sLeft.read(), " rightraw: " + sRight.read());
		
		//print(lvar.wallDistance + " " + lvar.leftWallDistance + " " + lvar.rightWallDistance);
		
		if (!lvar.leftWallExists && !lvar.rightWallExists) {
			//encoders correction
			//print("ENCODERS!");
			lvar.error = (lvar.initT - odometriya.teta);
		} else {
			//sensors correction
			//print("SENSORS!");
			lvar.error = lvar.wallDistance - length / 2;
		}
		//print(lvar.error);
		lvar.integral = lvar.integral + lvar.error * lvar.dt;
		lvar.derative = (lvar.error - lvar.perror) / lvar.dt;
		lvar.correction = lvar.error * kp + lvar.derative * kd + lvar.integral * ki;
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
		movementlib.rotate_encoderssmooth(speed, pi / 2);
		movementlib.move_correction_sensors(speed, 0, kp, kd, ki, sLeft, sRight, sFront);
		return;
	} else {
		if (lvar.frontWallExists) {
			movementlib.rotate_encoderssmooth(speed, -pi / 2);
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
	var result = "";
	
	path = path.reverse();
	
	
	var initPos = trikTaxi.getPos(path[0], mazesizeX, mazesizeY);
	//odometriya.x = initPos[0] * length;
	//odometriya.y = -initPos[1] * length;
	var lastTeta = odometriya.teta;
	//print(lastTeta);
	for (i = 0; i < path.length - 1; i++) {
		var curpos = trikTaxi.getPos(path[i], mazesizeX, mazesizeY);
		var nextpos = trikTaxi.getPos(path[i + 1], mazesizeX, mazesizeY);
		var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
		
		//delta[0] = -delta[0];
		//delta[1] = -delta[1];
		
		
		//delta[0] = -delta[0]
		//delta[1] = -delta[1]
		
		
		
		var angle = Math.atan2(-delta[1], delta[0]);
		var delta_angle = angle - lastTeta;
		
		
		if (delta_angle > pi)
			delta_angle = delta_angle - 2 * pi;
		else if (delta_angle < -pi)
			delta_angle = 2 * pi + delta_angle;
		
		switch (Math.round(delta_angle * 100) / 100) {
			case 1.57:
				result += "L";
				break;
			case -1.57:
				result += "R";
				break;
			case 3.14:
				result += "RR";
				break;
			case -3.14:
				result += "LL";
				break;
		}
		
		//print(delta, " ", delta_angle, " ", angle);
		result += "F";
		movementlib.rotate_encoderssmooth(speed, delta_angle);
		movementlib.move_doublecorrection(speed, length, kp, kd, ki, sLeft, sRight, sFront);
		//movementlib.move_semicorrection_sensors(speed, length, kp, kd, ki, sLeft, sRight, sFront);
		//movementlib.move_correction(speed, length, kp, kd, ki);
		//movementlib.move_encoders(speed, length)
		lastTeta = angle;
	}
	return result;
}

movementlib.move_pathcorrection = function(speed, path, mazesizeX, mazesizeY, sLeft, sRight, sFront, kp, kd, ki) {
	if (kp == undefined)
		kp = 0.1
	if (kd == undefined)
		kd = 0.1
	if (ki == undefined)
		ki = 0.1
	var lvar = {}
	path = path.reverse();
	var initPos = trikTaxi.getPos(path[0], mazesizeX, mazesizeY);
	odometriya.x = initPos[0] * length;
	odometriya.y = -initPos[1] * length;
	var lastTeta = odometriya.teta;
	var xline = undefined;
	var yline = undefined;
	for (i = 0; i < path.length - 1; i++) {
		var curpos = trikTaxi.getPos(path[i], mazesizeX, mazesizeY);
		var nextpos = trikTaxi.getPos(path[i + 1], mazesizeX, mazesizeY);
		xline = true;
		yline = true;
		var jlast = curpos;
		var jlastindex = i;
		for (var j = i + 1; j < path.length && (xline || yline); j++) {
			var jpos = trikTaxi.getPos(path[j], mazesizeX, mazesizeY);
			if (jpos[0] != jlast[0])
				xline = false;
			if (jpos[1] != jlast[1])
				yline = false;
			if (xline || yline) {
				jlast = jpos;
				jlastindex = j;
			}
		}
		nextpos = jlast;
		var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
		print(delta + " " + jlastindex + " " + jpos);
		var angle = Math.atan2(-delta[1], delta[0]);
		var delta_angle = angle - lastTeta;
		if (delta_angle > pi)
			delta_angle = delta_angle - 2 * pi;
		else if (delta_angle < -pi)
			delta_angle = 2 * pi + delta_angle;
		movementlib.rotate_encoderssmooth(speed, delta_angle);
		movementlib.move_doublecorrection(speed, length * (Math.abs(delta[0]) + Math.abs(delta[1])), kp, kd, ki, sLeft, sRight, sFront);
		lastTeta = angle;
		i = jlastindex - 1;
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
    var open = [start]
    var closed = []
    var tree = new Array(xsize * ysize)
    while (open.length > 0) {
        var x = open.shift();
        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            var neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] == undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i]);
                }
            }
        }
    }
    return []
} 

trikTaxi.fnilbfs = function (start, arr, maze, xsize, ysize) {
    var open = [start]
    var closed = []
    var tree = new Array(xsize * ysize)
    while (open.length > 0) {
        var x = open.shift();
        if (arr.indexOf(x) == -1) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            var neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] == undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i]);
                }
            }
        }
    }
    return []
} 

trikTaxi.magicbfs = function (start, end, maze, xsize, ysize, startRot) {
    var open = [start]
    var closed = []
    var tree = new Array(xsize * ysize)
	var rots = new Array(xsize * ysize)
	rots[start] = startRot;
    while (open.length > 0) {
        var x = open.shift();
        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            var neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
			for (i = 0; i < neighbors.length; i++) {
				
				var curpos = trikTaxi.getPos(x, xsize, ysize);
				var nextpos = trikTaxi.getPos(neighbors[i], xsize, ysize);
				var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
				var angle = Math.atan2(-delta[1], delta[0]);
				var dir = Math.round(angle / (2 * pi) * 4);
				if (dir == 4)
					dir = 0;
				
				if (dir == rots[x]) {
					open.push(neighbors[i]);
					rots[neighbors[i]] = dir;
				}
			}
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] == undefined)
                        tree[neighbors[i]] = x
					
					var curpos = trikTaxi.getPos(x, xsize, ysize);
					var nextpos = trikTaxi.getPos(neighbors[i], xsize, ysize);
					var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
					var angle = Math.atan2(-delta[1], delta[0]);
					var dir = Math.round(angle / (2 * pi) * 4);
					if (dir == 4)
						dir = 0;
					
                    open.push(neighbors[i]);
					rots[neighbors[i]] = dir;
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
    var open = [start]
    var closed = []
    var tree = new Array(xsize * ysize)
    while (open.length > 0) {
        var x = open.shift();
	//print(x);
        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            var neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] == undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i])
                    break;
                }
            }
        }
    }
	return [];
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

trikTaxi.parsePath = function(pth, xSize, ySize, startTeta) {
	var result = "";
	var lastTeta = startTeta;
	var path = pth.reverse();
	for (var i = 0; i < path.length - 1; i++) {
		var curpos = trikTaxi.getPos(path[i], xSize, ySize);
		var nextpos = trikTaxi.getPos(path[i + 1], xSize, ySize);
		var delta = [nextpos[0] - curpos[0], nextpos[1] - curpos[1]];
		var angle = Math.atan2(-delta[1], delta[0]);
		var sign = angle - lastTeta > 0 ? 1 : -1;
		//var delta_angle = Math.min(Math.abs(angle - lastTeta), 2 * pi - Math.abs(lastTeta - angle)) * sign;
		var delta_angle = angle - lastTeta;
		if (delta_angle > pi)
			delta_angle = delta_angle - 2 * pi;
		else if (delta_angle < -pi)
			delta_angle = 2 * pi + delta_angle;
		var rangle = Math.round(delta_angle * 100) / 100;
		switch (rangle) {
			case -1.57:
				result += "R";
				break;
			case 1.57:
				result += "L";
				break;
		}
		result += "F";
		lastTeta = angle;
	}
	//print(result);
	return result;
}
//##################
//REGION END
//##################

//##################
//REGION DISPLAY
//##################

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

//Local variables (Don't touch)
polling.log = [] //server-only TODO

polling.onMessage = function (sender, msg) {
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

/*
Call this method on init. 
When the message recieved onMessageEvent will be called.
*/
polling.start = function() {
	//if (mailbox.myHullNumber() != 0) //Main controller
        mailbox.connect(controllers[0].ip);
    mailbox.newMessage.connect(polling.onMessage);
}

/*
Call instead of mailbox.send();
*/
polling.send = function (hull, text) {
    if (text == "")
        return;
    mailbox.send(hull, text);
    if (mailbox.myHullNumber() == 0 && text[0] == "#") {
        controllers[hull].status = 1;
    }
}

/*
Returns are all the robots finished the cmds
*/
polling.ready = function() {
	for (var i = 1; i < controllers.length; i++) {
		if (controllers[i].status == 1)
			return false;
	}
	return true;
}
//##################
//REGION END
//##################

var rot2teta = function(startRot) {
	switch (startRot) {
		case 0:
			var startTeta = pi / 2;
			break;
		case 1:
			var startTeta = 0;
			break;
		case 2:
			var startTeta = 1.5 * pi;
			break;
		case 3:
			var startTeta = pi;
			break;
	}
	return startTeta;
}

var scantag = function(ang) {
	var artag_obj = new artag();
	var code = getARTagValue(getData());
	var i = 0;
	while(code[0] == -1)
	{
		code = getARTagValue(getData());
		if (ang > 0)
			movementlib.rotate_encoderssmooth(5, -pi / 80);
		else
			movementlib.rotate_encoderssmooth(5, pi / 80);
		script.wait(10);
		i++;
	}
	return code;
}

var main = function() {

   	trikTaxi.walls = ["3, 11", "10, 11", "15, 23", "18, 19", "16, 24", "26, 27", "27, 35", "39, 47", "40, 48", "53, 61"]
	var maze = [1, 1, 1, 1, 1, 1, 0, 1,
		    1, 0, 1, 1, 0, 1, 1, 1,
		    1, 1, 1, 1, 1, 1, 0, 1,
		    1, 0, 1, 1, 0, 1, 1, 1,
		    1, 1, 1, 1, 1, 1, 0, 1,
		    1, 0, 1, 0, 1, 1, 1, 1,
		    1, 1, 1, 1, 0, 1, 0, 1,
		    1, 0, 1, 1, 1, 1, 1, 1]
	script.wait(100);

	//var input = script.readAll("input.txt").toString();
	//var inputPos = input.split("\n")[0];
	//print(inputPos);
	//var arraw = input.split("\n")[1].substr(1);

	odometriya.Start();
	movementlib.start();
	
	//1 0 1
	//2 1 3
	//
	//
	//
	//
	var x = 7;
	var y = 7;
	var endx = 0;
	var endy = 0;
	var rot = 0;
	var arrot = 2;
	
	var cell0 = x + y * 8;
	var cell1 = endx + endy * 8;
	var startTeta = rot2teta(rot);

	odometriya.teta = startTeta;
	var path = trikTaxi.magicbfs(cell0, cell1, maze, 8, 8, startTeta / (2 * pi));
	movementlib.move_pathcorrection(70, path, 8, 8, irLeftSensor, irRightSensor, uzFrontSensor, 1, 0.85, 0);
	
	return;
	
	var delta_angle = rot2teta(arrot) - odometriya.teta;
	if (delta_angle > pi)
		delta_angle = delta_angle - 2 * pi;
	else if (delta_angle < -pi)
		delta_angle = 2 * pi + delta_angle;
	movementlib.rotate_encoderssmooth(30, delta_angle);
	movementlib.move_encoders(-10, 8);
	if (delta_angle > 0)
		movementlib.rotate_encoderssmooth(30, - pi / 2 * 0.8);
	else {
		movementlib.rotate_encoderssmooth(30, pi / 2 * 0.8);
		print("fdfd");
	}
	
	var code = scantag(delta_angle);
	display.print("(" + code[0] + "," + code[1] + ")" + code[2]);
	brick.playSound("Beep.wav");
	while (true)
		script.wait(100);
}

// –?????? ??????????€
height = 120, width = 160;

// «???? ????????€ ??????????? ? ???? ??????? ????? ? ??????
image = [];

// «??????€ ARTag ???????
values = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

// ¬????????€ ??????? ? ???????? (??€??????????)
// iMin, iMax ?????? ?????????????? ??€???
// jMin, jMax ?????? ???????????? ??€???
iMin = 0, iMax = 0, jMin = 0, jMax = 0;

// ¬????????€ ??????? ? ????????
// 
// 
k1Min = 0, k1Max = 0, k2Min = 0, k2Max = 0;

// ”??? ARTag ??????????€
iA = 0, jA = 0, iB = 0, jB = 0, iC = 0, jC = 0, iD = 0, jD = 0;

//file1 = "9.txt"
//file2 = "9.clue"

// ????????? ????????
function getData(raw) {
	if (raw == undefined)
		raw = getPhoto().toString();
	//print("------------")
	//print (raw[0]);
	//raw =  script.readAll("0.txt");
	raw = raw.split(",");
	
	
	//script.removeFile(file1)
	//script.writeToFile(file1, raw)
	
	script.wait(2000)
	for (i = 0; i < height; ++i) {
		image[i] = [];
		for (j = 0; j < width; ++j) {
			color = raw[i * width + j];
			// ????????? RGB ? grayscale
			image[i][j] = ((color & 0xff0000) >> 16) + ((color & 0xff00) >> 8) + (color & 0xff);
		}
	}
	// ??????? 
	for (i = 0; i < height; ++i) {
		for (j = 0; j < 4; j++){
			image[i][j] = 255 + 255 + 255;
		}
				
	}
	for (i = 0; i < width; ++i) {
		for (j = 0; j < 4; j++){
			image[j][i] = 255 + 255 + 255;
		}
				
	}
	
	// ‘??? ?? ???????? ????? (???? ?????? ?? ??????)
	for (i = height - 8; i < height; ++i) 
		for (j = 0; j < width; ++j)
			image[i][j] = 255 + 255 + 255;
}

// ?????????€ ??????????€, ???????????€ ??????? ??????????????
function binarization() {
	sum = 0;
	for (i = 0; i < height; ++i)
		for (j = 0; j < width; ++j)
			sum += image[i][j];
	mean = sum / height / width;
	for (i = 0; i < height; ++i)
		for (j = 0; j < width; ++j)
			image[i][j] = (4 * image[i][j] > mean ? 0 : 1);
}

// ¬???? ??????????€ ? ???????
// ????? ??????????? ? ??????????? ???????? ? Notepad++
function printImage() {
    for (i = 0; i < height; ++i) {
		str = "";
        for (j = 0; j < width; ++j)
			// ¬???? ????????? ???????
			// 0: ????? ???????
			// 1: ?????? ???????
			// 2-5: ???? ARTag ???????
			// 6: ???????? ?????
			str += ".#ABCD*"[image[i][j]] + " ";
        print(str);
    }
}

// ¬???? ??????????? ??????????€ ? ???????
function printSelectedImage() {
	for (i = iMin; i <= iMax; ++i) {
		str = "";
        for (j = jMin; j <= jMax; ++j)
			str += ".#ABCD*"[image[i][j]] + " ";
        print(str);
    }
}

// ????? ????? ARTag ???????
function getCorners() {
	iMin = 0, iMax = 0, jMin = 0, jMax = 0;
	k1Min = 0, k1Max = 0, k2Min = 0, k2Max = 0;
	iMin = height - 1, iMax = 0;
	jMin = width - 1, jMax = 0;
	k1Min = height + width, k1Max = 0;
	k2Min = height + width, k2Max = -width;
	for (i = 0; i < height; ++i)
		for (j = 0; j < width; ++j)
			if (image[i][j]) {
				iMin = min(iMin, i);
				iMax = max(iMax, i);
				jMin = min(jMin, j);
				jMax = max(jMax, j);
				k1Min = min(k1Min, i + j);
				k1Max = max(k1Max, i + j);
				k2Min = min(k2Min, i - j);
				k2Max = max(k2Max, i - j);
			}
	if (iMax - iMin < 35 || jMax - jMin < 35) {
		print("Error: ARTag is too small to read it\n");

		iA = 0, jA = 0;

		iB = 0, jB = width - 1;

		iC = height - 1, jC = width - 1;

		iD = height - 1, jD = 0;

		return;

	}
	//  ????????? ????? ???????? ??? ???????, ?? ? ?????????? ???????
	// ????? ??€ ??????????€ ???? ???????: ????? ??€??? / ??? ????????
	countOfWhite = 0;
	for (i = iMin; i <= iMax; ++i) {
		j = jMin;
		while (j <= jMax && !image[i][j])
			++j, ++countOfWhite;
		if (j < jMax) {
			j = jMax;
			while (j >= jMin && !image[i][j])
				--j, ++countOfWhite;
		}
	}
	// ˜??? ARTag ?????? ????????, ???? ???? ? ?????
	if (countOfWhite * 2 > (iMax - iMin + 1) * (jMax - jMin + 1)) {
		// Point A
		i1 = iMin, i2 = iMax;
		while (!image[i1][jMin]) ++i1;
		while (!image[i2][jMin]) --i2;
		iA = round((i1 + i2) / 2), jA = jMin;
		// Point B
		j1 = jMin, j2 = jMax;
		while (!image[iMin][j1]) ++j1;
		while (!image[iMin][j2]) --j2;
		iB = iMin, jB = round((j1 + j2) / 2);
		// Point C
		i1 = iMin, i2 = iMax;
		while (!image[i1][jMax]) ++i1;
		while (!image[i2][jMax]) --i2;
		iC = round((i1 + i2) / 2), jC = jMax;
		// Point D
		j1 = jMin, j2 = jMax;
		while (!image[iMax][j1]) ++j1;
		while (!image[iMax][j2]) --j2;
		iD = iMax, jD = round((j1 + j2) / 2);
	} else { // ˜??? ????? ??€??, ???? ???? ?? ????????€?
		// Point A
		i1 = iMin, i2 = k1Min - jMin;
		while (!image[i1][k1Min - i1]) ++i1;
		while (!image[i2][k1Min - i2]) --i2;
		iA = round((i1 + i2) / 2), jA = k1Min - iA;
		// Point B
		i1 = iMin, i2 = k2Min + jMax;
		while (!image[i1][i1 - k2Min]) ++i1;
		while (!image[i2][i2 - k2Min]) --i2;
		iB = round((i1 + i2) / 2), jB = iB - k2Min;
		// Point C
		i1 = k1Max - jMax, i2 = iMax;
		while (!image[i1][k1Max - i1]) ++i1;
		while (!image[i2][k1Max - i2]) --i2;
		iC = round((i1 + i2) / 2), jC = k1Max - iC;
		// Point D
		i1 = k2Max + jMin, i2 = iMax;
		while (!image[i1][i1 - k2Max]) ++i1;
		while (!image[i2][i1 - k2Max]) --i2;
		iD = round((i1 + i2) / 2), jD = iD - k2Max;
	}
	// –????????????????, ???? ?????? ????? ??????? ??????????? ? ???????, »??„˜ ?˜ ?”ƒ˜“ –???“?“? –?—???«??¬??»˜ „»—??
    // image[iA][jA] = 2;
    // image[iB][jB] = 3;
    // image[iC][jC] = 4;
    // image[iD][jD] = 5;
}

// 3 points and vector from 3th point
function intersect1(i1, j1, i2, j2, i3, j3, di, dj) {
	k1 = (i1 == i2 ? 1e6 : (j2 - j1) / (i2 - i1));
	b1 = j1 - k1 * i1;
	k2 = (i3 + di == i3 ? 1e6 : dj / di);
	b2 = j3 - k2 * i3;
	x3 = (b2 - b1) / (k1 - k2);
	y3 = k1 * x3 + b1;
	return [round(x3), round(y3)];
}

// 4 points
function intersect2(i1, j1, i2, j2, i3, j3, i4, j4) {
	k1 = (i1 == i2 ? 1e6 : (j2 - j1) / (i2 - i1));
	b1 = j1 - k1 * i1;
	k2 = (i3 == i4 ? 1e6 : (j4 - j3) / (i4 - i3));
	b2 = j3 - k2 * i3;
	i = (b2 - b1) / (k1 - k2);
	j = k1 * i + b1;
	return [round(i), round(j)];
}

// »??? ???????? ????? ARTag ??????? (?? ???, ?? ??? ????????, ??? ????? ???? ????? »????)
function findPoint(){
	A = [iA, jA];
	B = [iB, jB];
	C = [iC, jC];
	D = [iD, jD];

	AB = [B[0] - A[0], B[1] - A[1]];
	BC = [C[0] - B[0], C[1] - B[1]];
	DC = [C[0] - D[0], C[1] - D[1]];
	AD = [D[0] - A[0], D[1] - A[1]];

	O = intersect2(A[0], A[1], C[0], C[1], B[0], B[1], D[0], D[1]);
	
	E = intersect1(B[0], B[1], C[0], C[1], O[0], O[1], AB[0] + DC[0], AB[1] + DC[1]);
	K = intersect1(A[0], A[1], D[0], D[1], O[0], O[1], -AB[0] - DC[0], -AB[1] - DC[1]);
	L = intersect1(C[0], C[1], D[0], D[1], O[0], O[1], AD[0] + BC[0], AD[1] + BC[1]);
	M = intersect1(A[0], A[1], B[0], B[1], O[0], O[1], -AD[0] - BC[0], -AD[1] - BC[1]);
	
	W1 = intersect2(M[0], M[1], E[0], E[1], B[0], B[1], D[0], D[1]);
	W2 = intersect2(E[0], E[1], L[0], L[1], A[0], A[1], C[0], C[1]);
	W3 = intersect2(K[0], K[1], L[0], L[1], B[0], B[1], D[0], D[1]);
	W4 = intersect2(M[0], M[1], K[0], K[1], A[0], A[1], C[0], C[1]);
	
	H1 = intersect2(W1[0], W1[1], W2[0], W2[1], K[0], K[1], E[0], E[1]);
	H2 = intersect2(W2[0], W2[1], W3[0], W3[1], L[0], L[1], M[0], M[1]);
	H3 = intersect2(W3[0], W3[1], W4[0], W4[1], K[0], K[1], E[0], E[1]);
	H4 = intersect2(W4[0], W4[1], W1[0], W1[1], L[0], L[1], M[0], M[1]);
	
	Z1 = intersect2(O[0], O[1], W1[0], W1[1], H4[0], H4[1], H1[0], H1[1]);
	Z2 = intersect2(O[0], O[1], W2[0], W2[1], H1[0], H1[1], H2[0], H2[1]);
	Z3 = intersect2(O[0], O[1], W3[0], W3[1], H2[0], H2[1], H3[0], H3[1]);
	Z4 = intersect2(O[0], O[1], W4[0], W4[1], H3[0], H3[1], H4[0], H4[1]);
	
	T1 = intersect2(H4[0], H4[1], W1[0], W1[1], Z1[0], Z1[1], Z2[0], Z2[1]);
	T2 = intersect2(W1[0], W1[1], H1[0], H1[1], Z1[0], Z1[1], Z4[0], Z4[1]);	
	T3 = intersect2(H1[0], H1[1], W2[0], W2[1], Z2[0], Z2[1], Z3[0], Z3[1]);
	T4 = intersect2(W2[0], W2[1], H2[0], H2[1], Z2[0], Z2[1], Z1[0], Z1[1]);
	T5 = intersect2(H2[0], H2[1], W3[0], W3[1], Z3[0], Z3[1], Z4[0], Z4[1]);
	T6 = intersect2(W3[0], W3[1], H3[0], H3[1], Z3[0], Z3[1], Z2[0], Z2[1]);
	T7 = intersect2(H3[0], H3[1], W4[0], W4[1], Z4[0], Z4[1], Z1[0], Z1[1]);
	T8 = intersect2(W4[0], W4[1], H4[0], H4[1], Z4[0], Z4[1], Z3[0], Z3[1]);
	
	
	values[0][0] = image[W4[0]][W4[1]];
	values[0][1] = image[T8[0]][T8[1]];
	values[0][2] = image[T1[0]][T1[1]];
	values[0][3] = image[W1[0]][W1[1]];
	values[1][0] = image[T7[0]][T7[1]];
	values[1][1] = image[Z4[0]][Z4[1]];
	values[1][2] = image[Z1[0]][Z1[1]];
	values[1][3] = image[T2[0]][T2[1]];
	values[2][0] = image[T6[0]][T6[1]];
	values[2][1] = image[Z3[0]][Z3[1]];
	values[2][2] = image[Z2[0]][Z2[1]];
	values[2][3] = image[T3[0]][T3[1]];
	values[3][0] = image[W3[0]][W3[1]];
	values[3][1] = image[T5[0]][T5[1]];
	values[3][2] = image[T4[0]][T4[1]];
	values[3][3] = image[W2[0]][W2[1]];
	
	image[H1[0]][H1[1]] = 6;
	image[W1[0]][W1[1]] = 6;
	image[W2[0]][W2[1]] = 6;
	image[H4[0]][H4[1]] = 6;
	image[O[0]][O[1]] = 6;
	image[H2[0]][H2[1]] = 6;
	image[W4[0]][W4[1]] = 6;
	image[H3[0]][H3[1]] = 6;
	image[W3[0]][W3[1]] = 6;
	image[T1[0]][T1[1]] = 6;
	image[T2[0]][T2[1]] = 6;
	image[T3[0]][T3[1]] = 6;
	image[T4[0]][T4[1]] = 6;
	image[T5[0]][T5[1]] = 6;
	image[T6[0]][T6[1]] = 6;
	image[T7[0]][T7[1]] = 6;
	image[T8[0]][T8[1]] = 6;
	image[Z1[0]][Z1[1]] = 6;
	image[Z2[0]][Z2[1]] = 6;
	image[Z3[0]][Z3[1]] = 6;
	image[Z4[0]][Z4[1]] = 6;


}

function rotate_clockwise(times){
	for (i = 0; i < times; i = i + 1){
		values_temp = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
		for (j = 0; j < 4; j = j + 1){
			for (z = 0; z < 4; z = z + 1){
				values_temp[z][3-j] = values[j][z]
			}
		}
		values = values_temp;
	}
}

// ¬????????? ???????? ARTag 
function getARTagValue(raw) {
	getData(raw);
	binarization();
	//printImage();
	getCorners();
	findPoint();
	//printImage();
	X = -1; Y = -1; NUM = -1;
	if (values[0][0] == 0 && values[0][3] == 1 && values[3][3] == 1 && values[3][0] == 1){
		rotate_clockwise(2);
	}
	else if (values[0][3] == 0 && values[0][0] == 1 && values[3][3] == 1 && values[3][0] == 1){
		rotate_clockwise(1);
	}
	else if (values[3][3] == 0 && values[0][3] == 1 && values[0][0] == 1 && values[3][0] == 1){
	}
	else if (values[3][0] == 0 && values[0][3] == 1 && values[3][3] == 1 && values[0][0] == 1){
		rotate_clockwise(3)
	}
	else{
		print("Error: Incorrect ARTag\n");
		return [X, Y, NUM];
	}
	X = values[1][3] * 4 + values[2][0] * 2 + values[2][2];
	Y = values[2][3] * 4 + values[3][1] * 2 + values[3][2];
	NUM = values[1][0] * 2 + values[1][2];
	string = "" + X + " " + Y + " " + NUM;
	
	// brick.display().addLabel(string,10,10);	
	return [X, Y, NUM];
}
