import rpio from 'rpio';

import config from './config.json';

function dec2bin(dec) {
  return Number(dec).toString(2).split('').reverse();
}

function test() {
  const vals = new Array(8);
  vals.fill(true, 0, 8);
  const vals2 = new Array(8);
  vals2.fill(true, 0, 8);
  // const prevAvlues = new Array(input.length);
  const prevAvlues = [];
  // prevAvlues.fill(vals, 0, input.length);
  prevAvlues.push(vals);
  prevAvlues.push(vals2);
  setInterval(() => {
    for (let collum = 0; collum <= 7; collum++) {
      const binary = dec2bin(collum);
      rpio.write(16, Number(binary[0]));
      rpio.write(18, Number(binary[1]) || 0);
      rpio.write(22, Number(binary[2]) || 0);
      rpio.msleep(10);
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
