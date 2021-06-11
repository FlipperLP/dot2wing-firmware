// import ledHandler from 'rpi-ws281x';

import config from '../config.json';

// Create pixels

// const red = 255;
// const green = 0;
// const blue = 0;
// // eslint-disable-next-line no-bitwise
// const color = (red << 16) | (green << 8) | blue;
// // eslint-disable-next-line no-bitwise
// const colorBlack = (green << 16) | (green << 8) | blue;

// pixels.forEach((plx, i) => {
//   setTimeout(() => {
//     // pixels.map((x) => colorBlack);
//     pixels.forEach((something, i) => pixels[i] = colorBlack);
//     // Render pixels to the Neopixel strip
//     pixels[i] = color;
//     ledHandler.render(pixels);
//   }, 500 * i);
// });

export function setPixel(data) {
  const pixels = new Uint32Array(config.controller.neopixel.options.leds);
}

export function initPixel() {
  // initalize config
  ledHandler.configure(config.controller.neopixel.options);
  // reset pixels
  pixels.forEach((plx, i) => pixels[i] = 0);
  ledHandler.render(pixels);
}
