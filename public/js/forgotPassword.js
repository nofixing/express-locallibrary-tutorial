$( document ).ready(function() {
    
  $( "#forgotPwBtn" ).click(function() {
      if( $("#email").val() == "" ) {
        alert($("#requireField").val());
        return;
      }

      var httpType = 'https://';
      if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
      $.ajax({
          type: 'POST',
          data: $("#forgotPwForm").serialize(),
          url: httpType+$('#hostname').val()+'/user/forgot_password',
          async: false,
          success : function(data) {
              if ( data.rcode == "400" ) {
                alert($("#noEmail").val());
              } else if ( data.rcode == "000" ) {
                alert($("#forgotPwSuccess").val());
                document.location.href = httpType+$('#hostname').val()+'/catalog';
              }
          }
      });

  });
    
});