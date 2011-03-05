IP_ADDRESS = '65.49.73.225'
PORT = 8000

###
start http server
###

http = require 'http'
io = require '/home/jclinton/projects/socket.io'


server = http.createServer (req, res) ->
    res.writeHead 200, {'Content-Type': 'text/html'}
    console.log 'request served'
    res.end "<h1>Welcome!</h1>"

server.listen PORT, IP_ADDRESS




ghostLib = require '/home/public_html/65.49.73.225/public/server/ghost/ghost.coffee'
ghost = ghostLib.getGhost

ghost.run server, io




###
sprite class for storing sprite info
###
class newSprite
    constructor: (@uid, @id, @team) ->
                # game specific here
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

        @x = 0
        @y = 0

        console.log "adding NEW sprite with uid: #{@uid} and id: #{@id} in sprite constructor"

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

ghost.sprite newSprite


Client = ghost.getClient()

Client::add = (data, spriteList)->
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

Client::move = (data, spriteList)->
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

Client::fire = (data)->
    console.log "firing"
    obj =
        uid: data.uid
        id: data.id
        eid: data.eid
        command: 'fire'
        text: 'firing'
