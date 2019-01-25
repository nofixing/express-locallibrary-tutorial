$('#p_first').keypress(function(event){
    console.log(event.which);
if(event.which != 8 && isNaN(String.fromCharCode(event.which))){
    event.preventDefault();
}});