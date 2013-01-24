
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , desktop = require('./routes/desktop.js')
  , create = require('./routes/desktop_create.js')
  , mobile = require('./routes/mobile.js')
  , login = require('./routes/login.js')
  , db = require('./routes/db.js')
  , api = require('./routes/api.js')()
  , admin = require('./routes/admin.js')
  , backbone = require('./routes/backbone.js')
  , http = require('http')
  , path = require('path')
  , nconf = require('nconf')
  , passport = require('passport') // Facebook login
  , util = require('util') // Facebook login
  , FacebookStrategy = require('passport-facebook').Strategy; // Facebook login


// Setup nconf to use (in-order):
// 1. Command-line arguments
// 2. Environment variables
// 3. A file located at 'path/to/config.json'
nconf.argv().env().file({file: './config.json'});
nconf.defaults({
  'PORT':3000,
  'sessionSecret' : 'db10fff838c41e0393f655b423d8c595',
  'database_host' : 'http://couch:zu5r8ZcL@fori.uni.me:8124/',
  'database_name' : 'fori-test-6',
  'FACEBOOK_APP_ID' : '449519988438382',
  'FACEBOOK_APP_SECRET' : '6b878512fa91d329803d933a9ac286de',
  'FACEBOOK_CALLBACK_URL' : '/auth/facebook/callback'
});

// API initialization

api.configure({ 
  'url' : nconf.get('database_host'),
  'name': nconf.get('database_name')  
});

//--------- Facebook Login ------------

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and
// finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Facebook profile is
// serialized
// and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  api.users.get(obj, function(user) { 
    done(null, user); // need to change
  });
});

// Use the FacebookStrategy within Passport.
// Strategies in Passport require a `verify` function, which accept
// credentials (in this case, an accessToken, refreshToken, and Facebook
// profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy(
	{	
		clientID: nconf.get('FACEBOOK_APP_ID'),
		clientSecret: nconf.get('FACEBOOK_APP_SECRET'),
		callbackURL: nconf.get('FACEBOOK_CALLBACK_URL')
 	}, 
 	function(accessToken, refreshToken, profile, done) {
		// asynchronous verification, for effect...
   		process.nextTick(function () {
        api.users.facebook_login(profile, function(id) {
          return done(null, id);
        });
   		});
 	})
);

//Simple route middleware to ensure user is authenticated.
//Use this route middleware on any resource that needs to be protected.  If
//the request is authenticated (typically via a persistent login session),
//the request will proceed.  Otherwise, the user will be redirected to the
//login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
  req.session.redirect_url = req.path;
	res.redirect('/login')
}
//--------- End Facebook Login ---------

var app = express();

// no need to configured by developers
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
  //Initialise Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(routes.display404);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.show);
app.get('/desktop', desktop.show);
app.get('/desktop_create', create.show);
app.get('/mobile', mobile.show);
//app.get('/mobile', ensureAuthenticated, mobile.show);
app.get('/login', login.show);
//GET /auth/facebook
//Use passport.authenticate() as route middleware to authenticate the
//request.  The first step in Facebook authentication will involve
//redirecting the user to facebook.com.  After authorization, Facebook will
//redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',passport.authenticate('facebook'),function(req, res){
// The request will be redirected to Facebook for authentication, so this
// function will not be called.
});

//GET /auth/facebook/callback
//Use passport.authenticate() as route middleware to authenticate the
//request.  If authentication fails, the user will be redirected back to the
//login page.  Otherwise, the primary route function will be called,
//which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login' }),function(req, res) {
  var redirect_url = req.session.redirect_url;
  if (redirect_url) {
    delete req.session.redirect_url;
    res.redirect(redirect_url); 
  } else {
    res.redirect('/');
  }
});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

// Pages for backbone admin view
app.get('/backbone', ensureAuthenticated, backbone.show);

// Pages for admin view
app.get('/admin', admin.index);
app.get('/admin/events', admin.events.list);
app.get('/admin/events/create', admin.events.create);
app.get('/admin/events/:eventID/checkpoints', admin.checkpoints.list);
app.get('/admin/events/:eventID/enrollments', admin.enrollments.list);
app.get('/admin/events/:eventID/edit', admin.events.edit);
app.get('/admin/events/:eventID', admin.events.show);
app.get('/admin/events/:eventID/checkpoints/create', admin.checkpoints.create);
app.get('/admin/events/:eventID/checkpoints/:checkpointID', admin.checkpoints.show);
app.get('/admin/events/:eventID/checkpoints/:checkpointID/edit', admin.checkpoints.edit);
app.get('/admin/events/:eventID/checkpoints/:checkpointID/checkins', admin.checkins.list);
app.get('/admin/events/:eventID/enrollments/create', admin.enrollments.create);
app.get('/admin/events/:eventID/enrollments/:enrollmentID', admin.enrollments.show);
app.get('/admin/events/:eventID/enrollments/:enrollmentID/edit', admin.enrollments.edit);
app.get('/admin/events/:eventID/checkpoints/:checkpointID/checkins/create', admin.checkins.create);
app.get('/admin/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', admin.checkins.show);
app.get('/admin/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID/edit', admin.checkins.edit);
app.get('/admin/users', admin.users.list);
app.get('/admin/users/create', admin.users.create);
app.get('/admin/users/:userID', admin.users.show);
app.get('/admin/users/:userID/edit', admin.users.edit);
app.get('/admin/users/:userID/enrollments', admin.enrollments.list);
app.get('/admin/users/:userID/enrollments/create', admin.enrollments.create);
app.get('/admin/users/:userID/enrollments/:enrollmentID', admin.enrollments.show);
app.get('/admin/users/:userID/enrollments/:enrollmentID/edit', admin.enrollments.edit);

