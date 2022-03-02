import rpio from 'rpio';

import config from '../config.json';

const pins = config.controller.gpio.encoder.pins;

let lastValue = false;

export function readEncoder() {
  const nowValue = rpio.read(pins.A);
  if (lastValue && !nowValue) {
    lastValue = nowValue;
    if (!rpio.read(pins.B)) return 1;
    return -1;
  }
  lastValue = nowValue;
  return 0;
}

export function initEncoder() {
  rpio.init({ gpiomem: false });
  // define gpio pins
  Object.values(pins).forEach((pin) => rpio.open(pin, rpio.INPUT, rpio.PULL_UP));
}
