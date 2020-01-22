$( document ).ready(function() {

});
function onSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    $('#email').val(profile.getEmail());
    $('#password').val(id_token);
    $('#gid_token').val(id_token);
    var frm = document.getElementById("userForm");
    frm.submit();
}
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    var auth2;
    var googleUser; // The current user
    
    gapi.load('auth2', function(){
        auth2 = gapi.auth2.init({
            client_id: '829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com'
        });
        auth2.attachClickHandler('my-signin2', {}, onSuccess, onFailure);
    
        auth2.isSignedIn.listen(signinChanged);
        auth2.currentUser.listen(userChanged); // This is what you use to listen for user changes
    });  
    console.log('gapi.load end');
    var signinChanged = function (val) {
        console.log('Signin state changed to ', val);
    };
    
    var onSuccess = function(user) {
        console.log('Signed in as ' + user.getBasicProfile().getName());
        // Redirect somewhere
    };
    
    var onFailure = function(error) {
        console.log(error);
    };
    
    function signOut() {
        auth2.signOut().then(function () {
            console.log('User signed out.');
        });
    }        
    
    var userChanged = function (user) {
        if(user.getId()){
          // Do something here
        }
    };    
    
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
    console.log('gapi.signin2.render end');
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    auth2.disconnect();
}
