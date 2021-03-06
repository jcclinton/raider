###
custom logging wrapper around console.log
###
class consoleWrapper
    constructor: ->
        ###
        formats:
            0 - shows json string as it is
            1 - shows json string formatted neatly
            2 - show both
        ###
        @outputFormat = 1


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
        if(not _.isNumber(level) or level > @maxLevel or level < @minLevel)
            this.trueLog "invalid number: #{level} passed into custom logging"
        else if (level <= @level)
            this.trueLog msg
    setLevel: (level) ->
        if( _.isNumber(level) and level <= @maxLevel and level >= @minLevel)
            @level = level
    setMaxLevel: (level) ->
        if( _.isNumber(level) and level >= @minLevel)
            @level = level
    setMinLevel: (level) ->
        if( _.isNumber(level) and level <= @maxLevel)
            @level = level
    trueLog: (msg) ->
        if @outputFormat == 0
            output = msg
        else if @outputFormat is 1 or @outputFormat is 2
            output = msg.replace(/"/g, '')
            output = output.replace(/{/g, '\n\t')
            output = output.replace(/\, /g, '\n\t')
            output = output.replace(/}/g, '')

        output = msg + '\n' + output if @outputFormat is 2

        output = '\n' + output + '\n'

        console.log output

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
        instance = instanceList.get uid
        instance.destruct()
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
        sprite.init()

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
                str = "#{str} \"#{key}\":\"#{value}\","
            "{\"status\": \"success\",#{str} \"is_me\": #{is_me}}"
    getObject:
        (msg) ->
            try
                JSON.parse msg
            catch error
                {}



























###
instance class for storing instance info
###
class Instance
    constructor: (@instanceId) ->
        @clientList = new Clients
        @spriteList = new Sprites
    destruct: ->
        #remove all units with this uid
        clients = @clientList.getAll()
        for id of clients
            client = @clientList.get id
            @clientList.remove id if client.getUid() is uid

    addClient: (client) ->
        @clientList.add client
        client.instanceId = @instanceId
        masterList.add client.sessionId, client

        try
            specific_table = JSON.stringify masterList
        catch error
            specific_table = 'ERROR'
        logger.log "adding #{client.sessionId} to #{specific_table}",1

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
    constructor: (@sessionId) ->
        @uid = @sessionId
        true
    setSocket: (@clientSocket) ->
        @uid = @clientSocket.sessionId
        @team = if @uid % 2 == 0 then 'light' else 'dark'
    init: ->
        true
    send: (data) ->
        if @clientSocket
            msg = jsonController.makeResponse data, @clientSocket.sessionId
            logger.log ">>>>>> sending to uid: #{@clientSocket.sessionId} #{msg}", 1
            @clientSocket.send msg
        false
    getTeam: ->
        @team










###
sprite class for storing sprite info
###
class Sprite
    constructor: (@uid, @id, @team) ->
        true
    init: ->
        true








###
begin listening for sockets
###
class SocketController
    constructor: (server)->
        @masterSocket = io.listen server

        @currentSessionId = 0

        @masterSocket.on 'connection', (clientSocket) =>
            #is there an easier way to get the sid than this:
            sid = clientSocket.request.headers.cookie.split 'connect.sid='
            sid = unescape sid[1]
            client = masterList.get sid

            if client == undefined
                return false


            masterList.remove client.sessionId
            client.setSocket clientSocket
            instance = instanceList.get client.instanceId

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
                    # game specific here
                    team: sprite.getTeam()
                client.send data


            clientSocket.on 'message', (data) =>
                logger.log "<<< receiving from uid: #{client.uid} #{data}", 1
                obj = jsonController.getObject data
                action = obj.action
                uid = obj.uid
                returnData = obj.returnData || true;

                if not _.isFunction client[action]
                    logger.log "WARNING: no action: '#{action}' in Client", 1
                else
                    obj = (client[action])(obj, instance.spriteList)
                    if obj
                        clients = instance.clientList.getAll()
                        for clientId, otherClient of clients

                            # if we dont want to send data to this client:
                            if clientId == client.uid && returnData == false
                                shouldSend = false
                            else
                                shouldSend = true

                            otherClient.send obj if shouldSend


                #console.log "ran command: #{action}"

            clientSocket.on 'disconnect', =>
                instance.clientList.remove sid
                instance.spriteList.removeAllOfUser clientSocket.sessionId
                logger.log 'disconnecting', 1


###
REQUIRED DEPENDENCIES
###
_ = require 'underscore'
io = require 'socket.io'


masterList = new List()

instanceList = new Instances()
logger = new consoleWrapper()

Ghost =
    run:
        (server) ->
            #console.log 'running!!'
            socketController = new SocketController(server)
    getSprite:
        ->
            Sprite
    Client: Client
    instanceList: instanceList
    getInstanceList:
        ->
            instanceList
    log:
        (msg, level) ->
            logger.log msg, level


exports.getGhost = Ghost


