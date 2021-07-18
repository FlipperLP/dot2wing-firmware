import { WSconnection } from './modules/webSocket';
import { loginSession, websocketAnswer } from './modules/maRemote';
import { initPixel as initNeopixel } from './modules/neopixel';

// open websocket
WSconnection.onopen = () => loginSession();

// init neopixel
initNeopixel();

// websocket emitter
WSconnection.onmessage = (msg) => websocketAnswer(msg);
WSconnection.onerror = (error) => console.log(`WebSocket error: ${error}`);
WSconnection.onclose = () => {
  console.error('Disconnected! Exiting...');
  process.exit(1);
};
