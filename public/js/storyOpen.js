$( document ).ready(function() {
    
  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() > $(document).height() - 50) {
        alert("near bottom!");
        
        var data = {};
        data.id = $("#book").val();
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/book_ajax',
            success : function(book) {
                $("#author").val(book.author);
                $.each(book.genre, function(i, gnr){
                    $('.gne').each(function () {
                        if( gnr._id ==  $(this).val() ) $(this).prop('checked', true);
                    });
                });
                $(".stro").css("display", "none");
                $(".boko").css("display", "block");
            }
        });
  
    }
  });
    
});