$( document ).ready(function() {
    // Handler for .ready() called.
    var myEditor = document.querySelector('#snow-container');
    myEditor.children[0].innerHTML = $('#content').val();
});