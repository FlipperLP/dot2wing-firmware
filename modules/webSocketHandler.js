import WebSocket from 'ws';

import rawConfig from '../config.json';

const config = rawConfig.maweb;

// get endpoint
const endpoint = process.env.ENDPOINT || config.endpoint;

// open new websocket session
export const WSconnection = new WebSocket(`ws://${endpoint}/?ma=1`);

// send websocket
export function sendWebsocket(msg) { WSconnection.send(JSON.stringify(msg)); }

// button press and release
export function setButton(session, pressed, execIndex, buttonId) {
  sendWebsocket({
    requestType: 'playbacks_userInput',
    session,
    execIndex: execIndex - 1,
    pageIndex: 0,
    buttonId: buttonId || 0,
    pressed,
    released: !pressed,
    type: 0,
  });
}

// set fader value
export function setFader(session, faderValue, execIndex) {
  sendWebsocket({
    requestType: 'playbacks_userInput', execIndex: execIndex - 1, pageIndex: 0, faderValue, type: 1, session,
  });
}

export function getSetSession(value) {
  sendWebsocket({ session: value || 0 });
}

// export { setButton,  };
