$( document ).ready(function() {
    
  if (googleAuth.isSignedIn.get()) {
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
  }
  
  var cfnt = $("#cfnt").val();
  if(typeof cfnt != 'undefined' && cfnt != '') {
    $( document.body ).css({"font-family": cfnt});
  }
    
});
