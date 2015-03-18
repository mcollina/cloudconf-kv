#! /usr/bin/env node

var server = require('http').createServer(handler)
var concat = require('concat-stream')
var redis = require('redis').createClient(6379, process.env.REDIS_HOST)
var port = process.env.PORT || 3000

function handler (req, res) {
  var method = req.method

  switch (method) {
    case 'POST':
      req.pipe(concat(function (data) {
        redis.set(req.url, data, function (err) {
          if (err) {
            res.statusCode = 500
            return res.end(err.message)
          }

          res.setHeader('Location', req.url)
          res.statusCode = 201
          res.end()
        })
      }))
      break
    case 'GET':
      redis.get(req.url, function (err, data) {
        if (err) {
          res.statusCode = 500
          return res.end(err.message)
        }

        res.end(data)
      })
      break
    default:
      res.statusCode = 500
      res.end('not supported')
  }
}

server.listen(port, function () {
  console.log('listening', port)
})
