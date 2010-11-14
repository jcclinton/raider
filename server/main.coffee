IP_ADDRESS = '65.49.73.225'
PORT = 8000

###
start http server
###

http = require 'http'
io = require '/home/jclinton/projects/socket.io'
fs = require 'fs'
server = http.createServer (req, res) ->
    html = fs.readFileSync '/home/jclinton/projects/2d/client.php'
    res.writeHead 200, {'Content-Type': 'text/html'}
    console.log 'request served'
    res.end html

server.listen PORT, IP_ADDRESS
console.log 'listening'

###
container class for all clients
###
class hash
    constructor: ->
        @table = []

    add: (id, obj) ->
        @table[id] = obj

    remove: (id) ->
        delete @table[id]

class clients extends hash
    add: (id, client) ->
        console.log "adding client with id: #{id}"
        super id, client
    remove: (id) ->
        console.log "removing client with id: #{id}"
        super id

clientList = new clients

jsonController =
    makeResponse:
        (obj) ->
            str = ''
            for key, value of obj
                str = "#{str} #{key}:'#{value}', "
            "{status: 'success', #{str}}"
    getObject:
        (msg) ->
            eval "ret = #{msg}"

###
begin listening for websockets
###
class SocketController
    constructor: ->
        socket = io.listen server
        @socket = socket
        @socket.on 'connection', (client) ->
            #console.log client
            clientList.add client.sessionId, client

            client.on 'message', (data) ->
                #console.log data
                obj = jsonController.getObject data
                console.log obj
            client.on 'disconnect', ->
                clientList.remove client.sessionId
                console.log 'disconnecting'

            #send init function to this client to initialize interface
            obj =
                command:'init'
                uid:client.sessionId
                text: 'initializing new client'
            msg = jsonController.makeResponse obj
            console.log "sending #{msg}"
            client.send msg

            #send all existing units to the new client
    send: (msg) ->
        @socket.send msg

socketController = new SocketController()
