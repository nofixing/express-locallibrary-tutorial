$( document ).ready(function() {
    // Handler for .ready() called.
    var myEditor = document.querySelector('#snow-container');
    myEditor.children[0].innerHTML = $('#content').val();
    //quill.clipboard.dangerouslyPasteHTML($('#content').val());

    if ( $("#book").val() != "" ) {
        book_ajax();
    } else {
        $(".boko").css("display", "none");
    }

    $("#book").change(function() {
        if ( $("#book").val() != "" ) {
            book_ajax();
            $(".stro").css("display", "flex");
            $(".boko").css("display", "flex");
        } else {
            $("#author").val("");
            $('.gne').each(function () {
                $(this).prop('checked', false);
            });
            $(".stro").css("display", "flex");
            $(".boko").css("display", "none");
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
                $(".stro").css("display", "flex");
                $(".boko").css("display", "flex");
            }
        });

    }
    
    $('#file_upload').change(function() {
        var file = $('#file_upload')[0].files[0].name;
        $(this).prev('label').text(file);
    });
    
});
