const rpio   = require('rpio');
const Oled   = require('sh1106-js');

// Rpio
rpio.init({
  gpiomem: false,
  mapping: 'physical',
});

// Oled
const oled = new Oled({rpio});