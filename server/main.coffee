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
class Hash
    constructor: ->
        @table = []

    add: (id, obj) ->
        @table[id] = obj

    remove: (id) ->
        delete @table[id]

    get: (id) ->
        ret = @table[id]


class Clients extends Hash
    add: (uid, clientSocket) ->
        console.log "adding client with uid: #{uid}"
        client = new Client uid, clientSocket
        super uid, client
    remove: (uid) ->
        console.log "removing client with uid: #{uid}"
        super uid
    get: (uid) ->
        console.log "getting client with uid: #{uid}"
        ret = super uid

clientList = new Clients


###
container class for all sprites
###
class Sprites extends Hash
    constructor: ->
        @index = 0
        super()
    add: (uid) ->
        console.log "adding sprite with id: #{uid}"
        @index++
        sprite = new Sprite uid, @index
        super uid, sprite
    remove: (uid) ->
        console.log "removing sprite with id: #{uid}"
        super uid

spriteList = new Sprites


###
handles json requests
###
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
client class for storing client info
###
class Client
    constructor: (@uid, @clientSocket) ->

    add: ->
        spriteList.add @uid
        console.log "adding sprite"


###
sprite class for storing sprite info
###
class Sprite
    constructor: (@uid, @id) ->
        console.log "adding sprite with uid: #{@uid} and id: #{@id}"


###
begin listening for websockets
###
class SocketController
    constructor: ->
        @masterSocket = io.listen server
        @masterSocket.on 'connection', (clientSocket) ->
            #console.log clientSocket
            clientList.add clientSocket.sessionId, clientSocket

            clientSocket.on 'message', (data) ->
                #console.log data
                obj = jsonController.getObject data
                action = obj.action
                uid = obj.uid
                client = clientList.get uid
                #console.log client if client?
                (client[action])() if client?
                console.log "ran command: #{action}"
            clientSocket.on 'disconnect', ->
                clientList.remove clientSocket.sessionId
                console.log 'disconnecting'

            #send init function to this client to initialize interface
            obj =
                command:'init'
                uid:clientSocket.sessionId
                text: 'initializing new client'
            msg = jsonController.makeResponse obj
            console.log "sending #{msg}"
            clientSocket.send msg

            #send all existing sprites to the new client
    send: (msg) ->
        @masterSocket.send msg

socketController = new SocketController()
