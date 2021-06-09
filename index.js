import rpio from 'rpio';

import config from './config.json';

import { WSconnection } from './modules/webSocket';

import {
  setButton, setFader, loginSession, websocketAnswer,
} from './modules/maRemote';

// define gpio pin
if (!process.env.debug) {
  config.controller.gpio.buttons.rows.forEach((row) => {
    rpio.open(row, rpio.OUTPUT, rpio.PULL_UP);
  });
}

// login websocket
WSconnection.onopen = () => loginSession();

// setButton(true, 106, 0);

// while (true) {
//   config.controller.GPIORows.forEach((row) => {
//     for (let i = 0; i < 8; i++) {
//       const element = array[i];
//     }
//   });
// }

WSconnection.onmessage = (msg) => websocketAnswer(msg);
WSconnection.onerror = (error) => console.log(`WebSocket error: ${error}`);
WSconnection.onclose = () => {
  console.error('Disconnected! Exiting...');
  process.exit(1);
};
