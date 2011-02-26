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




ghost = require '/home/public_html/65.49.73.225/public/server/ghost/ghost.coffee'

ghost.run server, io