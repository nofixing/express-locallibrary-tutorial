$( document ).ready(function() {
    var auth2;
    var googleUser; // The current user
    
    gapi.load('auth2', function(){
        auth2 = gapi.auth2.init({
            client_id: '829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com'
        });
        auth2.attachClickHandler('signin_button', {}, onSuccess, onFailure);
    
        auth2.isSignedIn.listen(signinChanged);
        auth2.currentUser.listen(userChanged); // This is what you use to listen for user changes
    });  
    
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
});

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    //id_token = id_token.substring(0, 10);
    //console.log("ID Token2: " + id_token);
    $('#name').val(profile.getName());
    $('#email').val(profile.getEmail());
    $('#pw').val(id_token);
    $('#pw2').val(id_token);
    $('#gid_token').val(id_token);
    var frm = document.getElementById("userForm");
    var data = {};
    data.gid_token = $('#gid_token').val();
    data.gidThere = '';
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/user/gidcheck',
        async: false,
        success : function(data) {

            if(data.gidThere == 'Y') {
                alert($('#gidalreadyexists').val());
            } else {
                if(data.nameThere == 'Y') {
                    alert($('#nameThere').val());
                } else {
                    frm.submit();
                }
            }

        }
    });
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    auth2.disconnect();
}