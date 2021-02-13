$( document ).ready(function() {

});
function success(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    //$('#email').val(profile.getEmail());
    //$('#password').val(id_token);
    $('#gid_token').val(id_token);
    var frm = document.getElementById("userForm");
    frm.submit();
}
function failure(error) {
    console.log(error);
}
function renderButton() {
    if ($('#sign_token').val() == 'unsign') {
        alert($('#havetosignup').val());
        var auth2;
        gapi.load('auth2', function(){
            auth2 = gapi.auth2.init({
              client_id: '829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com'
            });
            if (auth2.isSignedIn.get()) {
                console.log('the user is signed in');
                auth2.signOut().then(function () {
                    console.log('User signed out.');
                });
                auth2.disconnect();
            }
        });
    } else {
        gapi.signin2.render('my-signin2', {
            'scope': 'profile email',
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': success,
            'onfailure': failure
        });
    }
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    auth2.disconnect();
}
