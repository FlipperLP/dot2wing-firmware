import rpio from 'rpio';

import Oled from 'sh1106-js';

import font from 'oled-font-5x7';

const oled = new Oled({ rpio, address: 0x3c });

oled.clearDisplay();

oled.dimDisplay(0xff);

oled.writeString(1, 1, font, 'WHITE', 'Cats and dogs');

oled.turnOnDisplay();
