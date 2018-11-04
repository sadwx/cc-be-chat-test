run `node index.js` in terminal to run the chat client
run `npm test` in terminal to run unit test

I also provide a simple websocket test html after chat serve is running, just open `websocket test.html` in your browser and open as many tab as you like.

## Used NPM
This project uses NPM modules as below:

`ws`: which is specified by requirement.

`inquirer`: which is for CLI chat client included in the origin repository.

`ava`: which is for unit test

## System Design Decision
This project uses only websocket to send message and chat commands.

Because message is sent between users and every client will construct a websocket to server,
we just utilitize the network traffics by using only websocket for communications.

The client side is responsible for composing proper message format before send to server.

The server side is responsible for checking profanity words and decide the target to be broadcast.

## Scaling Concerns
Since the connections would be bounded by port numbers, once the websocket server can't accept connections, the only way to sacle is to scale hardware or VM.