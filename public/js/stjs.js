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
    
});