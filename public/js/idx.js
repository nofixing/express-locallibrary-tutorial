$( document ).ready(function() {
    
  var cfnt = $("#cfnt").val();
  var cfwt = $("#cfwt").val();
  if(typeof cfnt != 'undefined' && cfnt != '') {
    if(typeof cfwt != 'undefined' && cfwt != '') {
      $( document.body ).css({"font-family": cfnt});
      $( document.body ).css({"font-weight": cfwt});
    } else {
      $( document.body ).css({"font-family": cfnt});
    }
  } else {
    if(typeof cfwt != 'undefined' && cfwt != '') {
      $( document.body ).css({"font-weight": cfwt});
    }
  }
    
});
