import rpio from 'rpio';

import config from './config.json';

function dec2bin(dec) {
  return Number(dec).toString(2).split('').reverse();
}

function test() {
  setInterval(() => {
    for (let collum = 0; collum <= 7; collum++) {
      const binary = dec2bin(collum);
      rpio.write(16, Number(binary[0]));
    }
  }, 100);
  // for (let i = 0; i < 6000; i++) {

  // }
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
