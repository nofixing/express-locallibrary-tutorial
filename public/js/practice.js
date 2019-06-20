var selectText = "";
var selectContent = "";
var wordArray = [];
var dicAddr = "https://c.merriam-webster.com/coredictionary/";
$(function(){
    var showData = $('#show_img');
    $.support.cors = true;

    var prevScrollpos = window.pageYOffset;
    window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos >= currentScrollPos) {
            document.getElementById("navbar").style.top = "0";
        } else {
            document.getElementById("navbar").style.top = "-600px";
        }
        prevScrollpos = currentScrollPos;
        if ($(this).scrollTop() > 50) {
            $('#back-to-top').addClass('show');
            setTimeout(function(){ $('#back-to-top').removeClass('show'); }, 3000);
        } else {
            $('#back-to-top').removeClass('show');
        }
    };

    // scroll body to 0px on click
    $('#back-to-top').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 800);
        return false;
    });

    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
    //console.log("height:"+height);

    if ( height < 1200 ) {
        //console.log("body.height");
        $("body").height(1200);
    }

    $( "#docTitle" ).html( document.getElementsByTagName('title')[0].innerHTML );
    
    $( "#jb_content" ).bind('dblclick', function(e){
        search();
        imageSearch();
        
        if (selectText.length > 0) {
            var data = {};
            data.title = selectText;
            data.story_id = $( "#story_id" ).val();
            data.book_id = $( "#book_id" ).val();
            data.story_title = $( "#story_title" ).val();
            data.book_title = $( "#book_title" ).val();
            data.word_id = '';
            data.skill = '1';
            data.importance = '1';
            data.content = '';
            var httpType = 'https://';
            if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: httpType+$('#hostname').val()+'/catalog/word/create',
                async: false,
                success : function(data) {
                    console.log("jb_content dblclick");
                    selectContent = data.content;
                    var markup = "<tr><td style='text-align: center;'><div class='checkbox'><input type='checkbox' class='wList' value='"+data.word_id+"'></div></td>";
                    markup += "<td><input type='text' size='15' maxlength='30' class='form-control ipt' value='"+data.title+"'>";
                    markup += "<input type='hidden' class='form-control iph' value=''>";

                    markup += "<select class='importance form-control' style='margin-top: 10px;'>";
                    markup += "<option value='1'>"+$('#NotImportance').val()+"</option>";
                    markup += "<option value='2'>"+$('#Important').val()+"</option>";
                    markup += "<option value='3'>"+$('#VeryImportance').val()+"</option>";
                    markup += "<option value='4'>"+$('#Indispensable').val()+"</option></td>";

                    markup += "<td><textarea class='form-control txt' rows='1' cols='45'>"+data.content+"</textarea>";

                    markup += "<select class='skill form-control' style='display: inline; width: 200px; margin-top: 10px;'>";
                    markup += "<option value='1'>"+$('#NotKnow').val()+"</option>";
                    markup += "<option value='2'>"+$('#SawSeveralTime').val()+"</option>";
                    markup += "<option value='3'>"+$('#BeUsedTo').val()+"</option>";
                    markup += "<option value='4'>"+$('#RememberComplete').val()+"</option>";
                    markup += "</select>";
                    markup += "<button type='button' class='btn btn-primary' style='display: inline; float: right; margin-top: 8px;' onclick='imgAddress(-1)'>";
                    markup += $('#ImageAddress').val();
                    markup += "</button></td></tr>";

                    $(".wtd").append(markup);

                    wordList();
        
                }
            });
        }
    });
    
    $( "#jb_content" ).on("taphold", function(){
        //console.log("tapholdHandler");
        var selection;
        if (window.getSelection) {
        selection = window.getSelection();
        } else if (document.selection) {
        selection = document.selection.createRange();
        }
        selectText = selection.toString().trim();

        if (selectText.length > 0) {
            var data = {};
            data.title = selectText;
            data.story_id = $( "#story_id" ).val();
            data.book_id = $( "#book_id" ).val();
            data.story_title = $( "#story_title" ).val();
            data.book_title = $( "#book_title" ).val();
            data.word_id = '';
            data.skill = '1';
            data.importance = '1';
            var httpType = 'https://';
            if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: httpType+$('#hostname').val()+'/catalog/word/create',
                async: false,
                success : function(data) {
        
                    var markup = "<li style='font-weight:bold'>"+data.title+"</li>";
                    $(".wsd").append(markup);
        
                }
            });
        }
    });

    $( ".ui-loader-header" ).text( "" );

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
                 data: "key=AIzaSyCBr1dGpg2bB-eTAXKFgnvpKL6vdSYQTSI&cx=012222057275105284918:2fhqptrxpgk&q="+selectText+"&num=10&start=1&imgSize=medium&searchType=image",
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
                data.book_id = $( "#book_id" ).val();
                data.story_title = $( "#story_title" ).val();
                data.book_title = $( "#book_title" ).val();
                data.title = $('.ipt')[idx].value;
                data.content = $('.txt')[idx].value;
                data.importance = $('.importance')[idx].value;
                data.skill = $('.skill')[idx].value;
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
        alert($('#SAVED').val());
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
        alert($('#DELETED').val());
    });

    $('#wordAdd').click(function(){
        var markup = "<tr><td style='text-align: center;'><div class='checkbox'><input type='checkbox' class='wList' value=''></div></td>";
        markup += "<td><input type='text' size='15' maxlength='30' class='form-control ipt' value=''>";
        markup += "<input type='hidden' class='form-control iph' value=''>";
        
        markup += "<select class='importance form-control' style='margin-top: 10px;'>";
        markup += "<option value='1'>"+$('#NotImportance').val()+"</option>";
        markup += "<option value='2'>"+$('#Important').val()+"</option>";
        markup += "<option value='3'>"+$('#VeryImportance').val()+"</option>";
        markup += "<option value='4'>"+$('#Indispensable').val()+"</option></td>";

        markup += "<td><textarea class='form-control txt' rows='1' cols='45'></textarea>";

        markup += "<select class='skill form-control' style='display: inline; width: 200px; margin-top: 10px;'>";
        markup += "<option value='1'>"+$('#NotKnow').val()+"</option>";
        markup += "<option value='2'>"+$('#SawSeveralTime').val()+"</option>";
        markup += "<option value='3'>"+$('#BeUsedTo').val()+"</option>";
        markup += "<option value='4'>"+$('#RememberComplete').val()+"</option>";
        markup += "</select>";
        markup += "<button type='button' class='btn btn-primary' style='display: inline; float: right; margin-top: 8px;' onclick='imgAddress(-1)'>";
        markup += $('#ImageAddress').val();
        markup += "</button></td></tr>";
        $(".wtd").append(markup);
    });

    var bVa = $("#book").val();
    if(typeof bVa != 'undefined' && bVa != '') {
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
                    $('#index').append($("<a></a>")
                        .attr("class", "dropdown-item")
                        .attr("href", "#none")
                        .attr("onclick", "stogo('"+story._id+"');return false;")
                        .text(story.chapter+story.title));
                });
            }
        });
    }

    $('#favs').click(function(){
        var data = {};
        data.story_id = $( "#story_id" ).val();
        data.facnt = $("#facnt").val();
        data.stusr = $("#stusr").val();
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/story/favs_ajax',
            success : function(data) {
                if(data.fayn == 'Y') {
                    alert($("#favy").val());
                } else {
                    alert($("#favn").val());
                }
                //alert('Recommended');
            }
        });
    });

    var $audio = $('#myAudio');
    $('#file').on('change', function(e) {
    var target = e.currentTarget;
    var file = target.files[0];
    var reader = new FileReader();
    
    console.log($audio[0]);
    if (target.files && file) {
            reader.onload = function (e) {
                $audio.attr('src', e.target.result);
                $audio.play;
            }
            reader.readAsDataURL(file);
        }
    });

    var $audio2 = $('#myAudio2');
    $('#file2').on('change', function(e) {
        var target = e.currentTarget;
        var file = target.files[0];
        var reader = new FileReader();
        
        console.log($audio2[0]);
        if (target.files && file) {
            reader.onload = function (e) {
                $audio2.attr('src', e.target.result);
                $audio2.play;
            }
            reader.readAsDataURL(file);
        }
    });

    $('.tltp').tooltip({html: true, placement: "right"});

    $('#InsertImgAddr').click(function(){
        var data = {};
        data.id = $('#w_id').val();
        data.image_address = $( "#iddr_name" ).val();
        var idx = $('#widx').val();
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/word/updateImgAddr',
            async: false,
            success : function(data) {
                $('.iph')[idx].value = $( "#iddr_name" ).val();
                alert($("#SAVED").val());
                $('#tcs')[0].click();
            }
        });
    });

});

