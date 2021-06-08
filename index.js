var ws281x = require('rpi-ws281x');

// One time initialization
ws281x.configure({leds:16});


// Create my pixels
var pixels = new Uint32Array(16);

// Render pixels to the Neopixel strip
ws281x.render(pixels);