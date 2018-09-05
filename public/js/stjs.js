$( document ).ready(function() {
    
  if($("#pc").val() == "DESKTOP") {
    var pah = $(location).attr('href');
    if(pah.indexOf("catalog/story/") > -1) {
      if($("#book").val() != "") {
        $(".nav-item:eq(1)").addClass("active");
      } else {
        $(".nav-item:first").addClass("active");
      }
    }
  }
    
});