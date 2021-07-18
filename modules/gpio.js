import rpio from 'rpio';
import config from '../config.json';
// eslint-disable-next-line import/no-cycle
import { setButton, setFader } from './maRemote';

const inputPins = config.controller.gpio.buttons.inputPins;
const outputPins = config.controller.gpio.buttons.outputPins;
const ADDRESS_ADC = 0x68;

function dec2bin(dec) {
  return Number(dec).toString(2).split('').reverse();
}

function sendButton(value, buttonIndex, buttonRow) {
  // TODO: Fix overflow with to 0 in the middle
  let buttonId = 0;
  let key = `${buttonRow}0${9 - buttonIndex}`;
  if (buttonRow > 2) key = 9 - buttonIndex;
  if (buttonRow === 4) buttonId = 1;
  setButton(value, key, buttonId);
}

function readPin(pin) {
  const newVal = rpio.read(pin);
  return !!newVal;
}

// check for new input
function checkNewButton() {
  // set ADC config
  // eslint-disable-next-line no-buffer-constructor
  const ADC_START_SAMPLING = new Buffer([0b10000000]);
  // eslint-disable-next-line no-buffer-constructor
  const adcReturnBuffer = new Buffer(2);

  // create array for fader values
  // const faderVals = new Array(8);
  // faderVals.fill(0);
  // const prevFaderValues = [];
  // prevFaderValues.push(faderVals);
  const prevFaderValues = new Array(8);
  prevFaderValues.fill(0);

  // create arrays for button values
  const buttonVals1 = new Array(8);
  buttonVals1.fill(false, 0, 8);
  const buttonVals2 = new Array(8);
  buttonVals2.fill(false, 0, 8);
  const buttonVals3 = new Array(8);
  buttonVals3.fill(false, 0, 8);
  const buttonVals4 = new Array(8);
  buttonVals4.fill(false, 0, 8);
  const prevButtonValues = [];
  prevButtonValues.push(buttonVals1);
  prevButtonValues.push(buttonVals2);
  prevButtonValues.push(buttonVals3);
  prevButtonValues.push(buttonVals4);

  function readADC() {
    // start ADC sampling
    rpio.i2cSetSlaveAddress(ADDRESS_ADC);
    rpio.i2cWrite(ADC_START_SAMPLING);
    // wait a moment
    // ...or not
    // read out ADC
    rpio.i2cRead(adcReturnBuffer, 2);
    return adcReturnBuffer.readInt8(0) * 256 + adcReturnBuffer.readInt8(1);
  }

  setInterval(() => {
    for (let collum = 0; collum <= 7; collum++) {
      // set column-multiplexer:
      const binary = dec2bin(collum);
      outputPins.forEach((outputPin, i) => rpio.write(outputPin, Number(binary[i]) || 0));
      rpio.msleep(config.controller.gpio.buttons.waitTilRead);

      // read in button values:
      inputPins.forEach((pin, row) => {
        // reverse input dues to button mapping
        const newVal = !readPin(pin);
        // check difference
        if (prevButtonValues[row][collum] !== newVal) {
          prevButtonValues[row][collum] = newVal;
          sendButton(newVal, collum + 1, row + 1);
        }
      });

      // read in fader value and do some smoothing:
      let faderVal = prevFaderValues[collum] || 0;
      for (let smoothingIteration = 0; smoothingIteration < 10; smoothingIteration++) {
        faderVal = 0.85 * faderVal + 0.15 * readADC();
      }

      const newFaderVal = faderVal.toFixed(1);
      // console.log('ch' + collum + ' ' + newFaderVal);
      console.log(prevFaderValues);

      if (prevFaderValues[collum] !== newFaderVal) {
        prevFaderValues[collum] = newFaderVal;
        setFader(newFaderVal, 8 - collum);
      }
    }
  }, config.controller.gpio.interval);
}

export function initGPIO() {
  rpio.init({ gpiomem: false });
  // define gpio pins
  inputPins.forEach((row) => rpio.open(row, rpio.INPUT, rpio.PULL_UP));
  outputPins.forEach((row) => rpio.open(row, rpio.OUTPUT, rpio.LOW));
  // start loop
  checkNewButton();
}

export { initGPIO as default };
