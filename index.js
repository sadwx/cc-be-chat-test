const inquirer = require('inquirer')
const config = require('./config')
const wsServer = require('./wsServer')
const WsClient = require('./wsClient')

// start server side websocket
wsServer.start({ port: config.WS_PORT })

const run = async () => {
  const { name } = await askName()
  // start connect client side websocket after user has input name
  WsClient.start(name)
  while (true) {
    const answers = await askChat()
    const { message } = answers
    // send messages through websocket
    WsClient.sendMsg(message)
  }
}

const askChat = () => {
  const questions = [
    {
      name: 'message',
      type: 'input',
      message: 'Enter chat message:'
    }
  ]
  return inquirer.prompt(questions)
}

const askName = () => {
  const questions = [
    {
      name: 'name',
      type: 'input',
      message: 'Enter your name:'
    }
  ]
  return inquirer.prompt(questions)
}

run()
