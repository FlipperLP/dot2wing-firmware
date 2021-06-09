import WebSocket from 'ws';

import rawConfig from '../config.json';

const config = rawConfig.maweb;

// get endpoint
const endpoint = process.env.ENDPOINT || config.endpoint;

// open new websocket session
export const WSconnection = new WebSocket(`ws://${endpoint}/?ma=1`);

// send websocket
export function sendWebsocket(msg) { WSconnection.send(JSON.stringify(msg)); }
