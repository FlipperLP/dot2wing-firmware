import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

// eslint-disable-next-line no-buffer-constructor
// const setChannel1 = new Buffer([0x01]);
// eslint-disable-next-line no-buffer-constructor
const setChannel1 = new Buffer([0x01]);
// eslint-disable-next-line no-buffer-constructor
const setChannel2 = new Buffer([0x02]);
// eslint-disable-next-line no-buffer-constructor
const setChannelAll = new Buffer([0x01]);

let oled;


export function initOLED() {
  rpio.i2cSetSlaveAddress(0x70);
  rpio.i2cWrite(setChannelAll);

  rpio.i2cSetSlaveAddress(0x3c);
  oled = new Oled({ rpio, address: 0x3c});
  // rotate display
  [0xA1, 0xC8].forEach((cmd) => rpio.i2cWrite(Buffer.from([0x00, cmd])));
  // set lower baudrate
  rpio.i2cSetBaudRate(400000);
  // enable display
  oled.turnOnDisplay();
  // invert color
  oled.invertDisplay(false);
  // clear
  oled.clearDisplay();
  oled.dimDisplay(0xff);
  // set interval
  setInterval(() => {
    rpio.i2cSetSlaveAddress(0x70);
    rpio.i2cWrite(setChannel1);

    rpio.i2cSetSlaveAddress(0x3c);
    oled.writeString(64, 30, font, displayValue1 + '%  ', 'WHITE', false);
    oled.update();

    rpio.msleep(50);

    rpio.i2cSetSlaveAddress(0x70);
    rpio.i2cWrite(setChannel2);

    rpio.i2cSetSlaveAddress(0x3c);
    oled.writeString(64, 30, font, displayValue2 + '%  ', 'WHITE', false);
    oled.update();
  }, 100);
}

let displayValue1 = 0;
let displayValue2 = 0;

export function setOLED(data) {
  displayValue1 = Math.ceil(data[0][0].fader.value * 100);
  displayValue2 = Math.ceil(data[0][1].fader.value * 100);
  // console.log(displayValue1, ' ', displayValue2);
}
