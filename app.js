
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , desktop = require('./routes/desktop')
  , mobile = require('./routes/mobile')
  , db = require('./routes/db')
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
app.get('/db',db.create);
app.get('/mobile', mobile.show);

//Calls that can be made to the API
app.post('/api/v1/events', db.createEvents);
app.post('/api/v1/events/:eventID', db.createEvent);
app.post('/api/v1/events/:eventID/waypoints', db.createWaypoints);
app.post('/api/v1/events/:eventID/waypoints/:waypointID', db.createWaypoint);

app.get('/api/v1/events', db.readEvents);
app.get('/api/v1/events/:eventID', db.readEvent);
app.get('/api/v1/events/:eventID/waypoints', db.readWaypoints);
app.get('/api/v1/events/:eventID/waypoints/:waypointID', db.readWaypoint);

app.put('/api/v1/events', db.updateEvents);
app.put('/api/v1/events/:eventID', db.updateEvent);
app.put('/api/v1/events/:eventID/waypoints', db.updateWaypoints);
app.put('/api/v1/events/:eventID/waypoints/:waypointID', db.updateWaypoint);

app.delete('/api/v1/events', db.deleteEvents);
app.delete('/api/v1/events/:eventID', db.deleteEvent);
app.delete('/api/v1/events/:eventID/waypoints', db.deleteWaypoints);
app.delete('/api/v1/events/:eventID/waypoints/:waypointID', db.deleteWaypoint);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
