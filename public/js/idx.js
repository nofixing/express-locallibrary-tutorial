$( document ).ready(function() {
    
  var cfnt = $("#cfnt").val();
  if(typeof cfnt != 'undefined' && cfnt != '') {
    $( document.body ).css({"font-family": cfnt});
  }
    
});
