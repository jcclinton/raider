PORT = 80
connect = require 'connect'
fs = require 'fs'
url = require 'url'
_ = require 'underscore'

ex = require '/home/public_html/65.49.73.225/public/server/ghost/ghost.coffee'
ghost = ex.getGhost
instanceList = ghost.getInstanceList()
instanceList.add 1


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


        ajax = false

        path = url.parse req.url, true

        #ghetto url handling
        if path.pathname == '/'
            name = '/index.html'
            type = 'text/html'
        else if path.pathname == '/ajax.html'
            name = '/ajax.html'
            type = 'text/html'
            ajax = true
        else
            name = req.url
            type = 'text/javascript'

        if not sess.views?
            sess.views = 1
            #stays alive as long as the browser is open
            sess.cookie.expires = false
            console.log "starting new session on #{name}"

        res.setHeader 'Content-Type', type

        if ajax
            query = path.query
            data = "status": "success"
            #console.log query

            if query.action == "getInstanceList"
                data["instanceList"] = instanceList.getAll()
            else if query.action == "removeInstance"
                id = parseInt query.instanceId
                exists = instanceList.get id
                if exists and _.isNumber id
                    instanceList.remove id
                    data["instanceId"] = id
            else if query.action == "enterInstance"
                id = parseInt query.instanceId
                instance = instanceList.get id
                if instance and _.isNumber id
                    client = new ghost.Client sess.id
                    instance.addClient client
                    data["instanceId"] = id
            else if query.action == "addInstance"
                start = 0
                while instanceList.get ++start
                    id = start
                id = start
                exists = instanceList.get id
                if not exists and _.isNumber id
                    instanceList.add id
                    data["instanceId"] = id
            else if query.action == "leaveInstance"
                id = parseInt query.instanceId
                exists = instanceList.get id
                if exists and _.isNumber id
                    data["instanceId"] = id
            else
                console.warn 'doh!'

            try
                str = JSON.stringify data
            catch error
                str = 'ERROR'
            console.log "sending: #{str}"
            res.end str
        else
            fs.readFile "/home/public_html/65.49.73.225/public#{name}", (err, page) ->
                res.end page
)

server.listen(PORT)
















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









ghost.Client::init = ->
	true

ghost.Client::add = (data, spriteList)->
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

ghost.Client::move = (data, spriteList)->
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

ghost.Client::fire = (data)->
    ghost.log "firing", 2
    obj =
        uid: data.uid
        id: data.id
        eid: data.eid
        command: 'fire'
        text: 'firing'
