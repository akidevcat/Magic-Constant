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
		/* // first version
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
		*/
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
		print("vert: ", vertexes["x1"], " ", vertexes["y1"], "end_vert");
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

	function matrix_coords_to_bool() // we're create result artag matrix for known coords
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
		if(borders_is_clear())
		{
			full_area_alternative_search_of_vertexes();
			find_all_coords();
			
			add_first_square_to_matrix();
			add_second_square_to_matrix();
			add_third_square_to_matrix();
			add_fourth_square_to_matrix();
			
			matrix_coords_to_bool();
			
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