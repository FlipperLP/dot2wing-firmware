/* eslint-disable no-bitwise */
// eslint-disable-next-line import/no-unresolved
import ledHandler from 'rpi-ws281x';

// One time initialization
ledHandler.configure({
  leds: 3, gpio: 18, brightness: 100, dma: 10, stripType: 'grb',
});

// Create my pixels
const pixels = new Uint32Array(3);

pixels[0] = (255 << 16) | (0 << 8) | 0;
pixels[1] = (0 << 16) | (255 << 8) | 0;
pixels[2] = (0 << 16) | (0 << 8) | 255;

// Render pixels to the Neopixel strip
ledHandler.render(pixels);
