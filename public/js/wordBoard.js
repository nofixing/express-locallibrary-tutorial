$( document ).ready(function() {
  var notCalled = true;
  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() > $(document).height() - 10) {
        
        if($("#mxcnt").val() < $("#ct").val() && notCalled) {
            notCalled = false;
            console.log('word_board_ajax called');
            var data = {};
            data.mxcnt = $("#mxcnt").val();
            data.stle = $("#stle").val();
            var httpType = 'https://';
            if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: httpType+$('#hostname').val()+'/catalog/word_board_ajax',
                async: false,
                success : function(list_words) {
                    $("#mxcnt").val(list_words.mxcnt);
                    $("#ct").val(list_words.ct);
                    $.each(list_words, function(i, word){
                        var markup = "";
                        if($("#pc").val() == "DESKTOP") {
                            markup = "<tr><td><span>"+word.title+"</span></td>";
                            if(word.content != null) markup += "<td><span>"+word.content+"</span></td>";
                            else markup += "<td><span></span></td>";
                            if(word.story != null && word.story.title  != null) markup += "<td><span>"+word.story.title+"</span></td>";
                            else markup += "<td><span></span></td>";
                            if(word.skill != null) markup += "<td><span>"+word.skill+"</span></td>";
                            else markup += "<td><span></span></td>";
                            if(word.importance != null) markup += "<td><span>"+word.importance+"</span></td>";
                            else markup += "<td><span></span></td>";
                            if(word.create_date != null) markup += "<td><span>"+word.create_date+"</span></td>";
                            else markup += "<td><span></span></td></tr>";
                            $(".wtd").append(markup);
                        } else {
                            markup = "<tr><td><span>"+word.title+"</span></td>";
                            if(word.content != null) markup += "<td><span>"+word.content+"</span></td>";
                            else markup += "<td><span></span></td></tr>";
                            $(".wtd").append(markup);
                        }
                    });
                }
            });
            setTimeout(function(){ notCalled = true; }, 3000);
        }
        
    }
  });
    
});