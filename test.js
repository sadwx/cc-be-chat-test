import test from 'ava'
import wsClient from './wsClient'
import wsServer from './wsServer'
import config from './config'

test('multiple client connects', t => {
  wsServer.start({ port: config.WS_PORT })
  wsClient.start()
})

test('bar', async t => {
  const bar = Promise.resolve('bar')

  t.is(await bar, 'bar')
})
