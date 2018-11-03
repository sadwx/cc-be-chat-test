const WebSocket = require('ws')
const profanity = require('./profanity')
const config = require('./config')

// all connected users
const users = []

// last messages, only store last 50
var latestMessages = []

// for composing user online time stats
const formatDuration = (duration) => {
  let s = parseInt(duration / 1000)
  let m = parseInt(duration / (60 * 1000))
  let h = parseInt(duration / (3600 * 1000))
  let d = parseInt(duration / (86400 * 1000))
  return `${d.toString().padStart(2, '0')}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

// processing chat commands
const processCmd = (cmd) => {
  switch (cmd.type) {
    case 'popular':
      return popular()

    case 'stats':
      let user = users.find(u => u.name === cmd.user)
      if (user) {
        let now = new Date()
        console.log(`now: ${now}, user: ${user.startAt}`)
        let duration = now.getTime() - user.startAt.getTime()
        return formatDuration(duration)
      }
      return null

    default:
      return null
  }
}

// composing last messages
const getLatestMessages = () => {
  let messages = latestMessages
    .slice()
    .reverse()
    .map(msg => `[${msg.at.toLocaleString()}] ${msg.user}: ${msg.msg}`)
  return messages.length > 0 ? messages.join('\n') : null
}

// count the most popular words
const popular = () => {
  let now = new Date().getTime()
  let popularity = new Map([])
  let mostPopularWord = 'no popular words'
  let popular = 0
  latestMessages.filter(m => now - m.at.getTime() < config.POPULAR_WORD_DURATION)
    .flatMap(m => m.msg.split(' '))
    .forEach(w => {
      let count = 1
      if (popularity.has(w)) {
        count = popularity.get(w) + 1
      }
      popularity.set(w, count)

      if (count > popular) {
        popular = count
        mostPopularWord = w
      }
    })
  return mostPopularWord
}

const start = (options) => {
  // init server side websocket
  const wss = new WebSocket.Server(options)

  // Broadcast to all.
  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      let json = JSON.parse(data)
      let response = null

      switch (json.action) {
        case 'open':
          let user = users.find(u => u.name === json.data.user)
          if (!user) {
            user = { name: json.data.user, startAt: new Date() }
            users.push(user)
            ws.user = user
          }
          break

        case 'msg':
          let time = new Date(json.data.at)
          let msg = profanity.check(json.data.message)
          response = `[${time.toLocaleString()}] ${ws.user.name}: ${msg}`
          latestMessages.push({ user: ws.user.name, msg: msg, at: time })

          // keep only last 50 messages
          if (latestMessages.length > 50) {
            latestMessages = latestMessages.slice(-(latestMessages.length - 50 + 1), latestMessages.length + 1)
          }
          break

        case 'cmd':
          let cmd = json.data
          response = processCmd(cmd)
          break

        default:
          response = 'unknown action'
      }

      // only when response has something to send
      if (response) {
        wss.broadcast(response)
      }
    })

    // when a client connected, send the latest messages to client
    let messages = getLatestMessages()
    if (messages) {
      ws.send(messages)
    }
  })
}

exports.start = start
