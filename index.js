import rpio from 'rpio';

import config from './config.json';

function test() {
  for (let i = 0; i < 6000; i++) {
    /* On for 1 second */
    rpio.write(16, 1);
    rpio.msleep(10);
    /* Off for half a second (500ms) */
    rpio.write(16, 0);
    rpio.msleep(10);
  }
}

function init() {
  config.controller.gpio.buttons.input.forEach((row) => {
    rpio.open(row, rpio.INPUT, rpio.PULL_UP);
  });

  config.controller.gpio.buttons.output.forEach((row) => {
    rpio.open(row, rpio.OUTPUT, rpio.LOW);
  });

  test();
}

init();
