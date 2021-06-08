import md5 from 'md5';

import gpio from 'gpio';

import config from './config.json';

import { prettify } from './modules/prettify';

import {
  sendWebsocket, setButton, setFader, getSetSession, WSconnection,
} from './modules/webSocketHandler';

// define gpio pin
let gpio4;
if (!process.env.debug) gpio4 = gpio.export(4, { direction: gpio.DIRECTION.IN });

// keep session alive
function keepAlive() {
  setInterval(() => {
    // call data to get playback info
    getSetSession(config.maweb.activeSession);
    if (!gpio4) console.log('Keepalive Session', config.maweb.activeSession);
  }, config.maweb.keepAlive);
}

// call data and post data from input
function mainLoop() {
  setInterval(() => {
    // call data to get playback info
    sendWebsocket({
      requestType: 'playbacks', startIndex: [0, 100, 200], itemsCount: [14, 14, 14], pageIndex: 0, itemsType: [2, 3, 3], view: 2, execButtonViewMode: 1, buttonsViewMode: 0, session: config.maweb.activeSession, maxRequests: 1,
    });
  }, 30);
}

// get Data from playback
function callbackData(rawData) {
  const cleanData = prettify(rawData);
  console.log(cleanData[5].button1.isRun, cleanData[5].button2.isRun, cleanData[5].faderExecutor.isRun);
}

function debugLoop() {
  let val = false;
  setInterval(() => {
    // call data to get playback info
    setButton(val, 101, 0);
    console.debug('set button to', val);
    val = !val;
  }, 1000);
}

// login provided session
function loginSession(requestType, argument) {
  switch (requestType) {
    case 'login':
      config.maweb.activeSession = argument;
      const creds = config.maweb.creds;
      const username = creds.username;
      const password = md5(process.env.PASSWORD || creds.password);
      sendWebsocket({
        requestType, username, password, session: argument, maxRequests: 10,
      });
      break;
    case 'afterLogin':
      // post active session
      console.debug('Login:', argument);
      console.debug('ActiveSession:', config.maweb.activeSession);
      // check if mainloop already runns; no double loop
      if (!config.maweb.mainLoopRunning) config.maweb.mainLoopRunning = true;
      else return;
      // call loops
      keepAlive();
      mainLoop();
      if (!gpio4) debugLoop();
      break;
    default:
      getSetSession();
      break;
  }
}

// login websocket
WSconnection.onopen = () => loginSession();

if (gpio4) {
  gpio4.on('change', (val) => {
    switch (val) {
      case 1:
        setButton(true, 106, 0);
        return;
      case 0:
        setButton(false, 106, 0);
        return;
      default:
        return;
    }
  });
}

// websocket awnser splitter
WSconnection.onmessage = (msg) => {
  const response = JSON.parse(msg.data);
  // if (!gpio4) console.debug(response);
  if (response.status === 'server ready') return;
  if (response.forceLogin) return loginSession('login', response.session);
  if (response.result) return loginSession('afterLogin', response.result);
  if (response.responseType === 'playbacks') return callbackData(response);
  // FIXME: to awoid having too many sessions, check how to reuse old one in maweb
};

// post error
WSconnection.onError = (error) => {
  console.log(`WebSocket error: ${error}`);
};
