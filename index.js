const inquirer = require('inquirer')
const wsServer = require('./wsServer')
const WsClient = require('./wsClient')

// start server side websocket
wsServer.start()

const run = async () => {
  const { name } = await askName()
  let wsClient = new WsClient()
  // start connect client side websocket after user has input name
  wsClient.start(name, (data) => console.log(data), error => console.error(error))
  while (true) {
    const answers = await askChat()
    const { message } = answers
    // send messages through websocket
    wsClient.sendMsg(message)
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
