const WebSocket = require('ws')
const config = require('./config')

// init websocket client at module start to keep things simple
const ws = new WebSocket(`ws://localhost:${config.WS_PORT}/${config.WS_PATH}`)

const createCmdMessage = (cmd, msg) => {
  let type = cmd.substr(1, cmd.length - 1)
  switch (cmd) {
    case '/stats':
      let user = msg.replace(cmd, '').split(' ').pop()
      return { action: 'cmd', data: { type: type, user: user } }

    case '/popular':
      return { action: 'cmd', data: { type: type } }
  }
}

// just display data received from server to keep things simple
ws.on('message', (data) => {
  console.log(data)
})

// initial client side websocket
const start = (name) => {
  ws.send(JSON.stringify({ action: 'open', data: { user: name } }))
}

// client side send message
// will check whether the message is chat command or not
const sendMsg = (msg) => {
  let cmd = config.CHAT_COMMANDS.find(c => msg.startsWith(c))
  if (cmd) {
    let data = createCmdMessage(cmd, msg)
    ws.send(JSON.stringify(data))
  } else {
    ws.send(JSON.stringify({ action: 'msg', data: { at: new Date(), message: msg } }))
  }
}

exports.start = start
exports.sendMsg = sendMsg
