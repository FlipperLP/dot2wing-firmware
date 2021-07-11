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
  // set ADC config
  const ADCWrite = new Buffer([0x80]);
  const ADCRead = new Buffer(2);

  // create array for fader values
  const faderVals = new Array(8);
  faderVals.fill(0 , 0, 8);
  const prevFaderValues = [];
  prevFaderValues.push(faderVals);

  // create arrays for button values
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
      rpio.msleep(config.controller.gpio.buttons.waitTilRead);

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

      // start ADC smapling
      rpio.i2cSetSlaveAddress(0x68);
      rpio.i2cWrite(ADCWrite);
      // wait
      rpio.msleep(config.controller.gpio.fader.waitTilRead);
      // read out ADC
      rpio.i2cRead(ADCRead, 2);
      // console.log(ADCRead);
      const newFaderVal = ADCRead.readInt8(0) * 256 + ADCRead.readInt8(1);
      console.log('Fader ' + collum + ': ' + newFaderVal);

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

export function initOLED() {
  oled = new Oled({ rpio, address: 0x3c || 0x3C });
  // rotate display
  [0xA1, 0xC8].forEach((cmd) => rpio.i2cWrite(Buffer.from([0x00, cmd])));
  // set lower baudrate
  rpio.i2cSetBaudRate(100000);
  // enable display
  oled.turnOnDisplay();
  // invert color
  oled.invertDisplay(false);
  // clear
  oled.clearDisplay();
  oled.dimDisplay(0xff);
  // set interval
  setInterval(() => oled.update(), 100);
}

export function setOLED(data) {
  rpio.i2cSetSlaveAddress(0x3C);
  oled.drawRect(0, 0, 128, 64, 'WHITE');
  oled.writeString(64, 30, font, `${Math.ceil(data.fader[0].fader.value * 100)}%  `, 'WHITE', false);
}
