// eslint-disable-next-line import/no-unresolved
import ledHandler from 'rpi-ws281x';

import allConfig from '../config.json';

const config = allConfig.controller.neopixel;
const pixels = new Uint32Array(config.options.leds);

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16),
  } : null;
}

function rgbColor(red, green, blue, orgIntensity) {
  // default value for intensity
  const intensity = orgIntensity || 1;
  // eslint-disable-next-line no-bitwise
  return ((red * intensity) << 16) | ((green * intensity) << 8) | (blue * intensity);
}

export function setNeopixels(playbackData) {
  let buttonBaseColor = {};
  // default color for dot2 from config file
  buttonBaseColor.red = config.dot2Color.red;
  buttonBaseColor.green = config.dot2Color.green;
  buttonBaseColor.blue = config.dot2Color.blue;
  // go through all LEDs:
  playbackData.forEach((row, rowNumber) => {
    row.forEach((button, columnNumber) => {
      if (columnNumber > 7) return;
      // set button color only for gma2
      if (allConfig.maweb.appType === 'gma2') buttonBaseColor = hexToRgb(button.color || button.fader.color);
      const buttonOff = config.intensity.buttonOff;
      const buttonOn = config.intensity.buttonOn;
      // set LED color depending on executor-state:
      let ledColor = rgbColor(buttonBaseColor.red, buttonBaseColor.green, buttonBaseColor.blue, buttonOff);
      if (!button.fader) { // button-LEDs
        if (button.isRun) ledColor = rgbColor(buttonBaseColor.red, buttonBaseColor.green, buttonBaseColor.blue, buttonOn);
        if (button.empty) ledColor = rgbColor(0, 0, 0);
      } else { // fader-LEDs
        if (button.fader.isRun) ledColor = rgbColor(buttonBaseColor.red, buttonBaseColor.green, buttonBaseColor.blue, buttonOn);
        if (button.fader.empty) ledColor = rgbColor(0, 0, 0);
      }
      // set pixel:

      if (allConfig.maweb.appType === 'dot2') {
        switch (rowNumber) {
          case 0:
            pixels[columnNumber + 24] = ledColor;
            break;
          case 1:
            pixels[(7 - columnNumber)] = ledColor;
            break;
          case 2:
            pixels[columnNumber + 8] = ledColor;
            break;
          default:
            break;
        }
      } else if (allConfig.maweb.appType === 'gma2') {
        switch (rowNumber) {
          case 0:
            // faders:
            pixels[columnNumber + 16] = ledColor;
            break;
          case 1:
            // exec 100 buttons:
            pixels[(7 - columnNumber) + 24] = ledColor;
            break;
          default:
            break;
        }
      }
    });
  });
}

export function testPixels() {
  const buttonOn = config.intensity.buttonOn;
  ledColor = rgbColor(config.startup.red, config.startup.green, config.startup.blue, buttonOn);
  pixels.forEach((plx, i) => pixels[i] = ledColor);
}

export function initNeopixels() {
  // initalize config:
  ledHandler.configure(config.options);
  // clear all pixels:
  pixels.forEach((plx, i) => pixels[i] = 0);
  // set update interval:
  setInterval(() => ledHandler.render(pixels), config.options.refreshTime);
}
