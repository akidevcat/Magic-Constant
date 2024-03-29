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
var length = 40;

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
