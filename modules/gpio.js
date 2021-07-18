import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

import config from '../config.json';

// eslint-disable-next-line import/no-cycle
import { setButton, setFader } from './maRemote';

const input = config.controller.gpio.buttons.input;

const output = config.controller.gpio.buttons.output;

let oled;

function dec2bin(dec) {
  return Number(dec).toString(2).split('').reverse();
}

function sendButton(value, buttonIndex, buttonRow) {
  // TODO: Fix overflow with to 0 in the middle
  let buttonId = 0;
  let key = `${buttonRow}0${9 - buttonIndex}`;
  if (buttonRow > 2) key = 9 - buttonIndex;
  if (buttonRow === 4) buttonId = 1;
  setButton(value, key, buttonId);
}

function readPin(pin) {
  const newVal = rpio.read(pin);
  return !!newVal;
}

// check for new input
function checkNewButton() {
  // set ADC config
  // eslint-disable-next-line no-buffer-constructor
  const ADCWrite = new Buffer([0x80]);
  // eslint-disable-next-line no-buffer-constructor
  const ADCRead = new Buffer(2);

  // create array for fader values
  const faderVals = new Array(8);
  faderVals.fill(0, 0, 8);
  const prevFaderValues = [];
  prevFaderValues.push(faderVals);

  // create arrays for button values
  const vals = new Array(8);
  vals.fill(false, 0, 8);
  const vals2 = new Array(8);
  vals2.fill(false, 0, 8);
  const vals3 = new Array(8);
  vals3.fill(false, 0, 8);
  const vals4 = new Array(8);
  vals4.fill(false, 0, 8);
  // const prevAvlues = new Array(input.length);
  const prevValues = [];
  // prevAvlues.fill(vals, 0, input.length);
  prevValues.push(vals);
  prevValues.push(vals2);
  prevValues.push(vals3);
  prevValues.push(vals4);

  setInterval(() => {
    for (let collum = 0; collum <= 7; collum++) {
      const binary = dec2bin(collum);
      output.forEach((pin, i) => rpio.write(pin, Number(binary[i]) || 0));
      rpio.msleep(config.controller.gpio.buttons.waitTilRead);

      // read value
      input.forEach((pin, row) => {
        // reverse input dues to button mapping
        const newVal = !readPin(pin);
        // check difference
        if (prevValues[row][collum] !== newVal) {
          prevValues[row][collum] = newVal;
          sendButton(newVal, collum + 1, row + 1);
        }
      });

      let newFaderVal = prevFaderValues[collum] || 0;
      for (let index = 0; index < 10; index++) {
        // start ADC sampling
        rpio.i2cSetSlaveAddress(0x68);
        rpio.i2cWrite(ADCWrite);
        // wait
        // rpio.msleep(config.controller.gpio.fader.waitTilRead);
        // read out ADC
        rpio.i2cRead(ADCRead, 2);
        const analogValue = ADCRead.readInt8(0) * 256 + ADCRead.readInt8(1);
        newFaderVal = 0.85 * newFaderVal + 0.15 * analogValue;
      }

      if (prevFaderValues[collum] !== newFaderVal) {
        prevFaderValues[collum] = newFaderVal;
        setFader(newFaderVal, 8 - collum);
      }
    }
  }, config.controller.gpio.interval);
}

export function initGPIO() {
  rpio.init({ gpiomem: false });
  // define gpio pins
  input.forEach((row) => rpio.open(row, rpio.INPUT, rpio.PULL_UP));
  output.forEach((row) => rpio.open(row, rpio.OUTPUT, rpio.LOW));
  // start loop
  checkNewButton();
}

export { initGPIO as default };
