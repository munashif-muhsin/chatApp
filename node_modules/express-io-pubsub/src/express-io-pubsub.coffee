module.exports.version = '0.1.2'

# Modules
mongo = require 'mongodb'
redis = require 'redis'

# Data Storage
class Store
  @init: (config) ->
    switch config.type
      when "mongodb" then return new MongoStore config
      when "redis" then return new RedisStore config
      else throw new Error('Invalid Storage Type')
  constructor: (@config) ->
  connect: (next) ->
    throw new Error('must override')
  insert: (room, event, data) ->
    throw new Error('must override')
  listen: (next) ->
    throw new Error('must override')

class MongoStore extends Store
  # db.createCollection('events', {capped: true, size: 10000, max: 100})
  connect: (next) ->
    return next() if @collection
    @config.collection ?= 'events'
    @config.host ?= 'localhost'
    @config.port ?= 27017

    server = new mongo.Server @config.host, @config.port, {auto_reconnect: true}
    db = new mongo.Db @config.database, server
    db.open (err, client) =>
      throw err if err
      if @config.username and @config.password
        client.authenticate @config.username, @config.password, (err) =>
          throw err if err
          @collection = new mongo.Collection client, @config.collection
          next()
      else
      @collection = new mongo.Collection client, @config.collection
      next()

  insert: (room, event, data) ->
    @connect () =>
      @collection.insert {room: room, event: event, data: data}, (err) ->
        throw err if err

  listen: (next) ->
    @connect () =>
      cursor = @collection.find {}, {tailable: true}
      stream = cursor.stream()
      stream.on 'data', (doc) ->
        next doc.room, doc.event, doc.data

class RedisStore extends Store
  connect: (next) ->
    return next() if @client
    @config.channel ?= 'pubsub'
    @config.host ?= 'localhost'
    @config.port ?= 6379

    @client = redis.createClient @config.port, @config.host
    if @config.password
      @client.auth @config.password, next
    else
      next()
  
  insert: (room, event, doc) ->
    @connect () =>
      data =
        room: room
        event: event
        doc: doc
      @client.publish @config.channel, JSON.stringify data
  
  listen: (next) ->
    @connect () =>
      @client.subscribe @config.channel
      @client.on 'message', (channel, data) ->
        data = JSON.parse data
        next data.room, data.event, data.doc

# Publishing Middleware
exports.middleware = (config) ->
  store = Store.init config
  return (req, res, next) ->
    req.publish = (room, event, data) ->
      store.insert room, event, data
    next()

# Subscription
exports.listen = (sockets, config) ->
  store = Store.init config
  store.listen (room, event, data) ->
    sockets.in(room).emit event, data

