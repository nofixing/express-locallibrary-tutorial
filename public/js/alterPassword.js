$( document ).ready(function() {
    
  $( "#alterPwBtn" ).click(function() {
      if( $("#email").val() == "" || $("#password").val() == "" || $("#new_password").val() == "" || $("#new_password2").val() == "" ) {
        alert($("#requireField").val());
        return;
      }
      if( $("#new_password").val() != $("#new_password2").val() ) {
        alert($("#notEqualPwCfm").val());
        return;
      }

      var httpType = 'https://';
      if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
      $.ajax({
          type: 'POST',
          data: $("#alterPwForm").serialize(),
          url: httpType+$('#hostname').val()+'/user/alter_password_post',
          async: false,
          success : function(data) {
              if ( data.rcode == "401" ) {
                alert($("#WrongEP").val());
              } else if ( data.rcode == "402" ) {
                alert($("#requireField").val());
              } else if ( data.rcode == "000" ) {
                alert($("#alterPwSuccess").val());
                document.location.href = httpType+$('#hostname').val()+'/catalog';
              }
          }
      });

  });
    
});