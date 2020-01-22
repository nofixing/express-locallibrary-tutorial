$( document ).ready(function() {
    
  if($("#pc").val() == "DESKTOP") {
    var pah = $(location).attr('href');
    if( (pah.indexOf("catalog/books") > -1 || pah.indexOf("/catalog/book/") > -1) && pah.indexOf("/catalog/book/create") == -1) {
      $(".nav-item:first").addClass("active");
    } else if(pah.indexOf("stories") > -1) {
      $(".nav-item:eq(1)").addClass("active");
    } else if(pah.indexOf("genres") > -1 || pah.indexOf("/catalog/genre/") > -1) {
      $(".nav-item:eq(2)").addClass("active");
    } else if(pah.indexOf("story_open_list") > -1) {
      $(".nav-item:eq(3)").addClass("active");
    } else if(pah.indexOf("word_board_list") > -1) {
      $(".nav-item:eq(4)").addClass("active");
    } else if(pah.indexOf("book/create") > -1) {
      $(".nav-item:eq(5)").addClass("active");
    } else if(pah.indexOf("story/create") > -1) {
      $(".nav-item:eq(6)").addClass("active");
    } else if(pah.indexOf("genre/create") > -1) {
      $(".nav-item:eq(7)").addClass("active");
    }
  }
    
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