import WebSocket from 'ws';

import rawConfig from '../config.json';

// get correct config part
const config = rawConfig.maweb;

// get endpoint
const endpoint = process.env.ENDPOINT || config.endpoint;

// open new websocket session
const WSconnection = new WebSocket(`ws://${endpoint}/?ma=1`);

// send websocket
export function sendWebsocket(msg) { WSconnection.send(JSON.stringify(msg)); }

// button press and release
export function setButton(pressed, execIndex, buttonId) {
  sendWebsocket({
    requestType: 'playbacks_userInput', execIndex: execIndex - 1, pageIndex: 0, buttonId: buttonId || 0, pressed, released: !pressed, type: 0, session: config.maweb.activeSession,
  });
}

// set fader value
export function setFader(faderValue, execIndex) {
  sendWebsocket({
    requestType: 'playbacks_userInput', execIndex: execIndex - 1, pageIndex: 0, faderValue, type: 1, session: config.maweb.activeSession,
  });
}

export function getSetSession(value) {
  sendWebsocket({ session: value || 0 });
}

// export { setButton,  };