function imgAddress(i) {
    if(i == -1){
        return;
    }
    $('.wList').each(function(idx) {
        if (idx == i && $(this).val() != '') {
            $('#w_id').val($(this).val());
            $('#widx').val(i);
            $('#w_name').val($('.ipt')[idx].value);
            $('#iddr_name').val($('.iph')[idx].value);
            $('#ImageModal')[0].click();
        }
    });
}
  
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
        /*
        var span = document.createElement("span");
        span.setAttribute("class", "hgt");
        var range = window.getSelection().getRangeAt(0);
        span.appendChild(range.extractContents());
        range.insertNode(span);
        $('.hgt').css({"color":"blue"});
        */
    }
    

}

function BookMark() {

    var selection;
    var lnk = Date.now();
    
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }
    selectText = selection.toString().trim();
    
    if (selectText.length > 0) {
        var span = document.createElement('span');
        span.id = lnk;
        var range = window.getSelection().getRangeAt(0);
        span.appendChild(range.extractContents());
        range.insertNode(span);
    } else {
        alert("북마크할 단어를 선택해 주세요.");
        return;
    }

    var data = {};
    data.story_id = $( "#story_id" ).val();
    data.bookMark_id =$( "#bookMark_id" ).val();
    data.content = document.getElementById('st_content').innerHTML;
    data.anchor = lnk;
    //console.log(data.content);
    //return;
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/catalog/story/bookMark_ajax',
        async: false,
        success : function(data) {
            $('#bookMark_id').val(data.bookMark_id);
            alert($("#SAVED").val());
        }
    });
    
}

