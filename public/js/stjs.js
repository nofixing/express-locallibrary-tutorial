$( document ).ready(function() {
    
  var pah = $(location).attr('href');
  if(pah.indexOf("catalog/story/") > -1) {
    $(".nav-item:first").addClass("active");
  }
    
});