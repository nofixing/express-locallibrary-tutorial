$( document ).ready(function() {
    
  $( "#alterNmBtn" ).click(function() {
      if( $("#new_name").val() == "" ) {
        alert($("#requireField").val());
        return;
      }

      var httpType = 'https://';
      if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
      $.ajax({
          type: 'POST',
          data: $("#alterNmForm").serialize(),
          url: httpType+$('#hostname').val()+'/user/alter_name_post',
          async: false,
          success : function(data) {
              if ( data.rcode == "403" ) {
                alert($("#requireField").val());
              } else if ( data.rcode == "402" ) {
                alert($("#nameThere").val());
              } else if ( data.rcode == "000" ) {
                alert($("#alterNmSuccess").val());
                document.location.href = httpType+$('#hostname').val()+'/catalog';
              }
          }
      });

  });
    
});