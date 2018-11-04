const WebSocket = require('ws')
const config = require('./config')

// init websocket client at module start to keep things simple
// const ws = new WebSocket(`ws://localhost:${config.WS_PORT}`)

function WsClient() {
  this.ws = null
  this.createCmdMessage = (cmd, msg) => {
    let type = cmd.substr(1, cmd.length - 1)
    switch (cmd) {
      case '/stats':
        let user = msg.replace(cmd, '').split(' ').pop()
        return { action: 'cmd', data: { type: type, user: user } }

      case '/popular':
        return { action: 'cmd', data: { type: type } }
    }
  }

  // initial client side websocket
  this.start = (name, onMessage, onOpen, onError) => {
    // init websocket client at module start to keep things simple
    this.ws = new WebSocket(`ws://localhost:${config.WS_PORT}`)
    // just display data received from server to keep things simple
    this.ws.on('open', () => {
      this.ws.send(JSON.stringify({ action: 'open', data: { user: name } }))
      if (onOpen) {
        onOpen()
      }
    })
    this.ws.on('message', data => {
      if (onMessage) {
        onMessage(data)
      }
    })
    this.ws.on('error', error => {
      if (onError) {
        onError(error)
      }
    })
  }

  // client side send message
  // will check whether the message is chat command or not
  this.sendMsg = (msg) => {
    let cmd = config.CHAT_COMMANDS.find(c => msg.startsWith(c))
    if (cmd) {
      let data = this.createCmdMessage(cmd, msg)
      this.ws.send(JSON.stringify(data))
    } else {
      this.ws.send(JSON.stringify({ action: 'msg', data: { at: new Date(), message: msg } }))
    }
  }
}
module.exports = WsClient
