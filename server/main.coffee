IP_ADDRESS = '65.49.73.225'
PORT = 8000

###
start http server
###

http = require 'http'
io = require '/home/jclinton/projects/socket.io'
fs = require 'fs'
server = http.createServer (req, res) ->
   # html = fs.readFileSync '/home/jclinton/projects/2d/client.php'
    res.writeHead 200, {'Content-Type': 'text/html'}
    console.log 'request served'
    res.end "<h1>Welcome!</h1>"

server.listen PORT, IP_ADDRESS
#console.log 'listening'





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
        @table[id]

    getAll: ->
        @table








class Clients extends Hash
    add: (uid, clientSocket) ->
        #console.log "adding client with uid: #{uid}"
        client = new Client uid, clientSocket
        super uid, client
    remove: (uid) ->
        #console.log "removing client with uid: #{uid}"

        #remove all units with this uid
        sprites = spriteList.getAll()
        for id of sprites
            sprite = spriteList.get id
            spriteList.remove id if sprite.getUid() is uid
        obj =
            uid: uid
            command: 'close'
            text: 'user dropped'
        client = clientList.get uid
        socketController.sendAll obj, uid
        super uid
    get: (uid) ->
        #console.log "getting client with uid: #{uid}"
        super uid
    getAll: ->
        #console.log "getting all clients"
        super()

clientList = new Clients










###
container class for all sprites
###
class Sprites extends Hash
    constructor: ->
        @index = 0
        super()
    add: (uid) ->
        #console.log "adding sprite with id: #{uid}"
        @index++
        sprite = new Sprite uid, @index
        id = sprite.getId()
        super id, sprite
    get: (id) ->
        #console.log "getting sprite with id: #{id}"
        super id
    remove: (id) ->
        #console.log "removing sprite with id: #{id}"
        super id
    getAll: ->
        #console.log "getting all sprites"
        super()

spriteList = new Sprites










###
handles json requests
###
jsonController =
    makeResponse:
        (obj, sending_uid) ->
            is_me = if sending_uid == obj.uid then 1 else 0
            console.log "***no obj.uid provided!***" if not obj.uid?
            str = ''
            for key, value of obj
                str = "#{str} #{key}:'#{value}', "
            "{status: 'success', #{str} is_me: #{is_me}}"
    getObject:
        (msg) ->
            eval "ret = #{msg}"












###
client class for storing client info
###
class Client
    constructor: (@uid, @clientSocket) ->
        @team = if @uid % 2 == 0 then 'light' else 'dark'

    getTeam: ->
        @team

    add: ->
        spriteList.add @uid
        console.log "adding sprite (in client.add)"

    move: (data)->
        sprite = spriteList.get data.id
        #console.log "sprite: #{sprite}"
        sprite.move data
        obj =
            uid: data.uid
            id: data.id
            x: sprite.getX()
            y: sprite.getY()
            command: 'move'
            text: 'moving'
        socketController.sendAll obj
        console.log "moving"









###
sprite class for storing sprite info
###
class Sprite
    constructor: (@uid, @id) ->
        #initial positioning:
        modulo = (@uid %2) == 0
        max = 400
        dx = if modulo then 50 else 0
        dy = if modulo then 0 else 50
        base = 20

        @x = base + dx * @id
        @y = base + dy * @id

        @x = @x - (Math.floor @x/max)*max if @x > max
        @y = @y - (Math.floor @y/max)*max if @y > max

        client = clientList.get @uid
        @team = client.getTeam()
        obj =
            uid: @uid
            id: @id
            x: @x
            y: @y
            command: 'create'
            text: 'create new object'
            team: @team
        socketController.sendAll obj
        console.log "adding sprite with uid: #{@uid} and id: #{@id} in sprite constructor"

    move: (data) ->
        @x = data.x
        @y = data.y

    getId: ->
        @id
    getX: ->
        @x
    getY: ->
        @y
    getUid: ->
        @uid
    getTeam: ->
        @team








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
                console.log "<<< receiving #{data}"
                obj = jsonController.getObject data
                action = obj.action
                uid = obj.uid
                client = clientList.get uid
                #console.log client if client?
                (client[action])(obj) if client?
                #console.log "ran command: #{action}"
            clientSocket.on 'disconnect', ->
                clientList.remove clientSocket.sessionId
                console.log 'disconnecting'

            #send init function to this client to initialize interface
            obj =
                command:'init'
                uid:clientSocket.sessionId
                text: 'initializing new client'
            socketController.send clientSocket, obj

            #send all existing sprites to the new client
            sprites = spriteList.getAll()
            for id of sprites
                sprite = spriteList.get id
                obj =
                    command: 'create'
                    uid: sprite.getUid()
                    id: sprite.getId()
                    text: 'initially create other objects'
                    x: sprite.getX()
                    y: sprite.getY()
                    team: sprite.getTeam()
                socketController.send clientSocket, obj


    send: (clientSocket, data) ->
        msg = jsonController.makeResponse data, clientSocket.sessionId
        clientSocket.send msg
        console.log ">>> sending to uid: #{clientSocket.sessionId} #{msg}"

    sendAll: (data, excludeUid) ->
        clients = clientList.getAll()
        #console.log clients
        for uid of clients
            client = clientList.get uid
            socketController.send client.clientSocket, data if not excludeId? or excludeId? and excludeUid isnt uid
            #console.log "client: #{client.clientSocket}"



socketController = new SocketController()
