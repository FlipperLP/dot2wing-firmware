import md5 from 'md5';
import { sendWebsocket } from './webSocket';
import { parseValues } from './prettify';
// eslint-disable-next-line import/no-cycle
import { initGPIO } from './gpio';
import { setOLED, initOLED } from './display';
import { setNeopixels } from './neopixel';
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

// set fader value - value between 0 and 4095
export function setFader(rawFaderValue, execIndex) {
  const faderValue = rawFaderValue / 4095;
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
  if (config.maweb.appType === 'dot2') {
    sendWebsocket({
      requestType: 'playbacks',
      session,
      startIndex: [0, 100, 200],
      itemsCount: [8, 8, 8],
      pageIndex: 0,
      itemsType: [2, 3, 3],
    });
  } else if (config.maweb.appType === 'gma2') {
    sendWebsocket({
      requestType: 'playbacks',
      startIndex: [0],
      itemsCount: [15],
      pageIndex: 0,
      itemsType: [2],
      view: 2,
      execButtonViewMode: 1,
      buttonsViewMode: 0,
      session,
    });
  }
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
  }, config.maweb.playbackRefreshRate);
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
// TODO: only send on change
function playbackData(rawData) {
  console.log("raw Data:");
  console.log(rawData);
  const parsedData = parseValues(rawData);
  console.log("parsed Data:");
  console.log(parsedData);
  setNeopixels(parsedData);
  setOLED(parsedData);
}

// login provided session
export function loginSession(requestType, argument) {
  switch (requestType) {
    case 'login':
      config.maweb.activeSession = argument;
      const creds = config.maweb.creds;
      const username = creds.username;
      if (config.maweb.appType === 'dot2') {
        const username = 'remote'; // fixed username for dot2
      }
      const password = md5(creds.password);
      sendWebsocket({
        // TODO: check if maxRequests is needed
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
      // keep session alive
      heartbeatLoop();
      if (!process.env.debug) {
        // get playback
        mainLoop();
        // initialize gpio
        initGPIO();
        initOLED();
      } else debugLoop();
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
  if (response.status === 'server ready') return config.maweb.appType = response.appType;
  if (response.forceLogin) return loginSession('login', response.session);
  if (response.result) return loginSession('afterLogin', response.result);
  if (response.responseType === 'playbacks') return playbackData(response);
  // FIXME: to awoid having too many sessions, check how to reuse old one in maweb
  // TODO: check if dot2 died
}
