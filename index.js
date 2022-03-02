import { WSconnection } from './modules/webSocket';

import { loginSession, websocketAnswer } from './modules/maRemote';

import { initNeopixels, testPixels } from './modules/neopixel';

// import { initEncoder, readEncoder, readEncoderSwitch } from './modules/encoder';

// initEncoder();

// setInterval(() => {
//   const test = readEncoder();
//   if (test) console.log(test);
//   const test2 = readEncoderSwitch();
//   if (test2 !== null) console.log(test2);
// }, 1);

// init neopixel
initNeopixels();
testPixels();

// open websocket
WSconnection.onopen = () => loginSession();

// websocket emitter
WSconnection.onmessage = (msg) => websocketAnswer(msg);
WSconnection.onerror = (error) => console.log(`WebSocket error: ${error}`);
WSconnection.onclose = () => {
  console.error('Disconnected! Exiting...');
  process.exit(1);
};
