PORT = 8000
connect = require 'connect'


cookie_obj =
    secret: 'darth vader'
    cookie:
        maxAge: 60000

server = connect(
    connect.cookieParser(),
    connect.session(cookie_obj),
    connect.favicon(),
    (req, res, next) ->
        sess = req.session
        id = req.sessionID
        #console.log "key: #{JSON.stringify req.cookie}"
        if (sess.views)
            res.setHeader('Content-Type', 'text/html')
            res.end('<p>views: ' + sess.views + '<br/><br/>for<br/><br/>' + id + '</p>')
            sess.views++
        else
            sess.views = 1
            #stays alive as long as the browser is open
            sess.cookie.expires = false;
            res.end('welcome to the session demo. refresh!')
)

server.listen(PORT)















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
