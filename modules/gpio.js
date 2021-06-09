import rpio from 'rpio';

import config from '../config.json';

import { setButton, setFader } from './maRemote';

const checkRows = config.controller.gpio.buttons.rows;

function sendButton(value, buttonIndex, buttonRow) {
  // TODO: Fix overflow with to 0 in the middle
  const key = toString(`${buttonRow}0${9 - buttonIndex}`);
  setButton(value, key, 0);
}

// check for new input
function checkNewButton() {
  // TODO: remove +1 if offset
  const previusValues = [];
  previusValues.fill(true, 0, 7);
  setInterval(() => {
    config.controller.gpio.buttons.rows.forEach((pin, row) => {
      for (let i = 0; i <= 7; i++) {
        // TODO: Ask waht need to send
        rpio.write(pin, rpio.HIGH);
        rpio.msleep(1);
        // read value
        const newVal = rpio.read(pin);
        console.log(newVal);
        const valBool = !!newVal;
        // check difference
        if (previusValues[i] === valBool) {
          previusValues[i] = valBool;
          sendButton(valBool, i + 1, row + 1);
        }
      }
    });
  }, 10);
}

export function initGPIO() {
  rpio.init({ mock: config.controller.gpio.mock });
  // define gpio pins
  checkRows.forEach((row) => {
    rpio.open(row, rpio.OUTPUT, rpio.PULL_UP);
  });
  // start loop
  checkNewButton();
}

export { initGPIO as default };
