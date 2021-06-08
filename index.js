// eslint-disable-next-line import/no-unresolved
import ledHandler from 'rpi-ws281x';

// One time initialization
ledHandler.configure({
  leds: 15, gpio: 18, brightness: 100, dma: 10, stripType: 'grb',
});

// Create my pixels
const pixels = new Uint32Array(15);

const red = 255;
const green = 0;
const blue = 0;
// eslint-disable-next-line no-bitwise
const color = (red << 16) | (green << 8) | blue;
// eslint-disable-next-line no-bitwise
const colorBlack = (green << 16) | (green << 8) | blue;

pixels.forEach((plx, i) => {
  setInterval(() => {
    pixels.forEach((element, i) => pixels[i] = colorBlack);
    pixels[i] = color;
    ledHandler.render(pixels);
  }, 500 * i);
});

// Render pixels to the Neopixel strip
