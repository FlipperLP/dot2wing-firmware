import ledHandler from 'rpi-ws281x';

import config from '../config.json';

const pixels = new Uint32Array(config.controller.neopixel.options.leds);

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

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function setPixels(data) {
  data[0].forEach((button, i) => {
    const color = hexToRgb(button.color);
    // eslint-disable-next-line no-bitwise
    let setColor = (color.r << 16) | (color.g << 8) | color.b;
    // eslint-disable-next-line no-bitwise
    if (!button.isRun) setColor = (color.r * 0.2 << 16) | (color.g * 0.2 << 8) | color.b * 0.2;
    if (button.empty) setColor = 0;
    pixels[i] = setColor;
  });
  ledHandler.render(pixels);
}

export function initPixel() {
  // initalize config
  ledHandler.configure(config.controller.neopixel.options);
  // reset pixels
  pixels.forEach((plx, i) => pixels[i] = 0);
  ledHandler.render(pixels);
}
