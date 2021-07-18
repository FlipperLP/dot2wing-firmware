import rpio from 'rpio';

import config from '../config.json';

const input = config.controller.gpio.displays.input;

const output = config.controller.gpio.displays.output;

let oled;

export function initOLED() {
  oled = new Oled({ rpio, address: 0x3c || 0x3C });
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
  setInterval(() => oled.update(), 50);
}

export function setOLED(data) {
  rpio.i2cSetSlaveAddress(0x3C);
  // oled.drawRect(0, 0, 128, 64, 'WHITE');
  oled.writeString(64, 30, font, `${Math.ceil(data[0][0].fader.value * 100)}%  `, 'WHITE', false);
}
