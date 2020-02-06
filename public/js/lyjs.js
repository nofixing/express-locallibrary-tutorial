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
  console.log('ginit start');
  var googleAuth;
  gapi.load('auth2', function(){
    console.log('gapi load start');
    googleAuth = gapi.auth2.init({
      client_id: '829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com'
    });
    console.log('gapi load end');
    if ($('#userEmail').length) {
      console.log('userEmail id exists');
      if (googleAuth.isSignedIn.get()) {
        console.log('googleAuth.isSignedIn.get() true');
        var googleUser = googleAuth.currentUser.get();
        var id_token = googleUser.getAuthResponse().id_token;
        var profile = googleUser.getBasicProfile();
  
        if ($('#userEmail').val() != profile.getEmail()) {
  
          var frm = document.createElement("form");
          frm.setAttribute("method", "post");
          frm.setAttribute("action", "/catalog/login");
          frm.setAttribute("target", "_self");
          
          var hiddenField = document.createElement("input"); 
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", "email");
          hiddenField.setAttribute("value", profile.getEmail());
          frm.appendChild(hiddenField);
          var hiddenField1 = document.createElement("input"); 
          hiddenField1.setAttribute("type", "hidden");
          hiddenField1.setAttribute("name", "password");
          hiddenField1.setAttribute("value", id_token);
          frm.appendChild(hiddenField1);
          var hiddenField2 = document.createElement("input"); 
          hiddenField2.setAttribute("type", "hidden");
          hiddenField2.setAttribute("name", "gid_token");
          hiddenField2.setAttribute("value", id_token);
          frm.appendChild(hiddenField2);
          document.body.appendChild(frm);
  
          frm.submit();
        }
      } else {
        console.log('googleAuth.isSignedIn.get() false');
      }
    } else {
      console.log('userEmail id not exists');
    }

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