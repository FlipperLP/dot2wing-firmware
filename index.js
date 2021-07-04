import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

rpio.init({ gpiomem: false });

const oled = new Oled({ rpio, address: 0x3c });

// invert display
// [0xA1, 0xC8].forEach((cmd) => rpio.i2cWrite(Buffer.from([0x00, cmd])));

// set lower baudrate
rpio.i2cSetBaudRate(400000);

// invert color
// oled.invertDisplay(true);

// clear
oled.clearDisplay();
oled.dimDisplay(0xff);

setInterval(() => {
  oled.drawRect(0, 0, 128, 64, 'WHITE');
  oled.writeString(64, 30, font, 'METHS', 'WHITE');
}, 1000);
