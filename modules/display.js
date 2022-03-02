/* eslint-disable no-bitwise */
import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

// const ADDRESS_I2C_MUX = 0x70;
const ADDRESS_DISPLAY = 0x3C;

let oled;

let displayValue1 = 0;
let displayValue2 = 0;

// function setI2cMultiplexer(channel) {
//   rpio.i2cSetSlaveAddress(ADDRESS_I2C_MUX);
//   if (channel >= 1 & channel <= 8) {
//     const buffer = new Buffer([1 << (channel - 1)]);
//     rpio.i2cWrite(buffer);
//   } else if (channel === 0) {
//     const buffer = new Buffer([0xFF]);
//     rpio.i2cWrite(buffer);
//   }
// }

export function initOLED() {
  setI2cMultiplexer(0);

  rpio.i2cSetSlaveAddress(ADDRESS_DISPLAY);
  oled = new Oled({ rpio, address: ADDRESS_DISPLAY });
  // rotate display:
  [0xA1, 0xC8].forEach((cmd) => rpio.i2cWrite(Buffer.from([0x00, cmd])));
  // set baudrate:
  rpio.i2cSetBaudRate(800000); // 800kHz
  // enable display:
  oled.turnOnDisplay();
  // do not invert color:
  oled.invertDisplay(false);
  // clear display:
  oled.clearDisplay();
  // set display intensity:
  oled.dimDisplay(0xff);
  // set update interval:
  // setInterval(() => {
  //   // setI2cMultiplexer(1);

  //   rpio.i2cSetSlaveAddress(ADDRESS_DISPLAY);
  //   oled.writeString(64, 30, font, `${displayValue1}%  `, 'WHITE', false);
  //   oled.update();

  //   // rpio.msleep(50);

  //   // setI2cMultiplexer(2);

  //   // rpio.i2cSetSlaveAddress(ADDRESS_DISPLAY);
  //   // oled.writeString(64, 30, font, `${displayValue2}%  `, 'WHITE', false);
  //   // oled.update();
  // }, 10);
}

export function setOLED(data) {
  // write values to variables to facilitate asynchronous display updates:
  displayValue1 = Math.ceil(data[0][0].fader.value * 100);
  displayValue2 = Math.ceil(data[0][1].fader.value * 100);
}
