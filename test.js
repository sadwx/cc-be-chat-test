import test from 'ava'
import WsClient from './wsClient'
import wsServer from './wsServer'

wsServer.start()

test.cb('multiple client connects', t => {
  let client1 = new WsClient()
  client1.start('client1', data => {
    if (data === 'client1 connected') {
      t.pass()
    }
  })

  let client2 = new WsClient()
  client2.start('client2', data => {
    if (data === 'client2 connected') {
      t.true(wsServer.users.length - 2 >= 0)
      t.pass()
      t.end()
    }
  })
})

test.cb('chat without profanity', t => {
  let client = new WsClient()
  client.start('client_without_profanity', data => {
    if (data.indexOf('abc+123-def') > 0) {
      t.pass()
      t.end()
    }
  }, () => { client.sendMsg('abc+123-def') })
})

test.cb('chat with profanity', t => {
  let client = new WsClient()
  client.start('client_with_profanity', data => {
    if (data.indexOf('client_with_profanity: ***** *****') > 0) {
      t.pass()
      t.end()
    }
  }, () => { client.sendMsg('willy willy') })
})

test.cb('stats after 3 seconds', t => {
  let client = new WsClient()
  let failTimeout = null
  client.start('stats_client', data => {
    console.log(data)
    if (data === '00d 00h 00m 02s' || data === '00d 00h 00m 03s') {
      if (failTimeout) {
        clearTimeout(failTimeout)
      }

      t.pass()
      t.end()
    }
  }, () => {
    setTimeout(() => {
      console.log('send stats cmd')
      client.sendMsg('/stats stats_client')
    }, 3000)
    failTimeout = setTimeout(() => {
      clearTimeout(failTimeout)
      t.fail()
      t.end()
    }, 10000)
  })
})

test.cb('popular words', t => {
  let client = new WsClient()
  let cmdSent = false
  let failTimeout = null
  client.start('popular_client', data => {
    console.log(data)
    if (cmdSent && data === '123') {
      if (failTimeout) {
        clearTimeout(failTimeout)
      }

      t.pass()
      t.end()
    }
  }, () => {
    client.sendMsg('test 123 abc cc be chat test')
    client.sendMsg('123 abc def cc be chat')
    client.sendMsg('123')
    client.sendMsg('adef willy willy 123')
    client.sendMsg('fffff 123 123 123')
    client.sendMsg('willy willy willy willy willy willy willy')
    client.sendMsg('/popular')
    cmdSent = true
    failTimeout = setTimeout(() => {
      clearTimeout(failTimeout)
      t.fail()
      t.end()
    }, 10000)
  })
})
