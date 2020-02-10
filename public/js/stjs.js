$( document ).ready(function() {
    
  if($("#pc").val() == "DESKTOP") {
    var pah = $(location).attr('href');
    if(pah.indexOf("catalog/story/") > -1) {
      if($("#tooltip").val() == "y") {
        if($("#book").val() != "") {
          $(".nav-item:eq(2)").addClass("active");
        } else {
          $(".nav-item:eq(1)").addClass("active");
        }
      } else {
        if($("#book").val() != "") {
          $(".nav-item:eq(1)").addClass("active");
        } else {
          $(".nav-item:first").addClass("active");
        }
      }
    }
  }

  var myEditor = document.querySelector('#snow-container');
  myEditor.children[0].innerHTML = $('#memo').val();
    
});
function ginit() {
  gapi.load('auth2', function(){
    gapi.auth2.init({
      client_id: '829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com'
    });
  });
}
function leave() {
  var auth2 = gapi.auth2.getAuthInstance();
  if (auth2.isSignedIn.get()) {
    console.log('the user is signed in');
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    auth2.disconnect();
  } else {
    console.log('the user is signed out');
  }
  document.location.href = '/user/logout';
}