function goBokM(url) {
    location.href = "#"+url;
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
    } else if ($("#dicType").val() == "5") {
        dicAddr = "https://www.wordreference.com/enko/"+selectText;
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
        document.querySelector('#snow-container').children[0].innerHTML = 
            "<p class='ql-font-PTSans' style='font-size:2em;'><strong>"+selectText+"&nbsp;&nbsp;&nbsp;"+selectContent+"</strong></p>";
    } else {
        document.querySelector('#snow-container').children[0].innerHTML = 
            html + "<br><p class='ql-font-PTSans' style='font-size:2em;'><strong>"+selectText+"&nbsp;&nbsp;&nbsp;"+selectContent+"</strong></p>";
    }
    wordArray.push(selectText);
}

function ReadingOnly() {
    $('#jb_content').removeClass('col-lg-4');
    $('#jb_content').removeClass('col-lg-6');
    $('#jb_content').removeClass('col-lg-8');
    $('#jb_content').addClass('col-lg-12');
    //$('#jb_content').css('padding', '0 10% 0 10%');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').css('display', 'none');
    //$('.hgt').css('color', 'black');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(1)").addClass("active");
        } else {
            $(".nav-item:eq(0)").addClass("active");
        }
    }
}

function LearnReading() {
    $('#jb_content').removeClass('col-lg-4');
    $('#jb_content').removeClass('col-lg-6');
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').addClass('col-lg-8');
    //$('#jb_content').css('padding', '0 10% 0 10%');
    $('#jb_memo').css('display', 'block');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').css('display', 'none');
    //$('.hgt').css('color', 'black');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(2)").addClass("active");
        } else {
            $(".nav-item:eq(1)").addClass("active");
        }
    }
}

function showReadingOnlyLayer() {
    $('#jb_content').css('display', 'block');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#word_only_container').css('display', 'none');
    $('#jb_only_txtEditor').css('display', 'none');
    $('#jb_sidebar').css('display', 'none');
    $('.navbar-collapse').collapse('hide');
}

function ReadingSearch() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        alert("use this from PC");
    }
    $('#jb_content').removeClass('col-lg-4');
    $('#jb_content').removeClass('col-lg-8');
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').addClass('col-lg-6');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').removeClass('col-lg-4');
    $('#jb_sidebar').addClass('col-lg-6');
    $('#jb_sidebar').css('display', 'block');
    //$('.hgt').css('color', 'black');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(3)").addClass("active");
        } else {
            $(".nav-item:eq(2)").addClass("active");
        }
    }
}

function ReadingPractice() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        alert("use this from PC");
    }
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').removeClass('col-lg-8');
    $('#jb_content').removeClass('col-lg-6');
    $('#jb_content').addClass('col-lg-4');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'block');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').removeClass('col-lg-6');
    $('#jb_sidebar').addClass('col-lg-4');
    $('#jb_sidebar').css('display', 'block');
    //$('.hgt').css('color', 'blue');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(4)").addClass("active");
        } else {
            $(".nav-item:eq(3)").addClass("active");
        }
    }
}

function showWordLayer() {
    ReadingPractice();
    $('#word_container').css('display', 'block');
    $('#jb_txtEditor').css('display', 'none');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(5)").addClass("active");
        } else {
            $(".nav-item:eq(4)").addClass("active");
        }
    }
}

function showWordOnlyLayer() {
    $('#jb_content').css('display', 'none');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#word_only_container').css('display', 'block');
    $('#jb_only_txtEditor').css('display', 'none');
    $('#jb_sidebar').css('display', 'none');
    $('.navbar-collapse').collapse('hide');
}

