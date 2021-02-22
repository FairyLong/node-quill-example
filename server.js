const http = require('http')
const express = require('express')

const app = express()
app.use(express.static('./static'))

console.log("server is starting")

app.get('/hello', function (request, response){
  response.writeHead(200, {"Content-Type":'text/plain','charset':'utf-8'})
  response.write('hello world')
  response.end()
})

app.get('/info', function (request, response){
  response.status(200).json({server:'OK'})
  response.end()
})

const server = http.createServer(app)
server.listen(8080)

console.log("server is on service")