var selectText = "";
var wordArray = [];
var dicAddr = "http://c.merriam-webster.com/coredictionary/";
$(function(){
    var showData = $('#show_img');
    $.support.cors = true;

    var prevScrollpos = window.pageYOffset;
    window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
            $('#navbar').css("top","0");
        } else {
            $('#navbar').css("top","-40px");
        }
        prevScrollpos = currentScrollPos;
    };

    $( "#docTitle" ).html( document.getElementsByTagName('title')[0].innerHTML );
    $( "#jb_content" ).bind('dblclick', function(e){
        search();
        imageSearch();
        
        var data = {};
        data.title = selectText;
        data.story_id = $( "#story_id" ).val();
        data.word_id = '';
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/word/create',
            success : function(data) {
    
                var markup = "<tr><td style='text-align: center;'><input type='checkbox' class='wList' value='"+data.word_id+"'></td>";
                markup += "<td><input type='text' size='20' maxlength='30' class='ipt' value='"+data.title+"'></td>";
                markup += "<td><textarea class='txt' rows='3' cols='50'></textarea></td></tr>";
                $(".wtd").append(markup);
    
            }
        });
    });
    $( "#searchWordButton" ).click(function() {
        selectText = $("#searchWord").val();
        dicSearch();
        wordList();
        imageSearch();
    });
    $("#dicType").change(function() {
        dicSearch();
    });
    
    function imageSearch() {

        if (document.getElementById("myCheck").checked) {
            $('#img_layer').css("display","block");
            $.ajax({
                url: 'https://www.googleapis.com/customsearch/v1',
                 type: 'GET',
                 data: "key=AIzaSyAsn_BqIJs8FS8qyCZonEvJ2fgpzXHmt_s&cx=012222057275105284918:2fhqptrxpgk&q="+selectText+"&num=7&start=1&imgSize=medium&searchType=image",
                 dataType: 'JSON',
                 success: function(data){
                    showData.empty();
                    $.each(data.items, function (i, item) {
                        if(i == 0) showData.append('<ul />');
                        showData.append('<li><a href="'+item.image.contextLink+'"><img src="'+item.link+'" alt="'+item.title+'"></a><br/>'+item.title+'<br/>'+item.snippet + '</li>');
                    });
                 }
            });
        }			
    
    }

    $("#save").click(function(){
        
        var data = {};
        data.story_id = $( "#story_id" ).val();
        data.content = document.querySelector('#snow-container').children[0].innerHTML;
        data.memo_id = $('#memo_id').val();
        console.log('save click');
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/memo/create',
            success : function(data) {
                alert('saved');
            }
        });
        /*
        if($.trim($('#fileName').val()) == "") {
            alert('파일명을 입력해 주세요.');
            return;
        }
        
        var str = document.querySelector('#snow-container').children[0].innerHTML;
        var find = '<p><br></p>';
        var re = new RegExp(find, 'g');
        str = str.replace(re, '');
        var orgText = "<!doctype html>";
        orgText += "<html>";
        orgText += "  <head>";
        orgText += "    <title>"+$('#fileName').val()+"</title>";
        orgText += "    <link href='https://cdn.quilljs.com/1.3.6/quill.snow.css' type='text/css' rel='stylesheet'>";
        orgText += "  </head>";
        orgText += "  <body>";
        orgText += str;
        orgText += "  </body>";
        orgText += "</html>";
        
        //var textToWrite = wordWrap(orgText, 72);
        
        var textFileAsBlob = new Blob([orgText], {type:'text/html'});
        var fileNameToSaveAs = $('#fileName').val()+'.html';

        try {
            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null)
            {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else
            {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                //downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }

            downloadLink.click();
        }
        catch(err) {
            window.navigator.msSaveBlob(textFileAsBlob, $('#fileName').val()+'.html'); 
        }
        */
    });

    $("#checkall").click(function(){
        $('.wList').not(this).prop('checked', this.checked);
    });


    $('.wList:not(#checkall)').click(function(){
        if ($("#checkall").prop('checked') && this.checked == false) {
            $("#checkall").prop('checked', false);
        }
            
        if (this.checked == true) {
            CheckSelectAll();
        }
            
    });


    function CheckSelectAll() {
        var flag = true;
        $('.wList:not(#checkall)').each(function () {
            if (this.checked == false) {
                flag = false;
                return false;
            }
        });
        $("#checkall").prop('checked', flag);
    }

    $('#wordSave').click(function(){
        $('.wList').each(function(idx) {
            if ($(this).prop('checked')) {
                var data = {};
                data.id = $(this).val();
                data.story_id = $( "#story_id" ).val();
                data.title = $('.ipt')[idx].value;
                data.content = $('.txt')[idx].value;
                var httpType = 'https://';
                if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: httpType+$('#hostname').val()+'/catalog/word/update',
                    success : function(data) {
                        $(this).val(data.id);
                    }
                });
            }
        });
        alert('SAVED');
    });

    $('#wordDelete').click(function(){
        $('.wList').each(function(idx) {
            if ($(this).prop('checked')) {
                var data = {};
                data.id = $(this).val();
                var httpType = 'https://';
                if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: httpType+$('#hostname').val()+'/catalog/word/delete',
                    success : function(data) {
                    }
                });
            }
        });
        $('.wList').each(function(){
            if($(this).prop('checked')){
                $(this).parents("tr").remove();
            }
        });
        alert('DELETED');
    });

    $('#wordAdd').click(function(){
        var markup = "<tr><td style='text-align: center;'><input type='checkbox' class='wList' value=''></td>";
        markup += "<td><input type='text' size='20' maxlength='30' class='ipt' value=''></td>";
        markup += "<td><textarea class='txt' rows='3' cols='50'></textarea></td></tr>";
        $(".wtd").append(markup);
    });

    var sList = $('#story').val();
    var bVa = $("#book").val();
    if(typeof sList != 'undefined' && typeof bVa != 'undefined' && bVa != '') {
        var data = {};
        data.book = bVa;
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/stories_ajax',
            success : function(stories) {
                $.each(stories, function(i, story){
					$('#story').append($("<option></option>")
                    .attr("value",story._id)
                    .text(story.title));
				});
            }
        });
    }

});

