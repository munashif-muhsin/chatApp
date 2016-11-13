express = require 'express'
pubsub  = require '../../lib/express-io-pubsub'

app = express()

app.configure () ->
  app.use pubsub.middleware {
    channel: 'pubsub'
    host: 'localhost'
    port: 6379
    type: 'redis'
  }
app.get '/', (req, res) ->
  req.publish "lobby", "update", {msg: 'Hello World!'}
  res.send "message sent"

app.listen 3002

