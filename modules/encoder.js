import rpio from 'rpio';

import config from '../config.json';

const pins = config.controller.gpio.encoder.pins;

let lastValueEncoder = false;

let lastValueSwitch = false;

export function readEncoderSwitch() {
  const nowValueSwitch = rpio.read(pins.switch);
  if (lastValueSwitch !== nowValueSwitch) {
    lastValueSwitch = nowValueSwitch;
    return !nowValueSwitch;
  }
  return null;
}

export function readEncoder() {
  const nowValue = rpio.read(pins.A);
  const valuePinB = rpio.read(pins.B);
  if (lastValueEncoder !== nowValue) {
    lastValueEncoder = nowValue;
    if (nowValue) {
      if (!valuePinB) return -1;
      return 1;
    }
    if (!valuePinB) return 1;
    return -1;
  }
  return 0;
}

export function initEncoder() {
  rpio.init({ gpiomem: false });
  // define gpio pins
  Object.values(pins).forEach((pin) => rpio.open(pin, rpio.INPUT, rpio.PULL_UP));
}
