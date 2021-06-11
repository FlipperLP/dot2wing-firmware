import rpio from 'rpio';

import config from '../config.json';

// eslint-disable-next-line import/no-cycle
import { setButton, setFader } from './maRemote';

const input = config.controller.gpio.buttons.input;

const output = config.controller.gpio.buttons.output;

function dec2bin(dec) {
  // eslint-disable-next-line no-bitwise
  return (dec >>> 0).toString(2).split('');
}

function sendButton(value, buttonIndex, buttonRow) {
  // TODO: Fix overflow with to 0 in the middle
  const key = `${buttonRow}0${9 - buttonIndex}`;
  setButton(value, key, 0);
}

function setBin(bin) {
  switch (bin) {
    case 0: return rpio.LOW;
    case 1: return rpio.HIGH;
    default: return rpio.LOW;
  }
}

function readPin(pin) {
  const newVal = rpio.read(pin);
  console.log(newVal);
  switch (newVal) {
    case 'high': return true;
    case 'low': return false;
    default: return null;
  }
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
      // output.forEach((pin, i) => );
      rpio.write(16);
      rpio.write(18, rpio.LOW);
      rpio.write(22, rpio.HIGH);
      rpio.msleep(10);
      // read value
      input.forEach((pin, row) => {
        const newVal = readPin(pin);
        // check difference
        if (prevAvlues[row][collum] !== newVal) {
          prevAvlues[row][collum] = newVal;
          sendButton(newVal, collum + 1, row + 1);
        }
      });
    }
  }, 100);
}

export function initGPIO() {
  if (!process.env.debug) rpio.init({ mock: config.controller.gpio.mock });
  // define gpio pins
  input.forEach((row) => {
    rpio.open(row, rpio.INPUT, rpio.PULL_UP);
  });
  output.forEach((row) => {
    rpio.open(row, rpio.OUTPUT);
  });
  // start loop
  checkNewButton();
}

export { initGPIO as default };