function showMemoOnlyLayer() {
    $('#jb_content').css('display', 'none');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#word_only_container').css('display', 'none');
    $('#jb_only_txtEditor').css('display', 'block');
    $('#jb_sidebar').css('display', 'none');
    $('.navbar-collapse').collapse('hide');
}

function hideWordLayer() {
    ReadingPractice();
    $('#word_container').css('display', 'none');
    $('#jb_txtEditor').css('display', 'block');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(6)").addClass("active");
        } else {
            $(".nav-item:eq(5)").addClass("active");
        }
    }
}

function DeleteStory(a, b) {
    if ( a != b ) {
        alert($("#dmm").val());
        return;
    }
    document.location.href = '/catalog/story/'+$("#story_id").val()+'/delete';
}

function UpdateStory(a, b) {
    if ( a != b ) {
        alert($("#smm").val());
        return;
    }
    document.location.href = '/catalog/story/'+$("#story_id").val()+'/update';
}

function CreateStory() {
    document.location.href = '/catalog/story/create?book='+$("#book").val();
}

function storyPost() {

    var frm = document.getElementById("storyForm");
    var sel = frm.book;
    if ( $("#book").val() != "" ) {
        $("#btitle").val( sel.options[sel.selectedIndex].text );
    }
    /*
    var tContent = txtArea.value;
    var find = '<p><br></p>';
    var re = new RegExp(find, 'g');
    tContent = tContent.replace(re, '');
    document.querySelector('#snow-container').children[0].innerHTML = tContent;
    */
    frm.content.value = document.querySelector('#snow-container').children[0].innerHTML;
    //alert(frm.btitle.value);
    //return;
    frm.submit();

}

function preview() {

    var content = document.querySelector('#snow-container').children[0].innerHTML;

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/catalog/story/preview");

    form.setAttribute("target", "view");

    var hiddenField = document.createElement("input"); 
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "content");
    hiddenField.setAttribute("value", content);
    form.appendChild(hiddenField);
    document.body.appendChild(form);

    window.open('', 'view');

    form.submit();

}

function userPost(param1, param2) {

    var frm = document.getElementById("userForm");
    if(frm.name.value == '' || frm.email.value == '' || frm.password.value == '' || frm.confirmPassword.value == '') {
        alert("All fields required.");
        return;
    }
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
                alert(param1);
            } else {
                if(data.nameThere == 'Y') {
                    alert($('#nameThere').val());
                } else {
                    alert(param2);
                    frm.submit();
                }
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

function viewR(elem) {
    var id = $(elem).attr("id");
    id = id.substring(2);
    $("#d_" + id).toggle();
}

function viewU(elem, uid) {
    var id = $(elem).attr("id");
    id = id.substring(2);
    if ( $("#uid_" + id).val() != uid ) {
        alert($("#cmm").val());
        return;
    }
    $("#r_" + id).html($("#c_" + id).html());
    $("#cgb_" + id).val("U");
    $("#d_" + id).toggle();
}

function viewT(elem, uid) {
    var id = $(elem).attr("id");
    id = id.substring(2);
    if ( $("#uid_" + id).val() != uid ) {
        alert($("#cmm2").val());
        return;
    }
    if ( $("#cyn_" + id).val() == "Y" ) {
        alert($("#cmm3").val());
        return;
    }
    $("#r_" + id).html($("#c_" + id).html());
    $("#cgb_" + id).val("T");
    $("#b_" + id).html($("#Delete").val());
    $("#d_" + id).toggle();
}

function WordCount(str) { 
    return str.split(" ").length;
}

function home() {
    document.location.href = '/catalog/';
}

function stogo(id) {
    document.location.href = '/catalog/story/'+id;
}
function books() {
    document.location.href = '/catalog/books';
}
function stories() {
    document.location.href = '/catalog/stories';
}
function story_open_list() {
    document.location.href = '/catalog/story_open_list';
}
function logout() {
    document.location.href = '/user/logout';
}
function login() {
    document.location.href = '/user/login';
}
function registration() {
    document.location.href = '/user/registration';
}

function smf() {
    var frm = document.getElementById("cmf");
    frm.submit();		
}
function smf2(comment_id) {
    var frm = document.getElementById("cmf_"+comment_id);
    frm.submit();		
}

function saveMemo() {
        
    var data = {};
    data.story_id = $( "#story_id" ).val();
    data.content = document.querySelector('#snow-container').children[0].innerHTML;
    data.memo_id = $('#memo_id').val();
    console.log('save click');
    console.log(data.content);
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/catalog/memo/create',
        async: false,
        success : function(data) {
            $('#memo_id').val(data.memo_id);
            alert($('#SAVED').val());
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
}