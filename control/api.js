/**
 * api接口
 * @param app
 */
exports.api = function (app) {
  app.get('/hello', function (request, response){
    response.writeHead(200, {"Content-Type":'text/plain','charset':'utf-8'})
    response.write('hello world')
    response.end()
  })

  app.get('/info', function (request, response){
    response.status(200).json({server:'OK'})
    response.end()
  })
}