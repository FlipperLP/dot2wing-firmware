// eslint-disable-next-line import/no-unresolved
import ledHandler from 'rpi-ws281x';

// One time initialization
ledHandler.configure({ leds: 3 });

// Create my pixels
const pixels = new Uint32Array(3);

// Render pixels to the Neopixel strip
ws281x.render(pixels);
