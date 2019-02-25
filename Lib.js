// Robot's settings
var pi = 3.141592653589793;
var d = 5.6 // wheels' diameter, cm
var base = 17.5 // Robot's base, cm
var xRobot = 0 // Robot's x coord
var yRobot = 0 // Robot's y coord
var degInRad = 180 / pi;
var cmtodeg = (pi*56)/3600;

// Motors
var mLeft = brick.motor(M4).setPower; // Default left motor in 2D simulator
var mRight = brick.motor(M3).setPower; // Default right motor in 2D simulator
var cpr = 360 // Encoder's count per round of wheel
var cprToDeg = 360/cpr;

// Encoders
var eLeft = brick.encoder(E4); // Default left encoder in 2D simulator
var eRight = brick.encoder(E3); // Default right encoder in 2D simulator
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

// Distance counters
//var svFront = brick.sensor(A1).read;
//var svLeft = brick.sensor(A2).read;
//var svRight = brick.sensor(A2).read;

var sLeft = 0;
var sFront = 0;

var direction = 0; // Robot's direction in the world
var azimut = 0; // azimuth


var kp = 3; // proportionality movement coefficient
var kd = 1; // coefficient...
var u = 0; // dunno
var err = 0;// dunno
var err_old = 0;//dunno

var v = 15; // current velocity that is being given on motors
var dist = 36; // distance


//Gyroscope settings
var timeCalibrateRealRobot = 10000;
var timeCalibrate2DRobot = 2000;
var gyro = brick.gyroscope();
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

//Прямолинейное движение с энкодерами
/*
  ARGS:
      vel - Power are being given to left motor
	  len - Length computed to encoder units
		Idea:
			Power of right motor is recounting until
			encoders values won't be same;		
*/
function rightToLeftEncodersMovement (vel, len)
{
	eLeft.reset();
	eRight.reset();
	eLeftVal = 0;// Left encoder value
	eRightVal = 0; // Right encoder value
	mLeft(vel);
	while (eLeftVal < len)
	{
		eLeftVal = eLeft.read();
		eRightVal = eRight.read();
		mRight((eLeftVal - eRightVal)*kp+vel);
		script.wait(10);
	}
}

/*
  ARGS:
      vel - Power are being given to right motor
	  len - Length computed to encoder units
		Idea:
			Power of left motor is recounting until
			encoders values won't be same;		
*/
function leftToRightEncodersMovement (vel, len)
{
	eLeft.reset();
	eRight.reset();
	eLeftVal = 0;// Left encoder value
	eRightVal = 0; // Right encoder value
	mRight(vel);
	while (eLeftVal < len)
	{
		eLeftVal = eLeft.read();
		eRightVal = eRight.read();
		mLeft((eRightVal - eLeftVal)*kp+vel);
		script.wait(10);
	}
}

/*
  ARGS:
       vel - Power are being given to both motors
       len - Length computed to encoder units
	Idea:
	    Power of both motors is recounting until
	    encoders values won't be same;
*/
function wheelToWheelMovement (vel, len)
{
	eLeft.reset();
	eRight.reset();
	var eLeftVal = 0;
	var eRightVal = 0;
	while ( ((eLeftVal + eRightVal)/2) < len)
	{
		eLeftVal = eLeft.read();
		eRightVal = eRight.read();
		mLeft((eRightVal - eLeftVal)*kp + vel);
		mRight((eLeftVal - eRightVal)*kp + vel);
		script.wait(10);
	}	
}

/*
    ARGS:	
        vel - Power are being given to both motors
        len - Length computed to encoder units 
        Idea(Pos(+) and Cons(-)):
	      Both encoders synchronized with virtual wheel's counter
	Pos - It gives us opportunity to move more smoothly with lower velocity
		than previous movement functions but with some "jumps"
	Cons - With bigger velocity motors can't reach virtual wheel's speed
		and movement is gonna be shit 
*/
function VirtualWheelMovement (vel, len)
{
	eLeft.reset();
	eRight.reset();
	var eLeftVal = 0;
	var eRightVal = 0;
	var expected = 0;
	while (expected < len)
	{
		expected+=vel;
		eLeftVal = eLeft.read();
		eRightVal = eRight.read();
		mLeft((expected - eLeftVal)*kp);
		mRight((expected - eRightVal)*kp);
		script.wait(10);
	}
}

//Гироскопыч
/*
    ARGS:
        vel - Power are being given to both motors
        len - Length computed to encoder units 
	Idea:
	    1)If delta angle < 0, right wheel's velocity need to be increased;
	    2)If delta angle  > 0, left wheel's velocity need to be increased;
*/
function SimpleGyroMovement (vel, length)
{
	var z0 = gyro.read()[6]/1000;//Initial Robot's direction 
	var z = 0;
	var velLeft = 0;
	var velRight = 0;
	eLeft.reset();
	eRight.reset();
	var eR = eRight.read();
	var eL = eLeft.read();
	while( !((eR+eL)/2 < -length)  )
	{
		z = z0 - gyro.read()[6]/1000;
		if (z > 10) z = 10;
		if (z < -10) z = -10;
		velLeft = vel+kp*z;
		velRight = vel-kp*z;
		eR = eRight.read(); 
		eL = eLeft.read();
		mLeft(velLeft);
		mRight(velRight);
		script.wait(10);
	}	
}

