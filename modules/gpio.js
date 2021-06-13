import rpio from 'rpio';

import config from '../config.json';

// eslint-disable-next-line import/no-cycle
import { setButton, setFader } from './maRemote';

const input = config.controller.gpio.buttons.input;

const output = config.controller.gpio.buttons.output;

function dec2bin(dec) {
  return Number(dec).toString(2).split('').reverse();
}

function sendButton(value, buttonIndex, buttonRow) {
  // TODO: Fix overflow with to 0 in the middle
  const key = `${buttonRow}0${9 - buttonIndex}`;
  console.log(key, value);
  setButton(value, key, 0);
}

function readPin(pin) {
  const newVal = rpio.read(pin);
  return !!newVal;
}

// check for new input
function checkNewButton() {
  const vals = new Array(8);
  vals.fill(false, 0, 8);
  const vals2 = new Array(8);
  vals2.fill(false, 0, 8);
  // const prevAvlues = new Array(input.length);
  const prevAvlues = [];
  // prevAvlues.fill(vals, 0, input.length);
  prevAvlues.push(vals);
  prevAvlues.push(vals2);
  setInterval(() => {
    for (let collum = 0; collum <= 7; collum++) {
      const binary = dec2bin(collum);
      output.forEach((pin, i) => rpio.write(pin, Number(binary[i]) || 0));
      rpio.msleep(config.controller.gpio.waitTilRead);
      // read value
      input.forEach((pin, row) => {
        // reverse input dues to button mapping
        const newVal = !readPin(pin);
        // check difference
        if (prevAvlues[row][collum] !== newVal) {
          prevAvlues[row][collum] = newVal;
          sendButton(newVal, collum + 1, row + 1);
        }
      });
    }
  }, config.controller.gpio.interval);
}

export function initGPIO() {
  // define gpio pins
  input.forEach((row) => rpio.open(row, rpio.INPUT, rpio.PULL_UP));
  output.forEach((row) => rpio.open(row, rpio.OUTPUT, rpio.LOW));
  // start loop
  checkNewButton();
}

export { initGPIO as default };
