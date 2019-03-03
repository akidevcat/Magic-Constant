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
