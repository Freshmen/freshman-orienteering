
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , desktop = require('./routes/desktop.js')
  , create = require('./routes/desktop_create.js')
  , mobile = require('./routes/mobile.js')
  , db = require('./routes/db.js')
  , events = require('./routes/events.js')
  , checkpoints = require('./routes/checkpoints.js')
  , http = require('http')
  , path = require('path')
  , nconf = require('nconf');

var app = express();

 // Setup nconf to use (in-order):
  //   1. Command-line arguments
  //   2. Environment variables
  //   3. A file located at 'path/to/config.json'
nconf.argv().env().file({file: './config.json'});
nconf.defaults({
  'PORT':3000,
  'sessionSecret':'your secret here'
});

//no need to configured by developers
app.configure(function(){
  app.set('port', nconf.get('PORT'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(nconf.get('sessionSecret')));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/desktop', desktop.show);
app.get('/desktop_create', create.show);
app.get('/db',db.create);
app.get('/mobile', mobile.show);

//Test pages for the api
app.get('/events', events.list);
app.get('/events/create', events.create);
app.get('/events/:eventID', events.show);
app.get('/events/:eventID/edit', events.edit);

app.get('/events/:eventID/checkpoints', checkpoints.list);
app.get('/events/:eventID/checkpoints/create', checkpoints.create);
app.get('/events/:eventID/checkpoints/:checkpointID', checkpoints.show);
app.get('/events/:eventID/checkpoints/:checkpointID/edit', checkpoints.edit);

//Calls that can be made to the API
app.post('/api/v1/events', db.createEvents);
app.post('/api/v1/events/:eventID', db.createEvent);
app.post('/api/v1/events/:eventID/checkpoints', db.createCheckpoints);
app.post('/api/v1/events/:eventID/checkpoints/:checkpointID', db.createCheckpoint);

app.get('/api/v1/events', db.readEvents);
app.get('/api/v1/events/:eventID', db.readEvent);
app.get('/api/v1/events/:eventID/checkpoints', db.readCheckpoints);
app.get('/api/v1/events/:eventID/checkpoints/:checkpointID', db.readCheckpoint);

app.put('/api/v1/events', db.updateEvents);
app.put('/api/v1/events/:eventID', db.updateEvent);
app.put('/api/v1/events/:eventID/checkpoints', db.updateCheckpoints);
app.put('/api/v1/events/:eventID/checkpoints/:checkpointID', db.updateCheckpoint);

app.delete('/api/v1/events', db.deleteEvents);
app.delete('/api/v1/events/:eventID', db.deleteEvent);
app.delete('/api/v1/events/:eventID/checkpoints', db.deleteCheckpoints);
app.delete('/api/v1/events/:eventID/checkpoints/:checkpointID', db.deleteCheckpoint);

app.post('/api/v1/test', db.test);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