/*
    ARGS:
        vel - Average velocity of virtual wheels
        len - Virtual wheels' mileage(пробег) average
	Idea:
	    Usage virtual encoders for each of drive wheels
*/
function VirtualWheelGyroMovement (vel, length)
{
	var k = 10;// Coefficient to control virtual wheels
	var kVelocity = 10;// Coefficient to control velocity. Bigger is BETTER !!!
	var z0 = gyro.read()[6]/1000;//Initial Robot's direction 
	var z = 0;
	var eLeftVirtual = 0;
	var eRightVirtual = 0;	
	eLeft.reset();
	eRight.reset();
	var e4 = eLeft.read();
	var e3 = eRight.read();	
	while( !((e3+e4)/2 < -length)  )
	{
		z = z0 - gyro.read()[6]/1000;
		if (z > 10) z = 10;
		if (z < -10) z = -10;
		eLeftVirtual += (vel-z/k);
		eRightVirtual += (vel+z/k);
		e4 = eLeft.read();
		e3 = eRight.read();
		velLeft = (eLeftVirtual - e4)/kVelocity;
		velRight = (eRightVirtual - e3)/kVelocity;
		mLeft(velLeft, false);
		mRight(velRight, false);
		script.wait(10);
	}	
}

//Turn left around axis of robot
function TurnGyro (speed,deg)
{
	var leftMotor = mLeft;
	var rightMotor = mRight;
	leftEncoder = eLeft;
	rightEncoder = eRight;
	leftEncoder.reset();
	rightEncoder.reset();
	var expected=0;
	var valLeftEncoder = leftEncoder.read();
	var valRightEncoder = rightEncoder.read();
	var a = brick.gyroscope().read()[6]/1000;
	while((a - brick.gyroscope().read()[6]/1000) < deg)
	{
		valLeftEncoder = leftEncoder.read();
		valRightEncoder = rightEncoder.read();
		expected += speed;
		leftMotor((-expected - valLeftEncoder) * 3);
		rightMotor((expected - valRightEncoder) * 3);
		script.wait(10);
	}
}


/*
	speed - better to pass 1 to function
	deg - what angle to turn 0 <= deg <= 175
	Idea: turn left with gyro with RIGHT wheel while left wheel doesn't rotate
*/
function TurnRightWheel (speed,deg)
{
	var right = mRight;
	var er = eRight;
	er.reset();
	var expected=0;
	var rd = er.read();
	var a = brick.gyroscope().read()[6]/1000;
	while((a-brick.gyroscope().read()[6]/1000 < deg))
	{
		rd = er.read();
		expected += speed;
		right((expected - rd) * 3);
		script.wait(10);
	}
}


/*
	speed - better to pass 1 to function
	deg - what angle to turn 0 <= deg <= 175
	Idea: turn right with gyro with LEFT wheel while right wheel doesn't rotate
*/
function TurnLeftWheel (speed, deg)
{
	var left = mLeft;
	var el= eLeft;
	el.reset();
	var expected = 0;
	var valLeftEnc = el.read();
	var angle = brick.gyroscope().read()[6]/1000;
	while(((angle - brick.gyroscope().read()[6]/1000) < deg))
	{
		valLeftEnc = el.read();
		expected += speed;
		left((expected - valLeftEnc) * 3);
		script.wait(10);
	}	
	
}

function ForwardWallMovement()
{
	var leftEncoderVirtualWheel = 0;
	
	var rightEncoderVirtualWheel = 0;
	
	var shiftVirtualWheel = 0;
	
	var valueRightEncoder = 0;
	
	var valueLeftEncoder = 0;
	
	var currentDistanceToWall = 0;
	
	var sensorDistanceAnswer = 0;
	
	var minDistanceToWall = 20;
	
	var k = 10;//Коэффициент (обратная величина) регулятора скорости
	var k1 = 2;//Коэффициент регулятора мощности
	
	eLeft.reset();
	eRight.reset();
	
	while( valueLeftEncoder + valueRightEncoder > -2000)
	{
		valueRightEncoder = eRight.read();
		valueLeftEncoder = eLeft.read();
		sensorDistanceAnswer = uzSensor.read();
		if (2 < sensorDistanceAnswer && sensorDistanceAnswer < 100) // the simplest filter for sensor
		{
			currentDistanceToWall = sensorDistanceAnswer;
		}
		shiftVirtualWheel = (currentDistanceToWall - minDistanceToWall) / k;
		
		leftEncoderVirtualWheel += (-5 - shiftVirtualWheel);
		
		rightEncoderVirtualWheel += (-5 + shiftVirtualWheel);
		
		mLeft( (leftEncoderVirtualWheel - valueLeftEncoder) * k1, false);
		
		mRight( (rightEncoderVirtualWheel - valueRightEncoder) * k1, false);
		
		script.wait(10);
	}	
}
