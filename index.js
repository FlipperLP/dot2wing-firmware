import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

const oled = new Oled({ rpio, address: 0x3c });

[0xA1, 0xC8].forEach((cmd) => {
  rpio.i2cWrite(Buffer.from([0x00, cmd]));
});

oled.clearDisplay();

oled.dimDisplay(0xff);

oled.writeString(1, 1, font, 'Cats and dogs', 'WHITE');

oled.turnOnDisplay();
