import rpio from 'rpio';
import Oled from 'sh1106-js';
import font from 'oled-font-5x7';

// eslint-disable-next-line no-buffer-constructor
const CHANNEL_1 = new Buffer([0b00000001]);
// eslint-disable-next-line no-buffer-constructor
const CHANNEL_2 = new Buffer([0b00000010]);
// eslint-disable-next-line no-buffer-constructor
const CHANNEL_ALL = new Buffer([0b11111111]);
const ADDRESS_I2C_MUX = 0x70;
const ADDRESS_DISPLAY = 0x3C;

let oled;

let displayValue1 = 0;
let displayValue2 = 0;

export function initOLED() {
  rpio.i2cSetSlaveAddress(ADDRESS_I2C_MUX);
  rpio.i2cWrite(CHANNEL_ALL);

  rpio.i2cSetSlaveAddress(ADDRESS_DISPLAY);
  oled = new Oled({ rpio, address: ADDRESS_DISPLAY });
  // rotate display
  [0xA1, 0xC8].forEach((cmd) => rpio.i2cWrite(Buffer.from([0x00, cmd])));
  // set lower baudrate
  rpio.i2cSetBaudRate(400000); // 400kHz
  // enable display
  oled.turnOnDisplay();
  // invert color
  oled.invertDisplay(false);
  // clear display
  oled.clearDisplay();
  // set display intensity
  oled.dimDisplay(0xff);
  // set update interval
  setInterval(() => {
    rpio.i2cSetSlaveAddress(ADDRESS_I2C_MUX);
    rpio.i2cWrite(CHANNEL_1);

    rpio.i2cSetSlaveAddress(ADDRESS_DISPLAY);
    oled.writeString(64, 30, font, `${displayValue1}%  `, 'WHITE', false);
    oled.update();

    rpio.msleep(50);

    rpio.i2cSetSlaveAddress(ADDRESS_I2C_MUX);
    rpio.i2cWrite(CHANNEL_2);

    rpio.i2cSetSlaveAddress(ADDRESS_DISPLAY);
    oled.writeString(64, 30, font, `${displayValue2}%  `, 'WHITE', false);
    oled.update();
  }, 100);
}

export function setOLED(data) {
  displayValue1 = Math.ceil(data[0][0].fader.value * 100);
  displayValue2 = Math.ceil(data[0][1].fader.value * 100);
}
