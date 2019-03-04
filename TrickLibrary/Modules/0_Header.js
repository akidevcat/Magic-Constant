//Connection
var ipTrikMain = "192.168.77.001"
var ipTrik1 = "192.168.77.204"
var ipTrik2 = "192.168.77.226"

// Robot's settings
var pi = 3.141592653589793;
var d = 5.6 // wheels' diameter, cm
var l = 17.5 // Robot's base, cm
var degInRad = 180 / pi;
var cmtodeg = (pi*56)/3600;

// Motors
var mLeft = brick.motor(M4).setPower; // Default left motor in 2D simulator
var mRight = brick.motor(M3).setPower; // Default right motor in 2D simulator
var cpr = 360 // Encoder's count per round of wheel //372 mb
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
