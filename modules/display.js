import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

import config from '../config.json';

// eslint-disable-next-line no-buffer-constructor
// const setChannel1 = new Buffer([0x01]);
// eslint-disable-next-line no-buffer-constructor
const setChannel1 = new Buffer([0x01]);
// eslint-disable-next-line no-buffer-constructor
const setChannel2 = new Buffer([0x02]);
// eslint-disable-next-line no-buffer-constructor
const setChannelAll = new Buffer([0xFF]);

const outputData = config.controller.gpio.displays.outputData;

const outputMultiplexer = config.controller.gpio.displays.outputMultiplexer;

let oled;

function setMultiplexer(params) {

}

export function initOLED() {
  rpio.i2cSetSlaveAddress(0x70);
  rpio.i2cWrite(setChannelAll);
  // rpio.i2cWrite(setChannel1 | setChannel2);

  oled = new Oled({ rpio, address: 0x3c });
  // rotate display
  [0xA1, 0xC8].forEach((cmd) => rpio.i2cWrite(Buffer.from([0x00, cmd])));
  // set lower baudrate
  // rpio.i2cSetBaudRate(100000);
  rpio.i2cSetBaudRate(400000);
  // enable display
  oled.turnOnDisplay();
  // invert color
  oled.invertDisplay(false);
  // clear
  oled.clearDisplay();
  oled.dimDisplay(0xff);
  // set interval
  // setInterval(() => {
  //   rpio.i2cSetSlaveAddress(0x70);
  //   rpio.i2cWrite(setChannelAll);

  //   rpio.i2cSetSlaveAddress(0x3c);
  //   oled.update();
  // }, 50);
}

export function setOLED(data) {
  rpio.i2cSetSlaveAddress(0x70);
  rpio.i2cWrite(setChannel1);

  rpio.i2cSetSlaveAddress(0x3c);
  oled.writeString(64, 30, font, `${Math.ceil(data[0][0].fader.value * 100)}%  `, 'WHITE', false);

  oled.update();

  rpio.msleep(2);

  rpio.i2cSetSlaveAddress(0x70);
  rpio.i2cWrite(setChannel2);

  rpio.i2cSetSlaveAddress(0x3c);oled.update();
  oled.writeString(64, 30, font, `${Math.ceil(data[0][1].fader.value * 100)}%  `, 'WHITE', false);

  oled.update();
}
