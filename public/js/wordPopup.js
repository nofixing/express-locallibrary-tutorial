$( document ).ready(function() {
    
    var myEditor = document.querySelector('#bubble-container');
    myEditor.children[0].innerHTML = $('#add_content').val();
    
});

function wordPost() {

  var data = {};
  data.content = $('#wtitle').val();
  data.add_content = document.querySelector('#bubble-container').children[0].innerHTML;
  data.id = $('#w_id').val();
  var httpType = 'https://';
  if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
  $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: httpType+$('#hostname').val()+'/catalog/word_popup',
      async: false,
      success : function(data) {

          alert($('#SAVED').val());
          opener.CallParent();
          self.close();

      }
  });

}
