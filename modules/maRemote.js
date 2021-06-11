import md5 from 'md5';

import { sendWebsocket } from './webSocket';

import { parseValues } from './prettify';

// eslint-disable-next-line import/no-cycle
import { initGPIO } from './gpio';

import { setPixels } from './neopixel';

import config from '../config.json';

let session;

// button press and release
export function setButton(pressed, execIndex, buttonId) {
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
export function setFader(rawFaderValue, execIndex) {
  const faderValue = rawFaderValue / 255;
  sendWebsocket({
    requestType: 'playbacks_userInput',
    session,
    execIndex: execIndex - 1,
    pageIndex: 0,
    faderValue,
    type: 1,
  });
}

// set session ID
export function setSession(inputSession) {
  // IMPORTANT update session for functions
  session = inputSession;
  // send session
  sendWebsocket({ session: session || 0 });
}

// call data to get playback info
export function getPlayback() {
  sendWebsocket({
    requestType: 'playbacks',
    session,
    startIndex: [0, 100, 200],
    itemsCount: [8, 8, 8],
    pageIndex: 0,
    itemsType: [2, 3, 3],
  });
}

// keep session alive
function heartbeatLoop() {
  setInterval(() => {
    // call data to get playback info
    setSession(config.maweb.activeSession);
    if (process.env.debug) console.log('Heartbeat sent! Session', config.maweb.activeSession);
  }, config.maweb.keepAlive);
}

// call data and post data from input
function mainLoop() {
  setInterval(() => {
    getPlayback();
  }, 30);
}

function debugLoop() {
  let val = false;
  setInterval(() => {
    // get a random button
    const randomChoice = `${Math.floor(Math.random() * 2) + 1}0${Math.floor(Math.random() * 6) + 1}`;
    // call data to get playback info
    setButton(val, randomChoice, 0);
    // setButton(val, 101, 0);
    setFader(Math.floor(Math.random() * 256), Math.floor(Math.random() * 6) + 1);
    // console.debug('set button', randomChoice, 'to', val);
    val = !val;
  }, 30);
}

// get Data from playback
function playbackData(rawData) {
  const cleanData = parseValues(rawData);
  // console.log(cleanData);
  setPixels(cleanData);
  // console.log(cleanData[0][0].name, cleanData[0][0].isRun);
  // console.log(cleanData[1][0].name, cleanData[1][0].isRun);
  // console.log(cleanData.fader[0].fader.name, cleanData.fader[0].fader.value);
}

// login provided session
export function loginSession(requestType, argument) {
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
      // inform functions
      setSession(config.maweb.activeSession);
      // call loops
      heartbeatLoop();
      mainLoop();
      if (process.env.debug) debugLoop();
      // initialize gpio
      if (!process.env.debug) {
        initGPIO();
      }
      break;
    default:
      setSession();
      break;
  }
}

// answer from websocket
export function websocketAnswer(msg) {
  const response = JSON.parse(msg.data);
  // if (process.env.debug) console.debug(response);
  if (response.status === 'server ready') return;
  if (response.forceLogin) return loginSession('login', response.session);
  if (response.result) return loginSession('afterLogin', response.result);
  if (response.responseType === 'playbacks') return playbackData(response);
  // FIXME: to awoid having too many sessions, check how to reuse old one in maweb
  // TODO: check if dot2 died
}
