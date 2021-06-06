const WebSocket = require('ws');

const md5 = require('md5');

const gpio = require("gpio");

const config = require('./config.json');

const WSconnection = new WebSocket(`ws://${process.env.ENDPOINT || config.maweb.endpoint}/?ma=1`);

const gpio4 = gpio.export(4, {
  direction: gpio.DIRECTION.IN,
  ready: function () { }
});

// 
// FUNCTIOS
// 
// send websocket
function sendWebsocket(msg) { WSconnection.send(JSON.stringify(msg)); }

function getsetSession(value) {
  sendWebsocket({ session: value | 0 });
}

// call data and post data from input
function mainLoop() {
  setInterval(() => {
    // call data to get playback info
    getsetSession(config.maweb.activeSession)
  }, 10000);
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
// MAINPART
//
//
//

// login websocket
WSconnection.onopen = () => loginSession();

gpio4.on("change", val => {
  console.log(val)
  switch (val) {
    case 1:
      sendWebsocket({
        requestType: 'playbacks_userInput', execIndex: 101, pageIndex: 0, buttonId: 0, pressed: true, released: false, type: 0, session: config.maweb.activeSession, maxRequests: 0,
      });
      break;
    case 0:
      sendWebsocket({
        requestType: 'playbacks_userInput', execIndex: 101, pageIndex: 0, buttonId: 0, pressed: false, released: true, type: 0, session: config.maweb.activeSession, maxRequests: 0,
      });
      break;
    default:
      break;
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
  return loginSession();
};

// post error
WSconnection.onError = (error) => {
  console.log(`WebSocket error: ${error}`);
};
