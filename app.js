
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
  , admin = require('./routes/admin.js')
  , http = require('http')
  , path = require('path')
  , nconf = require('nconf')
  , passport = require('passport') // Facebook login
  , util = require('util') // Facebook login
  , FacebookStrategy = require('passport-facebook').Strategy; // Facebook login

//--------- Facebook Login ------------

	// Facebook Constant
	var FACEBOOK_APP_ID = "449519988438382"
	var FACEBOOK_APP_SECRET = "6b878512fa91d329803d933a9ac286de";
	var CALLBACK_URL = "http://localhost:3000/auth/facebook/callback";

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
		done(null, user); // need to change
	});
	
	passport.deserializeUser(function(obj, done) {
		done(null, obj); // need to change
	});
	
	
	// Use the FacebookStrategy within Passport.
	// Strategies in Passport require a `verify` function, which accept
	// credentials (in this case, an accessToken, refreshToken, and Facebook
	// profile), and invoke a callback with a user object.
	passport.use(new FacebookStrategy({
	   clientID: FACEBOOK_APP_ID,
	   clientSecret: FACEBOOK_APP_SECRET,
	   callbackURL: CALLBACK_URL
	 },
	function(accessToken, refreshToken, profile, done) {
	   // asynchronous verification, for effect...
	   process.nextTick(function () {
	     
	     // To keep the example simple, the user's Facebook profile is returned
			// to
	     // represent the logged-in user. In a typical application, you would
			// want
	     // to associate the Facebook account with a user record in your
			// database,
	     // and return that user instead.
	     return done(null, profile);
	   });
	 }
	));
	
	//Simple route middleware to ensure user is authenticated.
	//Use this route middleware on any resource that needs to be protected.  If
	//the request is authenticated (typically via a persistent login session),
	//the request will proceed.  Otherwise, the user will be redirected to the
	//login page.
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/login')
	}
//--------- End Facebook Login ---------

var app = express();

  // Setup nconf to use (in-order):
  // 1. Command-line arguments
  // 2. Environment variables
  // 3. A file located at 'path/to/config.json'
nconf.argv().env().file({file: './config.json'});
nconf.defaults({
  'PORT':3000,
  'sessionSecret':'your secret here'
});

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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.show);
app.get('/desktop', desktop.show);
app.get('/desktop_create', create.show);
app.get('/mobile', ensureAuthenticated, mobile.show);
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
	res.redirect('/mobile');
});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

// Pages for admin view
app.get('/admin', admin.index);
app.get('/admin/events', admin.list);
app.get('/admin/events/create', admin.create);
app.get('/admin/events/:eventID/checkpoints', admin.list);
app.get('/admin/events/:eventID/enrollments', admin.list);
app.get('/admin/events/:eventID/edit', admin.edit);
app.get('/admin/events/:eventID', admin.show);
app.get('/admin/events/:eventID/checkpoints/create', admin.create);
app.get('/admin/events/:eventID/checkpoints/:checkpointID', admin.show);
app.get('/admin/events/:eventID/checkpoints/:checkpointID/edit', admin.edit);
app.get('/admin/events/:eventID/enrollments/create', admin.create);
app.get('/admin/events/:eventID/enrollments/:enrollmentID', admin.show);
app.get('/admin/events/:eventID/enrollments/:enrollmentID/edit', admin.edit);
app.get('/admin/users', admin.list);
app.get('/admin/users/create', admin.create);
app.get('/admin/users/:userID', admin.show);
app.get('/admin/users/:userID/edit', admin.edit);
app.get('/admin/users/:userID/enrollments', admin.list);
app.get('/admin/users/:userID/enrollments/:enrollmentID', admin.show);

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

app.put('/api/v1/events', db.updateEvents);
app.put('/api/v1/events/:eventID', db.updateEvent);
app.put('/api/v1/events/:eventID/checkpoints', db.updateCheckpoints);
app.put('/api/v1/events/:eventID/checkpoints/:checkpointID', db.updateCheckpoint);

app.delete('/api/v1/events', db.deleteEvents);
app.delete('/api/v1/events/:eventID', db.deleteEvent);
app.delete('/api/v1/events/:eventID/checkpoints', db.deleteCheckpoints);
app.delete('/api/v1/events/:eventID/checkpoints/:checkpointID', db.deleteCheckpoint);
app.delete('/api/v1/events/:eventID/enrollments/:enrollmentID', db.deleteEnrollment);

//Calls that can be made to the User API
app.get('/api/v1/users', db.readUsers);
app.get('/api/v1/users/:userID', db.readUser);
app.get('/api/v1/users/:userID/enrollments', db.readEnrollments);
app.get('/api/v1/users/:userID/enrollments/:enrollmentID', db.readEnrollment);
app.get('/api/v1/users/:userID/enrollments/:enrollmentID/checkins', db.readCheckins);
app.get('/api/v1/users/:userID/enrollments/:enrollmentID/checkins/:checkinID', db.readCheckin);

app.post('/api/v1/users', db.createUser);
app.post('/api/v1/users/:userID/enrollments', db.createEnrollment);

app.put('/api/v1/users/:userID', db.updateUser);
app.post('/api/v1/users/:userID/enrollments', db.updateEnrollment);

app.delete('/api/v1/users/:userID', db.deleteUser);
app.delete('/api/v1/users/:userID/enrollments', db.deleteEnrollment);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
