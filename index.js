import { WSconnection } from './modules/webSocket';

import { loginSession, websocketAnswer } from './modules/maRemote';

import { initNeopixels } from './modules/neopixel';

import { initEncoder } from './modules/encoder';

initEncoder();

// open websocket
// WSconnection.onopen = () => loginSession();

// // init neopixel
// initNeopixels();

// // websocket emitter
// WSconnection.onmessage = (msg) => websocketAnswer(msg);
// WSconnection.onerror = (error) => console.log(`WebSocket error: ${error}`);
// WSconnection.onclose = () => {
//   console.error('Disconnected! Exiting...');
//   process.exit(1);
// };
