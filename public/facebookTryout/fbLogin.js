//Freshman-orienteering
//App ID:    449519988438382
//App Secret:    6b878512fa91d329803d933a9ac286de
  var isLoaded = false;
  var loggedInToFacebook = false;
  var notAuthorized = false;

  // Additional JS functions here
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '449519988438382', // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
      oauth		 : true
    });

    isLoaded = true;   

    FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // connected
      loggedInToFacebook = true;
      console.log("you has logged in");
//      testAPI();
    } else if (response.status === 'not_authorized') {
      // not_authorized
      loggedInToFacebook = false;
      notAuthorized = false;
      console.log("you has not authorized");
    } else {
      // not_logged_in
      loggedInToFacebook = false;
      console.log("you has NOT logged in");
    }
   });

  };

  // Load the SDK's source Asynchronously
  (function(d, debug){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
   }(document, /*debug*/ false));
  // Load the SDK Asynchronously

 function login() {
    FB.login(function(response) {
        if (response.authResponse) {
          console.log(response)

          testAPI();

            // connected
        } else {
          console.log(response)
            // cancelled
        }
    });
  }

 function logout() {
	 FB.logout(function(response) {
         console.log("you have logged out");
         });
	  }
 
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
    });
    setTimeout('homePage()', 5000);
    $("#rediction-hint").append("<p id='wanning'>The page will redirect to Freshman Orientation Home Page.</p>");
}

  function homePage(){
	  window.location="http://fori.uni.me";
  }

  /////////////////////////////////
  ////////// Added code by Jukka

  function fbLogin() {
    FB.login(function(response) {
        if (response.authResponse) {
          console.log(response)
          updateSignStatus();
          // connected
        } else {
          console.log(response)
          // cancelled
        }
    });
  }

  function fbLogout() {
    FB.logout(function(response) {
  // user is now logged out
    });
  }

  function updatePage(data){
    // Grab the a node of fbSignIn list element
    document.getElementById('fbSignIn').childNodes[0].innerHTML = data.name;

  }

  function updateSignStatus() {
    console.log('Update signStatus,  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log(response);
        console.log('Good to see you, ' + response.name + '.');
        updatePage(response);
    });
  }

/////////////////

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


