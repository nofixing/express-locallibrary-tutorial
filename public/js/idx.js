$( document ).ready(function() {
    
  var cfnt = $("#cfnt").val();
  if(typeof cfnt != 'undefined' && cfnt != '') {
    $( document.body ).css({"font-family": cfnt});
  }
    
});
function ginit() {
  gapi.load('auth2', function(){
    gapi.auth2.init({
      client_id: '829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com'
    });
  });
}