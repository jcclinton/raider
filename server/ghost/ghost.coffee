###
custom logging wrapper around console.log
###
class consoleWrapper
    constructor: ->
        ###
            levels:
                0 - show nothing
                1 - show essentials
                2 - show everything
        ###

        #change this value to change logging level:
        @level = 1

        @maxLevel = 2
        @minLevel = 0
    log: (msg, level) ->
        if(not _.isNumber(level) or level >= @maxLevel or level <= @minLevel)
            this.log 'invalid number passed into custom logging'
        else if (level <= @level)
            this.log msg
    setLevel: (level) ->
        if( _.isNumber(level) and level <= @maxLevel and level >= @minLevel)
            @level = level
    setMaxLevel: (level) ->
        if( _.isNumber(level) and level >= @minLevel)
            @level = level
    setMinLevel: (level) ->
        if( _.isNumber(level) and level <= @maxLevel)
            @level = level
    log: (msg) ->
        console.log msg
logger = new consoleWrapper()

###
container class for all clients
###
class List
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





class Instances extends List
    add: (id) ->
        #id = new Date().getTime()
        #console.log "adding instance with uid: #{id}"
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







class Clients extends List
    add: (client) ->
        super client.uid, client
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
class Sprites extends List
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
            logger.log "***no obj.uid provided!***", 1 if not obj.uid
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

    addClient: (client) ->
        @clientList.add client

        #send all existing sprites to the new client
        sprites = @spriteList.getAll()
        for id of sprites
            sprite = @spriteList.get id
            data =
                command: 'create'
                uid: sprite.getUid()
                id: sprite.getId()
                text: 'initially create other objects'
                x: sprite.getX()
                y: sprite.getY()
                # game specific here
                team: sprite.getTeam()
            client.send data

    sendAll: (data, excludeUid) =>
        clients = @clientList.getAll()
        #console.log clients
        for uid of clients
            client = @clientList.get uid
            client.send data if not excludeId? or excludeId? and excludeUid isnt uid
            #console.log "client: #{client.clientSocket}"








###
client class for storing client info
###
class Client
    constructor: (@clientSocket) ->
        @uid = @clientSocket.sessionId
                # game specific here
        @team = if @uid % 2 == 0 then 'light' else 'dark'
        @instance = null
    init: ->
        true

    send: (data) ->
        msg = jsonController.makeResponse data, @clientSocket.sessionId
        logger.log ">>> sending to uid: #{@clientSocket.sessionId} #{msg}", 1
        @clientSocket.send msg
        false
    getInstance: ->
        @instance

    getTeam: ->
        @team

    attachToInstance: (data)->
        logger.log "adding #{@uid} to instance #{data.iId}", 1
        iId = data.iId
        instance = instanceList.get iId
        if not instance
            instanceList.add iId
            instance = instanceList.get iId


        #console.log "attaching to instance: #{iId}"
        instance.addClient this
        @instance = instance










###
sprite class for storing sprite info
###
class Sprite
    constructor: (@uid, @id, @team) ->
        logger.log "warning: creating empty sprite", 1








###
begin listening for sockets
###
class SocketController
    constructor: (server, io, options)->
        @masterSocket = io.listen server


        #hack to get instance initialized
        #instanceId = @instanceList.add()
        #instance = @instanceList.get instanceId

        @masterSocket.on 'connection', (clientSocket) =>

            client = new Client clientSocket
            # init will hold any custom code by the end user to be run on client contsruction
            client.init()

            #send init function to this client to initialize interface
            data =
                command:'init'
                uid:clientSocket.sessionId
                text: 'initializing new client'
            client.send data

            clientSocket.on 'message', (data) =>
                logger.log "<<< receiving #{data}", 1
                obj = jsonController.getObject data
                action = obj.action
                uid = obj.uid

                inst = client.getInstance()

                if(inst)
                    retData = (client[action])(obj, inst.spriteList)
                    if retData
                        clients = inst.clientList.getAll()
                        for clientId, otherClient of clients
                            otherClient.send retData
                else if action == 'instance'
                    client.attachToInstance(obj)


                #console.log "ran command: #{action}"

            clientSocket.on 'disconnect', =>
                inst = client.getInstance()
                inst.clientList.remove clientSocket.sessionId if inst?
                inst.spriteList.removeAllOfUser clientSocket.sessionId if inst?
                logger.log 'disconnecting', 1



instanceList = new Instances

_ = require '/home/public_html/65.49.73.225/public/underscore.js'

Ghost =
    run:
        (server, io, options) ->
            #console.log 'running!!'
            socketController = new SocketController(server, io, options)
    sprite:
        (newSprite) ->
            Sprite = newSprite
    getClient:
        ->
            Client

exports.getGhost = Ghost

