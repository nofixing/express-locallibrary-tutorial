$( document ).ready(function() {
    
  var pah = $(location).attr('href');
  if(pah.indexOf("catalog/books") > -1) {
    $(".nav-item:first").addClass("active");
  } else if(pah.indexOf("stories") > -1) {
    $(".nav-item:eq(1)").addClass("active");
  } else if(pah.indexOf("genres") > -1) {
    $(".nav-item:eq(2)").addClass("active");
  } else if(pah.indexOf("story_open_list") > -1) {
    $(".nav-item:eq(3)").addClass("active");
  } else if(pah.indexOf("book/create") > -1) {
    $(".nav-item:eq(4)").addClass("active");
  } else if(pah.indexOf("story/create") > -1) {
    $(".nav-item:eq(5)").addClass("active");
  } else if(pah.indexOf("genre/create") > -1) {
    $(".nav-item:eq(6)").addClass("active");
  }
    
});