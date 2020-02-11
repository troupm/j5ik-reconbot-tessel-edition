"use strict";
const five = require("johnny-five");
const Tessel = require("tessel-io");
//const Blink = require('./blink/blink.js');

const board = new five.Board({
  io: new Tessel()
});

const ledLeft = new five.Led("L0");
const ledRight = new five.Led("L3");

board.on("ready", () => {
  // Johnny-Five's `Motors` collection class allows
  // us to control multiple motors at once.
  const lmotor = new five.Motor({ pins: { pwm: "a5", dir: "a4", cdir: "a3" } });
  const rmotor = new five.Motor({ pins: { pwm: "b5", dir: "b4", cdir: "b3" } });
  const motors = new five.Motors([
    // Left Motor
    lmotor,
    // Right Motor
    rmotor,
  ]);
  let rdirection = "forward"
  let speed = 0;
  let ltargetSpeed = 100;
  let rtargetSpeed = 50;
  let vector = [100, 50];
  let demoState = 1;

  function blinkLeft(interval, duration) {
    ledLeft.stop();
    ledLeft.blink(interval);
    setTimeout(() => { ledLeft.off }, duration);
  }
  function blinkRight(interval, duration) {
    ledRight.stop();
    ledRight.blink(interval);
    setTimeout(() => { ledRight.off }, duration);
  }

  rmotor.on("start", () => {
    blinkRight(900 - (rtargetSpeed * 3), 2000);
  });

  lmotor.on("start", () => {
    blinkLeft(900 - (ltargetSpeed * 3), 2000);
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
      navigate(100, 200, 3000);
    });
    board.wait(1000, () => {
      speed = 0;
      direction = direction === "reverse" ? "forward" : "reverse";
      console.log("Navigating...");
      //accelerate(5);
      navigate(100, 200, 3000);
    });
  }

  function flipDirection(thisDirection) {
    thisDirection = thisDirection === "reverse" ? "forward" : "reverse";
  }

  function stateToDirection(directionState) {
    switch (directionState) {
      case 0:
        return ["forward", "forward"];
      case 1:
        return ["forward", "reverse"];
      case 2:
        return ["reverse", "forward"];
      case 3:
        return ["reverse", "reverse"];
      case 4:
        return [null, "forward"];
      case 5:
        return ["forward", null];
      case 6:
        return [null, "reverse"];
      case 7:
        return ["reverse", null];
    }
  }

  function changeTargetSpeed([deltaL, deltaR]) {
    ltargetSpeed += deltaL;
    rtargetSpeed += deltaR;
    ltargetSpeed = ltargetSpeed > 255 ? 5 : ltargetSpeed;
    rtargetSpeed = rtargetSpeed > 255 ? 5 : rtargetSpeed;
  }

  function navigate(duration) {
    demoState = demoState == 7 ? 0 : demoState + 1;
    changeTargetSpeed([10, 20]);
    let directionVector = stateToDirection(demoState);
    console.log(`demoState:  ${demoState} Direction Vector: ${directionVector}`);
    let rdirection = directionVector[0];
    let ldirection = directionVector[1];
    console.log(`Running Navigate ${lspeed, rspeed, duration}`);
    let lspeed = ltargetSpeed;
    let rspeed = rtargetSpeed;
    console.log("Navigate checkpoint 2");
    console.log(`Navigating: Left ${ldirection} ${lspeed}, Right ${rdirection} ${rspeed}`);
    if (ldirection == null)
      lmotor.stop();
    else
      lmotor[ldirection](lspeed);
    if (rdirection == null)
      rmotor.stop();
    else
      rmotor[rdirection](rspeed);

    board.wait(duration, () => {
      navigate(2000)
    });
  }

  async function navigateAsync(duration) {

    return new Promise((resolve, error) => {
      navigate(duration);
      board.on('error', () => resolve(false));
      board.on('ready', () => resolve(true));
    });
  }

  navigate(2000);
  //flipMotorDirection();
});
