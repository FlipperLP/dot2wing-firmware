// eslint-disable-next-line import/no-duplicates
import rpioButton from 'rpio';

// eslint-disable-next-line import/no-duplicates
import rpioFader from 'rpio';

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
  const newVal = rpioButton.read(pin);
  return !!newVal;
}

// check for new input
function checkNewButton() {
  // set ADC config
  const ADCWrite = new Buffer([0x80]);
  const ADCRead = new Buffer(8);
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
      output.forEach((pin, i) => rpioButton.write(pin, Number(binary[i]) || 0));
      rpioButton.msleep(config.controller.gpio.buttons.waitTilRead);
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
      // FADER EINLESEN HIER
      rpioFader.i2cWrite(ADCWrite);
      rpioFader.msleep(config.controller.gpio.fader.waitTilRead);
      rpioFader.i2cRead(ADCRead, 4);
      console.log(ADCRead);
    }
  }, config.controller.gpio.interval);
}

function initADC() {
  rpioFader.init({ gpiomem: false });
  // set i2c adress
  rpioFader.i2cBegin();
  rpioFader.i2cSetSlaveAddress(0x68);
  rpioFader.i2cSetBaudRate(100000);
}

export function initGPIO() {
  rpioButton.init({ gpiomem: false });
  // define gpio pins
  input.forEach((row) => rpioButton.open(row, rpioButton.INPUT, rpioButton.PULL_UP));
  output.forEach((row) => rpioButton.open(row, rpioButton.OUTPUT, rpioButton.LOW));
  // init ADC for fader
  initADC(rpioButton);
  // start loop
  checkNewButton();
}

export function initOLED() {
  oled = new Oled({ rpio: rpioButton, address: 0x3c || 0x3C });
  // rotate display
  [0xA1, 0xC8].forEach((cmd) => rpioButton.i2cWrite(Buffer.from([0x00, cmd])));
  // set lower baudrate
  rpioButton.i2cSetBaudRate(100000);
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
  oled.drawRect(0, 0, 128, 64, 'WHITE');
  oled.writeString(64, 30, font, `${Math.ceil(data.fader[0].fader.value * 100)}%  `, 'WHITE', false);
}