function search() {

    var selection;
    
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }
    selectText = selection.toString().trim();
    
    if (selectText.length > 0) {
        dicSearch();
        wordList();
        
        var nNd = document.createElement("span");
        nNd.setAttribute("class", "sbue");
        var w = getSelection().getRangeAt(0);
        w.surroundContents(nNd);
        $('.sbue').css({"color":"blue"});
    }
    

}

function dicSearch() {

    if ($("#dicType").val() == "1") {
        if (selectText == "") {
            dicAddr = "https://www.merriam-webster.com/word-of-the-day";
        } else {
            dicAddr = "https://www.merriam-webster.com/dictionary/"+selectText;
        }
    } else if ($("#dicType").val() == "2") {
        if (selectText == "") {
            dicAddr = "http://learnersdictionary.com/";
        } else {
            dicAddr = "http://learnersdictionary.com/definition/"+selectText;
        }
    } else if ($("#dicType").val() == "3") {
        dicAddr = "https://c.merriam-webster.com/coredictionary/"+selectText;
    } else if ($("#dicType").val() == "4") {
        dicAddr = "http://small.dic.daum.net/search.do?q="+selectText+"&dic=eng";
    }
    $('#dic_frame').attr('src', dicAddr);

}

function wordList() {
    var myEditor = document.querySelector('#snow-container');
    var html = myEditor.children[0].innerHTML;
    var isThere = false;
    jQuery.each( wordArray, function( i, val ) {
        if (val == selectText) {
            isThere = true;
            return;
        }
    });
    if ( isThere ) return;
    if (wordArray.length == 0 && $("#memo").val() == "") {
        document.querySelector('#snow-container').children[0].innerHTML = "<strong>"+selectText+"</strong>";
    } else {
        document.querySelector('#snow-container').children[0].innerHTML = html + "<strong>"+selectText+"</strong>";
    }
    wordArray.push(selectText);
}

function ReadingOnly() {
    $('#jb_content').removeClass('col-lg-4');
    $('#jb_content').removeClass('col-lg-6');
    $('#jb_content').addClass('col-lg-12');
    $('#jb_content').css('padding', '0 25% 0 25%');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').css('display', 'none');
    $('.hgt').css('color', 'black');
}

function ReadingSearch() {
    $('#jb_content').removeClass('col-lg-4');
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').addClass('col-lg-6');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').removeClass('col-lg-4');
    $('#jb_sidebar').addClass('col-lg-6');
    $('#jb_sidebar').css('display', 'block');
    $('.hgt').css('color', 'black');
}

function ReadingPractice() {
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').removeClass('col-lg-6');
    $('#jb_content').addClass('col-lg-4');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_txtEditor').css('display', 'block');
    $('#jb_sidebar').removeClass('col-lg-6');
    $('#jb_sidebar').addClass('col-lg-4');
    $('#jb_sidebar').css('display', 'block');
    $('.hgt').css('color', 'blue');
}

function storyPost() {

    var frm = document.getElementById("storyForm");
    var tContent = txtArea.value;
    var find = '<p><br></p>';
    var re = new RegExp(find, 'g');
    tContent = tContent.replace(re, '');
    document.querySelector('#snow-container').children[0].innerHTML = tContent;
    frm.content.value = document.querySelector('#snow-container').children[0].innerHTML;
    frm.submit();		

}

function userPost() {

    var frm = document.getElementById("userForm");
    var isThere = false;
    var data = {};
    data.email = frm.email.value;
    data.emailThere = '';
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/user/emailcheck',
        async: false,
        success : function(data) {

            if(data.emailThere == 'Y') {
                alert('Oops email already exists.');
            } else {
                alert("We will send email to your email address to authenticate your email.\nTo be our member. you need to check our email.");
                frm.submit();
            }

        }
    });

}

function storyNewPost() {

    var frm = document.getElementById("storyForm");

    var orgText = "<!doctype html>";
        orgText += "<html>";
        orgText += "  <head>";
        orgText += "    <title>"+$('#title').val()+"</title>";
        orgText += "    <link href='https://cdn.quilljs.com/1.3.6/quill.snow.css' type='text/css' rel='stylesheet'>";
        orgText += "  </head>";
        orgText += "  <body>";
        orgText += document.querySelector('#snow-container').children[0].innerHTML;
        orgText += "  </body>";
        orgText += "</html>";

    frm.content.value = orgText;
    frm.submit();		

}

function showWordLayer() {
    ReadingPractice();
    $('#word_container').css('display', 'block');
    $('#jb_txtEditor').css('display', 'none');
}

function hideWordLayer() {
    ReadingPractice();
    $('#word_container').css('display', 'none');
    $('#jb_txtEditor').css('display', 'block');
}

function goThatStory() {

    document.location.href = '/catalog/story/'+$("#story").val();

}