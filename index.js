import { WSconnection } from './modules/webSocket';

import { loginSession, websocketAnswer } from './modules/maRemote';

// open websocket
WSconnection.onopen = () => loginSession();

// websocket emitter
WSconnection.onmessage = (msg) => websocketAnswer(msg);
WSconnection.onerror = (error) => console.log(`WebSocket error: ${error}`);
WSconnection.onclose = () => {
  console.error('Disconnected! Exiting...');
  process.exit(1);
};
