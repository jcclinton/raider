PORT = 0
HOST = '65.49.73.225'
SOCKET_PORT = 8000
ID = 1

http = require 'http'
fs = require 'fs'
url = require 'url'
_ = require 'underscore'
net = require 'net'
io = require 'socket.io'




socket = net.createServer (c) ->
    console.log c
    c.write "acked\n"
    c.pipe c

socket.listen SOCKET_PORT, 'localhost'