// Calls that can be made to the API
app.post('/api/v1/events', db.createEvents);
app.post('/api/v1/events/:eventID', db.createEvent);
app.post('/api/v1/events/:eventID/checkpoints', db.createCheckpoints);
app.post('/api/v1/events/:eventID/checkpoints/:checkpointID', db.createCheckpoint);
app.post('/api/v1/events/:eventID/checkpoints/:checkpointID/checkins', db.createCheckin);
app.post('/api/v1/events/:eventID/enrollments', db.createEnrollment);

app.get('/api/v1/events', db.readEvents);
app.get('/api/v1/events/:eventID', db.readEvent);
app.get('/api/v1/events/:eventID/checkpoints', db.readCheckpoints);
app.get('/api/v1/events/:eventID/checkpoints/:checkpointID', db.readCheckpoint);
app.get('/api/v1/events/:eventID/checkpoints/:checkpointID/checkins', db.readCheckins);
app.get('/api/v1/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', db.readCheckin);
app.get('/api/v1/events/:eventID/enrollments', db.readEnrollments);
app.get('/api/v1/events/:eventID/enrollments/:enrollmentID', db.readEnrollment);
app.get('/api/v1/users', db.readUsers);
app.get('/api/v1/users/:userID', db.readUser);
app.get('/api/v1/users/:userID/enrollments', db.readEnrollments);
app.get('/api/v1/users/:userID/enrollments/:enrollmentID', db.readEnrollment);
app.get('/api/v1/users/:userID/enrollments/:enrollmentID/checkins', db.readCheckins);
app.get('/api/v1/users/:userID/enrollments/:enrollmentID/checkins/:checkinID', db.readCheckin);

app.put('/api/v1/events', db.updateEvents);
app.put('/api/v1/events/:eventID', db.updateEvent);
app.put('/api/v1/events/:eventID/checkpoints', db.updateCheckpoints);
app.put('/api/v1/events/:eventID/checkpoints/:checkpointID', db.updateCheckpoint);
app.put('/api/v1/events/:eventID/enrollments/:enrollmentID', db.updateEnrollment);
app.put('/api/v1/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', db.updateCheckin);
app.put('/api/v1/users/:userID', db.updateUser);

app.delete('/api/v1/events', db.deleteEvents);
app.delete('/api/v1/events/:eventID', db.deleteEvent);
app.delete('/api/v1/events/:eventID/checkpoints', db.deleteCheckpoints);
app.delete('/api/v1/events/:eventID/checkpoints/:checkpointID', db.deleteCheckpoint);
app.delete('/api/v1/events/:eventID/enrollments/:enrollmentID', db.deleteEnrollment);
app.delete('/api/v1/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', db.deleteCheckin);
app.delete('/api/v1/users/:userID', db.deleteUser);
app.delete('/api/v1/users/:userID/enrollments', db.deleteEnrollment);

app.post('/api/v1/users', db.createUser);
app.post('/api/v1/users/:userID/enrollments', db.createEnrollment);
app.post('/api/v1/users/:userID/enrollments', db.updateEnrollment);

// Calls that can be made to the API v2
app.get('/api/v2/events', api.events.list);
app.get('/api/v2/events/:eventID', api.events.show);
app.get('/api/v2/events/:eventID/checkpoints', api.checkpoints.list);
app.get('/api/v2/events/:eventID/checkpoints/:checkpointID', api.checkpoints.show);
app.get('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins', api.checkins.list);
app.get('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', api.checkins.show);
app.get('/api/v2/events/:eventID/enrollments', api.enrollments.list);
app.get('/api/v2/events/:eventID/enrollments/:enrollmentID', api.enrollments.show);
app.get('/api/v2/users', api.users.list);
app.get('/api/v2/users/:userID', api.users.show);

app.post('/api/v2/events', api.events.create);
app.post('/api/v2/events/:eventID/checkpoints', api.checkpoints.create);
app.post('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins', api.checkins.create);
app.post('/api/v2/events/:eventID/enrollments', api.enrollments.create);
app.post('/api/v2/users', api.users.create);

app.put('/api/v2/events/:eventID', api.events.edit);
app.put('/api/v2/events/:eventID/checkpoints/:checkpointID', api.checkpoints.edit);
app.put('/api/v2/events/:eventID/enrollments/:enrollmentID', api.enrollments.edit);
app.put('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', api.checkins.edit);
app.put('/api/v2/users/:userID', api.users.edit);

app.delete('/api/v2/events/:eventID', api.events.remove);
app.delete('/api/v2/events/:eventID/checkpoints/:checkpointID', api.checkpoints.remove);
app.delete('/api/v2/events/:eventID/enrollments/:enrollmentID', api.enrollments.remove);
app.delete('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', api.checkins.remove);
app.delete('/api/v2/users/:userID', api.users.remove);

// 404 page if nothing else matched

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});