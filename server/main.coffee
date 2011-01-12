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
        @table = {}

    add: (id, obj) ->
        @table[id] = obj

    remove: (id) ->
        delete @table[id]

    get: (id) ->
        @table[id]

    getAll: ->
        @table





class Instances extends Hash
    add: () ->
        id = new Date().getTime()
        console.log "adding instance with uid: #{id}"
        instance = new Instance id
        super id, instance
        @id = id
    remove: (uid) ->
        #console.log "removing instance with uid: #{uid}"

        #remove all units with this uid
        clients = clientList.getAll()
        for id of clients
            client = @clientList.get id
            @clientList.remove id if client.getUid() is uid
        obj =
            uid: uid
            command: 'close'
            text: 'instance closed'
        client = @clientList.get uid
        super uid
    get: (uid) ->
        #console.log "getting instances with id: #{id}"
        super uid
    getAll: ->
        #console.log "getting all instances"
        super()







class Clients extends Hash
    add: (uid, clientSocket) ->
        console.log "adding client with uid: #{uid}"
        client = new Client uid, clientSocket
        super uid, client
        client
    remove: (uid) ->
        #console.log "removing client with uid: #{uid}"
        obj =
            uid: uid
            command: 'close'
            text: 'user dropped'
        client = this.get uid
        clients = this.getAll()
        for id, otherClient of clients
            otherClient.send obj, uid if otherClient isnt client
        super uid
    get: (uid) ->
        #console.log "getting client with uid: #{uid}"
        super uid
    getAll: ->
        super()











###
container class for all sprites
###
class Sprites extends Hash
    constructor: ->
        @index = 0
        super()
    add: (uid, team) ->
        #console.log "adding sprite with id: #{uid}"
        @index++
        sprite = new Sprite uid, @index, team

        id = sprite.getId()
        super id, sprite
        sprite
    get: (id) ->
        #console.log "getting sprite with id: #{id}"
        super id
    remove: (id) ->
        #console.log "removing sprite with id: #{id}"
        super id
    getAll: ->
        #console.log "getting all sprites"
        super()
    removeAllOfUser: (uid) ->
        #console.log "removing sprites with uid: #{uid}"

        #remove all units with this uid
        sprites = this.getAll()
        for id of sprites
            sprite = this.get id
            this.remove id if sprite.getUid() is uid























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
instance class for storing instance info
###
class Instance
    constructor: (@instanceId) ->
        @clientList = new Clients
        @spriteList = new Sprites
        @instanceId

    sendAll: (data, excludeUid) =>
        clients = @clientList.getAll()
        #console.log clients
        for uid of clients
            client = @clientList.get uid
            client.send data if not excludeId? or excludeId? and excludeUid isnt uid
            #console.log "client: #{client.clientSocket}"

    add: (sessionId, clientSocket) ->
        @clientList.add sessionId, clientSocket
        instanceList.add @instanceId
        console.log "adding instance (in instance.add)"








###
client class for storing client info
###
class Client
    constructor: (@uid, @clientSocket) ->
        @team = if @uid % 2 == 0 then 'light' else 'dark'

    send: (data) ->
        msg = jsonController.makeResponse data, @clientSocket.sessionId
        console.log ">>> sending to uid: #{@clientSocket.sessionId} #{msg}"
        @clientSocket.send msg
        false

    getTeam: ->
        @team
        false

    add: (data, spriteList)->
        console.log "adding sprite (in client.add)"
        sprite = spriteList.add @uid, @team

        obj =
            uid: sprite.uid
            id: sprite.id
            x: sprite.x
            y: sprite.y
            team: sprite.team
            command: 'create'
            text: 'create new object'

    move: (data, spriteList)->
        sprite = spriteList.get data.id
        sprite.move data
        console.log "moving"
        obj =
            uid: data.uid
            id: data.id
            x: sprite.getX()
            y: sprite.getY()
            command: 'move'
            text: 'moving'

    fire: (data)->
        console.log "firing"
        obj =
            uid: data.uid
            id: data.id
            eid: data.eid
            command: 'fire'
            text: 'firing'









###
sprite class for storing sprite info
###
class Sprite
    constructor: (@uid, @id, @team) ->
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

        #client = clientList.get @uid
        #@team = client.getTeam()
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
        @instanceList = new Instances


        #hack to get instance initialized
        instanceId = @instanceList.add()
        instance = @instanceList.get instanceId

        @masterSocket.on 'connection', (clientSocket) =>
            #console.log clientSocket



            client = instance.clientList.add clientSocket.sessionId, clientSocket

            #send init function to this client to initialize interface
            data =
                command:'init'
                uid:clientSocket.sessionId
                text: 'initializing new client'
            client.send data

            #send all existing sprites to the new client
            sprites = instance.spriteList.getAll()
            for id of sprites
                sprite = instance.spriteList.get id
                data =
                    command: 'create'
                    uid: sprite.getUid()
                    id: sprite.getId()
                    text: 'initially create other objects'
                    x: sprite.getX()
                    y: sprite.getY()
                    team: sprite.getTeam()
                client.send data


            clientSocket.on 'message', (data) =>
                console.log "<<< receiving #{data}"
                obj = jsonController.getObject data
                action = obj.action
                uid = obj.uid
                client = instance.clientList.get uid
                #console.log client if client?
                retData = (client[action])(obj, instance.spriteList) if client?
                if retData
                    clients = instance.clientList.getAll()
                    for clientId, otherClient of clients
                        otherClient.send retData

                #console.log "ran command: #{action}"

            clientSocket.on 'disconnect', =>
                instance.clientList.remove clientSocket.sessionId
                instance.spriteList.removeAllOfUser clientSocket.sessionId
                console.log 'disconnecting'



socketController = new SocketController()
