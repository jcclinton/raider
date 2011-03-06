IP_ADDRESS = '65.49.73.225'
PORT = 8000

###
start http server
###

http = require 'http'


server = http.createServer (req, res) ->
    res.writeHead 200, {'Content-Type': 'text/html'}
    console.log 'request served'
    res.end "<h1>Welcome!</h1>"

server.listen PORT, IP_ADDRESS




ex = require '/home/public_html/65.49.73.225/public/server/ghost/ghost.coffee'
ghost = ex.getGhost

ghost.run server





Sprite = ghost.getSprite()

Sprite::init = ->
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

    #console.log "adding NEW sprite with uid: #{@uid} and id: #{@id} in sprite constructor"

Sprite::move = (data) ->
    @x = data.x if data.x?
    @y = data.y if data.y?
Sprite::getId = ->
    @id
Sprite::getX = ->
    @x
Sprite::getY = ->
	@y
Sprite::getUid = ->
	@uid
Sprite::getTeam = ->
	@team









Client = ghost.getClient()

Client::init = ->
	true

Client::add = (data, spriteList)->
    ghost.log "adding sprite (in client.add)", 2
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
    ghost.log "moving", 2
    obj =
        uid: data.uid
        id: data.id
        x: sprite.getX()
        y: sprite.getY()
        command: 'move'
        text: 'moving'

Client::fire = (data)->
    ghost.log "firing", 2
    obj =
        uid: data.uid
        id: data.id
        eid: data.eid
        command: 'fire'
        text: 'firing'
