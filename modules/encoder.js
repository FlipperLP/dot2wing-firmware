import rpio from 'rpio';

import config from '../config.json';

// export function readEncoder() {
  
// }

export function initEncoder() {
  rpio.init({ gpiomem: false });
  // define gpio pins
  config.controller.gpio.encoder.pins.forEach((pin) => {
    console.log(pin);
    // rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
  });
}

export { initEncoder as default };
