import rpioFader from 'rpio';

import config from './config.json';

const input = config.controller.gpio.buttons.input;

const output = config.controller.gpio.buttons.output;

function dec2bin(dec) {
  return Number(dec).toString(2).split('').reverse();
}

function hex2bin(hex) {
  return (`00000000${(parseInt(hex, 16)).toString(2)}`).substr(-8);
}

rpioFader.init({ gpiomem: false });
input.forEach((row) => rpioFader.open(row, rpioFader.INPUT, rpioFader.PULL_UP));
output.forEach((row) => rpioFader.open(row, rpioFader.OUTPUT, rpioFader.LOW));
// set i2c adress
rpioFader.i2cBegin();
rpioFader.i2cSetSlaveAddress(0x68);
rpioFader.i2cSetBaudRate(100000);

// set ADC config
const ADCWrite = new Buffer([0x80]);
const ADCRead = [];
const vals = new Array(8);
vals.fill(false, 0, 8);
const vals2 = new Array(8);
vals2.fill(false, 0, 8);
// const prevAvlues = new Array(input.length);
const prevAvlues = [];
// prevAvlues.fill(vals, 0, input.length);
prevAvlues.push(vals);
prevAvlues.push(vals2);
setInterval(() => {
  for (let collum = 0; collum <= 0; collum++) {
    const binary = dec2bin(collum);
    output.forEach((pin, i) => rpioFader.write(pin, Number(binary[i]) || 0));
    rpioFader.msleep(config.controller.gpio.buttons.waitTilRead);
    // FADER EINLESEN HIER
    rpioFader.i2cWrite(ADCWrite);
    rpioFader.msleep(config.controller.gpio.fader.waitTilRead);
    rpioFader.i2cRead(ADCRead, 4);
    console.log(ADCRead);
  }
}, config.controller.gpio.interval);
