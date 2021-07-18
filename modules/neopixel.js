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

function isBoolean(val) { return typeof val === 'boolean'; }

export function setPixels(data) {
  console.log(data);
  data.forEach((row, rowMultipier) => {
    row.forEach((button, i) => {
      let color = {};
      if (allConfig.maweb.appType === 'dot2') {
        color.r = config.dot2Color.red;
        color.g = config.dot2Color.green;
        color.b = config.dot2Color.blue;
      } else color = hexToRgb(button.color || button.fader.color);
      const multipier = config.isRunMultipier;
      // eslint-disable-next-line no-bitwise
      let setColor = (color.r * multipier << 16) | (color.g * multipier << 8) | color.b * multipier;
      // eslint-disable-next-line no-bitwise
      if (button.isRun || button.fader.isRun) setColor = (color.r << 16) | (color.g << 8) | color.b;
      // TODO: Better bitwise handler
      if (button.empty || button.fader.empty) setColor = 0;
      pixels[i + (rowMultipier * 8)] = setColor;
    });
  });
}

export { setPixels as default };
