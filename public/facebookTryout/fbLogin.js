//Freshman-orienteering
//App ID:    449519988438382
//App Secret:    6b878512fa91d329803d933a9ac286de
  var isLoaded = false;
  var loggedInToFacebook = false;

  // Additional JS functions here
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '449519988438382', // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    isLoaded = true;   

     FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // connected
      loggedInToFacebook = true;
    } else if (response.status === 'not_authorized') {
      // not_authorized
      loggedInToFacebook = false;
    } else {
      // not_logged_in
      loggedInToFacebook = false;
    }
   });

  };

  // Load the SDK's source Asynchronously
  (function(d, debug){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "http://connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
   }(document, /*debug*/ false));
  // Load the SDK Asynchronously

 function login() {
    FB.login(function(response) {
        if (response.authResponse) {
          console.log(response)

          //testAPI();

            // connected
        } else {
          console.log(response)
            // cancelled
        }
    });
  }

  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
    });
}

/*

This should be the response
{
    status: 'connected',
    authResponse: {
        accessToken: '...',
        expiresIn:'...',
        signedRequest:'...',
        userID:'...'
    }
}
*/


