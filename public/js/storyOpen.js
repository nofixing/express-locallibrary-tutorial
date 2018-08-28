$( document ).ready(function() {
    
  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() > $(document).height() - 10) {
        
        if($("#mxcnt").val() < $("#ct").val()) {
            
            var data = {};
            data.mxcnt = $("#mxcnt").val();
            var httpType = 'https://';
            if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: httpType+$('#hostname').val()+'/catalog/story_open_ajax',
                async: false,
                success : function(list_stories) {
                    $("#mxcnt").val(list_stories.mxcnt);
                    $("#ct").val(list_stories.ct);
                    $.each(list_stories, function(i, story){
                        var markup = "<tr><td><a href='/catalog/story/"+story._id+"'>"+story.title+"</a></td>";
                        markup += "<td><span>"+story.user.name+"</span></td>";
                        markup += "<td><span>"+story.favs+"</span></td>";
                        markup += "<td><span>"+story.rcnt+"</span></td></tr>";
                        $(".wtd").append(markup);
                    });
                }
            });
        }
        
    }
  });
    
});