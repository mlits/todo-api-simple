var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(express.json());

app.use(function(req, res, next) {
  req.app.locals.db = req.app.locals.db || {};
  var apiKey = req.get('Authorization') || '';
  if (!apiKey) {
    return res.status(401).json({error: 'please provide API key in Authorizartion header'});
  } else if (!checkApiKey(apiKey)) {
    return res.status(403).json({error: 'API key is wrong: checksum verification failed'});
  }
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(400).json({error: 'POST request must have application/json Content-Type'});
  }
  res.locals.apiKey = apiKey;
  next();
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({error: 'Something broke! More info in the server console.'});
});


app.get('/', function(req, res, next) {
  var apiKey = res.locals.apiKey;
  var data = req.app.locals.db[apiKey];
  if (!data) {
    return res.status(404).json({error: 'no data found for this API key'});
  }
  res.json(data);
});

app.post('/', function(req, res, next) {
  var apiKey = res.locals.apiKey;
  req.app.locals.db[apiKey] = req.body;
  return res.sendStatus(200);
});

function checkApiKey(key) {
  var len = key.length - 1;
  var checksum = Number(key.slice(-1));
  return len === checksum;
}
// ====
var http = require('http');
var port = process.env.PORT || '3000';
app.set('port', port);
var server = http.createServer(app);
server.listen(port);