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
    }

    $( "#docTitle" ).html( document.getElementsByTagName('title')[0].innerHTML );
    $( "#jb_content" ).bind('dblclick', function(e){
        search();
        imageSearch();
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
        
    });

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
        var w = getSelection().getRangeAt(0);
        w.surroundContents(nNd);
        $('span').css({"color":"blue"});
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
        dicAddr = "http://c.merriam-webster.com/coredictionary/"+selectText;
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
    if (wordArray.length == 0) {
        document.querySelector('#snow-container').children[0].innerHTML = "<strong>"+selectText+"</strong>";
    } else {
        document.querySelector('#snow-container').children[0].innerHTML = html + "<strong>"+selectText+"</strong>";
    }
    wordArray.push(selectText);
}

function ReadingOnly() {
    $('#jb_content').removeClass('col-lg-4');
    $('#jb_content').addClass('col-lg-12');
    $('#jb_content').css('padding', '0 25% 0 25%');
    $('#jb_txtEditor').css('display', 'none');
    $('#jb_sidebar').css('display', 'none');
}

function ReadingPractice() {
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').addClass('col-lg-4');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_txtEditor').css('display', 'block');
    $('#jb_sidebar').css('display', 'block');
}