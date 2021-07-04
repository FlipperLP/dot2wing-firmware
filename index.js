import rpio from 'rpio';

import Oled from 'sh1106-js';

// Rpio
rpio.init({
  gpiomem: false,
  mapping: 'physical',
});


// Oled
const oled = new Oled({rpio});

oled.clearDisplay();
oled.drawRect(0, 0, 128, 64, 'WHITE');
oled.writeString(64, 30, font, 'METHS', 'WHITE');