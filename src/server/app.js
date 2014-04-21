var express = require('express');
var path = require('path');
var logger = require('morgan');
var http = require('http');

var app = express();
var server = http.createServer(app);

app.use(express.static(path.join(__dirname, '../../public')));

app.use('/js/client',express.static(path.join(__dirname, '../client')));
app.use('/js/dist',express.static(path.join(__dirname, '../../dist')));
app.use('/js/shared',express.static(path.join(__dirname, '../shared')));
app.use('/js/vendor',express.static(path.join(__dirname, '../../bower_components')));

WORLD_W = 256;
WORLD_H = 256;

CELL_SIZE = 8;
TILE_SIZE = 20;

DIR_TL = 0;
DIR_TOP = 1;
DIR_TR = 2;
DIR_RIGHT = 3;
DIR_BR = 4;
DIR_BOTTOM = 5;
DIR_BL = 6;
DIR_LEFT = 7;

var WorldGenerator = require('../shared/WorldGenerator.js');
var GameLoop = require('../shared/GameLoop.js');

var world = WorldGenerator.generate(WORLD_W, WORLD_H, 500);

var gameLoop = new GameLoop([
  [world,'tickServer']
]);

gameLoop.start();

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

app.get('/api/tiles', function(req, res){
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(world.getTileset().toJSON()));
});

app.get('/api/agents', function(req, res){
  res.setHeader('Content-type', 'application/json');
  var output = [];
  world.getAgents().forEach(function(agent) {
    output.push(agent.toJSON());
  });
  res.send(JSON.stringify(output));
});

var io = require('socket.io').listen(server);
io.set('log level', 1);
io.sockets.on('connection', function (socket) {

  var watcherID = null;

  // Update this client's viewport 
  socket.on('setViewport', function (data) {
    // TODO: Pull initial state

    // Create a world watcher to handle changes occurring within that window
    if(watcherID) world.removeWatcher(watcherID);

    watcherID = world.addWatcher(data.minI, data.minJ, data.maxI, data.maxJ, function(changes) {
      socket.emit('worldChanges', changes);
    });

    world.refreshWatcher(watcherID)
  });



});

//var favicon = require('static-favicon');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var users = require('./routes/users');

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
/*
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
*/

module.exports = server;
