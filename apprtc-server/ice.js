var express = require('express')
var crypto = require('crypto')
var app = express()
const https = require("https"), fs = require("fs");

const options = {
  key: fs.readFileSync("/cert/key.pem"),
  cert: fs.readFileSync("/cert/cert.pem")
};

var hmac = function (key, content) {
  var method = crypto.createHmac('sha1', key)
  method.setEncoding('base64')
  method.write(content)
  method.end()
  return method.read()
}

function handleIceRequest(req, resp) {
  var query = req.query
  var key = '4080218913'
  var time_to_live = 600
  var timestamp = Math.floor(Date.now() / 1000) + time_to_live
  var turn_username = timestamp + ':ninefingers'
  var password = hmac(key, turn_username)

	// http://expressjs.com/en/4x/api.html#res.set
	resp.set({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
		'Access-Control-Allow-Headers': 'Content-Type,Authorization'
	});

  return resp.send({
    iceServers: [
      {
        urls: [
          'stun:SERVER_PUBLIC_IP:3478',
          'turn:SERVER_PUBLIC_IP:3478'
        ],
        username: turn_username,
        credential: password
      }
    ]
  })
}

app.get('/iceconfig', handleIceRequest)
app.post('/iceconfig', handleIceRequest)

app.listen('4033', function () {
  console.log('server started')
})

https.createServer(options, app).listen(3033);