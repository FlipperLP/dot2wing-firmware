// eslint-disable-next-line import/no-unresolved
import ledHandler from 'rpi-ws281x';

// One time initialization
ledHandler.configure({
  leds: 3, gpio: 18, brightness: 10, dma: 10, stripType: 'grb',
});

// Create my pixels
const pixels = new Uint32Array(3);

const red = 255;
const green = 0;
const blue = 0;
// eslint-disable-next-line no-bitwise
const color = (red << 16) | (green << 8) | blue;

pixels.forEach((plx, i) => {
  pixels[i] = color;
});

// Render pixels to the Neopixel strip
ws281x.render(pixels);
