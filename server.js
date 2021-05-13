const http = require('http')
const express = require('express')

const app = express()
app.use(express.static('./static'))

console.log("server is starting")

const server = http.createServer(app)
server.listen(8080)

console.log("server is on service")
