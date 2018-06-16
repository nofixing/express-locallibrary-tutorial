$( document ).ready(function() {
    // Handler for .ready() called.
    var myEditor = document.querySelector('#snow-container');
    myEditor.children[0].innerHTML = $('#content').val();

    if ( $("#book").val() != "" ) {
        book_ajax();
    }

    $("#book").change(function() {
        if ( $("#book").val() != "" ) {
            book_ajax();
        } else {
            $("#author").val("");
            $('.gne').each(function () {
                $(this).prop('checked', false);
            });
            $(".stro").css("display", "block");
        }
    });

    function book_ajax() {

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
            }
        });

    }
    
});