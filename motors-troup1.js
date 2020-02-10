"use strict";
const five = require("johnny-five");
const Tessel = require("tessel-io");
//const Blink = require('./blink/blink.js');

const board = new five.Board({
  io: new Tessel()
});

const led = new five.Led("L2");

board.on("ready", () => {
  // Johnny-Five's `Motors` collection class allows
  // us to control multiple motors at once.
  const lmotor = new five.Motor({ pins: { pwm: "a5", dir: "a4", cdir: "a3" } });
  const rmotor = new five.Motor( { pins: { pwm: "b5", dir: "b4", cdir: "b3" } });
  const motors = new five.Motors([
    // Left Motor
    lmotor,
    // Right Motor
    rmotor,
  ]);
  let direction = "forward"
  let speed = 0;
  let ltargetSpeed = 0;
  let rtargetSpeed = 0;

function blink(interval, duration) {
  led.blink(interval);
  setTimeout(() => {led.off},duration);
}

rmotor.on("start", () => {    
  blink(300, 2000);
});

rmotor.on("start", () => {    
  blink(150, 2000);
});

  function accelerate(rate) {
    if (speed <= 255) {
      speed += rate;
      motors[direction](speed);
      board.wait(200, accelerate);
    } else {
      flipMotorDirection();
    }
  }

  function flipMotorDirection() {
    motors.brake();
    //motors.stop();
    board.wait(1000, () => {
      speed = 0;
      direction = direction === "reverse" ? "forward" : "reverse";
      //console.log('Running motors in ${direction} direction');
      //accelerate(5);
      navigate(100,200, 3000);
    });
    board.wait(1000, () => {
      speed = 0;
      direction = direction === "reverse" ? "forward" : "reverse";
      console.log("Navigating...");
      //accelerate(5);
      navigate(100,200, 3000);
    });
  }

  function navigate(lspeed, rspeed, duration) {
    console.log("Running Navigate ${lspeed, rspeed, duration}");
    lspeed = ltargetSpeed > 255 ? 255 : ltargetSpeed;
    console.log("Navigate checkpoint 1");
    rspeed = rtargetSpeed > 255 ? 255 : rtargetSpeed;
    lspeed = ltargetSpeed < -255 ? -255 : ltargetSpeed;
    rspeed = rtargetSpeed < -255 ? -255 : rtargetSpeed;
    console.log("Navigate checkpoint 2");
    //if (lspeed <= ltargetSpeed && rspeed <= rtargetSpeed) {
      lmotor[direction](lspeed);
      console.log("Navigate checkpoint 3 : lspeed");
      rmotor[direction](rspeed);
      console.log("Navigate checkpoint 4 : rspeed");
      board.wait(200);
      setTimeout(() => {
        console.log("Navigate checkpoint 5");
        board.wait(200);
        motors.stop;     
        //flipMotorDirection();
      },duration);
    //} 
  }

  navigate(100,200, 3000);
  //flipMotorDirection();
});
