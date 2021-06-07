const WebSocket = require('ws');

const md5 = require('md5');

const gpio = require('gpio');

const config = require('./config.json');

const endpoint = process.env.ENDPOINT || config.maweb.endpoint;

const WSconnection = new WebSocket(`ws://${endpoint}/?ma=1`);

const gpio4 = gpio.export(4, { direction: gpio.DIRECTION.IN });

//
//
//
// MAINFUNCTIONS
//
//
//

// send websocket
function sendWebsocket(msg) { WSconnection.send(JSON.stringify(msg)); }

function getsetSession(value) {
  sendWebsocket({ session: value || 0 });
}

// keep session alive
function keepAlive() {
  setInterval(() => {
    // call data to get playback info
    getsetSession(config.maweb.activeSession);
    console.log('Keepalive', config.maweb.activeSession);
  }, 10000);
  // }, config.maweb.keepAlive);
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
      // call mainloop
      keepAlive();
      mainLoop();
      break;
    default:
      getsetSession();
      break;
  }
}

//
//
//
// DOT2 functions
//
//
//

// button press and release
function setButton(pressed, execIndex, buttonId) {
  sendWebsocket({
    requestType: 'playbacks_userInput', execIndex: execIndex - 1, pageIndex: 0, buttonId: buttonId || 0, pressed, released: !pressed, type: 0, session: config.maweb.activeSession,
  });
}

function setFader(faderValue, execIndex) {
  sendWebsocket({
    requestType: 'playbacks_userInput', execIndex: execIndex - 1, pageIndex: 0, faderValue, type: 1, session: config.maweb.activeSession,
  });
}

//
//
//
// MAINPART
//
//
//

// login websocket
WSconnection.onopen = () => loginSession();

gpio4.on('change', (val) => {
  console.debug(val);
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

// websocket awnser splitter
WSconnection.onmessage = (msg) => {
  const response = JSON.parse(msg.data);
  // console.debug(response);
  if (response.status === 'server ready') return;
  if (response.forceLogin) return loginSession('login', response.session);
  if (response.result) return loginSession('afterLogin', response.result);
  if (response.responseType === 'playbacks') return callbackData(response);
  // FIXME: to awoid having too many sessions, check how to reuse old one in maweb
  // return loginSession();
};

// post error
WSconnection.onError = (error) => {
  console.log(`WebSocket error: ${error}`);
};
