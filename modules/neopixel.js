import ledHandler from 'rpi-ws281x';
import allConfig from '../config.json';

const config = allConfig.controller.neopixel;
const pixels = new Uint32Array(config.options.leds);

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function rgbColor(red, green, blue, intensity) {
  if (typeof intensity === 'undefined') { intensity = 1; } // default value for intensity
  // eslint-disable-next-line no-bitwise
  return ((red * intensity) << 16) | ((green * intensity) << 8) | (blue * intensity);
}

export function setNeopixels(playbackData) {
  // set button basecolor depending on appType:
  let buttonBaseColor = {};
  if (allConfig.maweb.appType === 'dot2') { // default color for dot2 from config file
    buttonBaseColor.red = config.dot2Color.red;
    buttonBaseColor.green = config.dot2Color.green;
    buttonBaseColor.blue = config.dot2Color.blue;
  } else buttonBaseColor = hexToRgb(button.color || button.fader.color);
  // go through all LEDs:
  playbackData.forEach((row, rowNumber) => {
    row.forEach((button, columnNumber) => {
      // set LED color depending on executor-state:
      let ledColor = rgbColor(buttonBaseColor.red, buttonBaseColor.green, buttonBaseColor.blue, config.intensityButtonOff);
      if (!button.fader) { // button-LEDs
        if (button.isRun) ledColor = rgbColor(buttonBaseColor.red, buttonBaseColor.green, buttonBaseColor.blue, config.intensityButtonOn);
        if (button.empty) ledColor = rgbColor(0, 0, 0);
      } else { // fader-LEDs
        if (button.fader.isRun) ledColor = rgbColor(buttonBaseColor.red, buttonBaseColor.green, buttonBaseColor.blue, config.intensityButtonOn);
        if (button.fader.empty) ledColor = rgbColor(0, 0, 0);
      }
      // set pixel:
      switch (rowNumber) {
        case 0:
          pixels[columnNumber + 24] = ledColor;
          break;
        case 1:
          pixels[columnNumber + 0] = ledColor;
          break;
        case 2:
          pixels[columnNumber + 8] = ledColor;
          break;
        default:
          break;
      }
    });
  });
}

export function initNeopixels() {
  // initalize config:
  ledHandler.configure(config.options);
  // clear all pixels:
  pixels.forEach((plx, i) => pixels[i] = 0);
  // set update interval:
  setInterval(() => ledHandler.render(pixels), config.options.refreshTime);
}
