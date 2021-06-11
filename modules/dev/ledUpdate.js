// import ledHandler from 'rpi-ws281x';

import rawConfig from '../../config.json';

// get correct config part
const config = rawConfig.controller.neopixel;

// configure leds
const channel = ledHandler(config.ammount, config.options);

// change color
const colorArray = channel.array;
for (let i = 0; i < channel.count; i++) {
  colorArray[i] = 0xffcc22;
}

ws281x.render();
