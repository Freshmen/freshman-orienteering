
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , desktop = require('./routes/desktop.js')
  , mobile = require('./routes/mobile.js')
  , login = require('./routes/login.js')
  , organizer = require('./routes/organizer.js')
  , api = require('./routes/api.js')()
  , admin = require('./routes/admin.js')
  , ticketManagement = require('./routes/ticketManagement.js') 
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
  'PORT' : 3000,
  'sessionSecret' : 'db10fff838c41e0393f655b423d8c595',
  'database_host' : 'http://couch:zu5r8ZcL@fori.uni.me:8124/',
  'database_name' : 'fori-test-6',
  'FACEBOOK_APP_ID' : '449519988438382',
  'FACEBOOK_APP_SECRET' : '6b878512fa91d329803d933a9ac286de',
  'FACEBOOK_CALLBACK_URL' : '/auth/facebook/callback',
  'ticket_refresh_rate' : 5
});

// API initialization

api.configure({ 
  'url' : nconf.get('database_host'),
  'name': nconf.get('database_name')  
}, function() { 
  ticketManagement.start(api, nconf.get('ticket_refresh_rate'));
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
    console.log(refreshToken);
    console.log("refreshToken");
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
	res.redirect('/auth/facebook');
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

app.get('/', function(req, res) {
  res.redirect('/ed');
});

app.get('/ed', routes.show);

app.get('/desktop', ensureAuthenticated, desktop.show);
app.get('/desktop_create', ensureAuthenticated, desktop.create);
app.get('/desktop_manage', ensureAuthenticated, desktop.manage);
app.get('/mobile', ensureAuthenticated, mobile.show);
//app.get('/mobile', mobile.show);
app.get('/organizer/login', organizer.login);

app.get('/login', ensureAuthenticated, login.show);
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

// Pages for admin view
app.get('/admin', ensureAuthenticated, admin.index);

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
app.get('/api/v2/me', api.users.getCurrentUser);
app.get('/api/v2/me/enrollments', api.users.getEnrollments);
app.get('/api/v2/me/checkins', api.users.getCheckins);
app.get('/api/v2/events/:eventID/ticket', api.ticket.show);
app.get('/api/v2/events/:eventID/tickets', api.tickets.list);
app.get('/api/v2/events/:eventID/tickets/:ticketID', api.tickets.show);
app.get('/api/v2/tickets', api.tickets.list);
app.get('/api/v2/tickets/:ticketID', api.tickets.show);

app.post('/api/v2/events', api.events.create);
app.post('/api/v2/events/:eventID/checkpoints', api.checkpoints.create);
app.post('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins', api.checkins.create);
app.post('/api/v2/events/:eventID/enrollments', api.enrollments.create);
app.post('/api/v2/users', api.users.create);
app.post('/api/v2/events/:eventID/ticket', api.ticket.create);
app.post('/api/v2/events/:eventID/tickets', api.tickets.create);

app.put('/api/v2/events/:eventID', api.events.edit);
app.put('/api/v2/events/:eventID/checkpoints/:checkpointID', api.checkpoints.edit);
app.put('/api/v2/events/:eventID/enrollments/:enrollmentID', api.enrollments.edit);
app.put('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', api.checkins.edit);
app.put('/api/v2/events/:eventID', api.users.edit);
app.put('/api/v2/events/:eventID/tickets/:ticketID', api.tickets.edit);

app.delete('/api/v2/events/:eventID', api.events.remove);
app.delete('/api/v2/events/:eventID/checkpoints/:checkpointID', api.checkpoints.remove);
app.delete('/api/v2/events/:eventID/enrollments/:enrollmentID', api.enrollments.remove);
app.delete('/api/v2/events/:eventID/checkpoints/:checkpointID/checkins/:checkinID', api.checkins.remove);
app.delete('/api/v2/users/:userID', api.users.remove);
app.delete('/api/v2/events/:eventID/tickets/:ticketID', api.tickets.remove);

app.get('/api/v2/events/:eventID/upload', api.ticket.upload);

// 404 page if nothing else matched

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});