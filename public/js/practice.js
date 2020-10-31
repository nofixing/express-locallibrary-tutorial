var selectText = "";
var selectContent = "";
var wordArray = [];
var dicAddr = "https://c.merriam-webster.com/coredictionary/";
var oxfordWord_id = "";
var oxfordWord_word = "";
var kword = '';
var startImagNum = 1;
$(function(){
    var showData = $('#show_img');
    var tooltip = $('#tooltip').val();
    if(tooltip == 'y' && $("#pc").val() == "DESKTOP") LearnReading();

    $.support.cors = true;

    var prevScrollpos = window.pageYOffset;
    window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        //console.log("currentScrollPos:"+currentScrollPos);
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
        
        var selection;
    
        if (window.getSelection) {
            selection = window.getSelection();
        } else if (document.selection) {
            selection = document.selection.createRange();
        }
        selectText = selection.toString().trim();

        dicSearch();
        imageSearch();
        createWord();
    });

    function createWord() {
        var ldxx = 0;
        var isNot = true;
        $('.wList').each(function(idx) {
            console.log("previous words:"+$('.ipt')[idx].value);
            if (selectText.toLowerCase() == $('.ipt')[idx].value.toLowerCase()) {
                console.log("front already exists");
                selectText = '';
            }
            ldxx = idx;
            isNot = false;
        });
        ldxx += 1;
        if (isNot) ldxx = 0;

        if (selectText.length > 0) {
            var data = {};
            data.title = selectText;
            data.story_id = $( "#story_id" ).val();
            data.story_user = $( "#stusr" ).val();
            data.book_id = $( "#book_id" ).val();
            data.story_title = $( "#story_title" ).val();
            data.book_title = $( "#book_title" ).val();
            data.word_id = '';
            data.skill = '1';
            data.importance = '1';
            data.content = kword;
            console.log('before word save, data.content:'+data.content);
            data.result = $('#SAVED').val();
            data.fail = $('#smm').val();
            data.oxfordWord_id = oxfordWord_id;
            data.index_of = $('#st_content').text().indexOf(selectText);
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
                    if (data.result != data.fail) {
                        selectContent = data.content;
                        if (oxfordWord_word != '') data.title = oxfordWord_word;
                        var markup = "<tr style='min-height: 30px; vertical-align: top;'><td style='width: 120px; text-align: left;'>"+data.title+"</td>";
                        markup += "<td><input type='text' id='wrd_"+data.word_id+"' class='form-control form-control-sm' value='"+data.content+"' /></td>";
                        markup += "<td style='width: 180px; text-align: left;'><span>";
                        markup += "<i class='fas fa-save' style='margin-left: 10px; cursor: pointer;' onclick='wrdSave(\""+data.word_id+"\")'></i>";
                        markup += "<i class='fas fa-book-open' style='margin-left: 10px; cursor: pointer;' onclick='wordPopup(\""+data.word_id+"\")'></i>";
                        markup += "<i class='fas fa-graduation-cap' style='margin-left: 10px; cursor: pointer;' onclick='oxfordPopup(\""+data.title+"\")'></i>";
                        markup += "<i class='fas fa-photo-video' style='margin-left: 10px; cursor: pointer;' onclick='imgAddress("+ldxx+")'></i>";
                        markup += "<i class='fas fa-trash-alt' style='margin-left: 10px; cursor: pointer;' onclick='wordDelete(this, \""+data.word_id+"\")'></i></span>";
                        markup += "<input type='hidden' class='wList' value='"+data.word_id+"'>";
                        markup += "<input type='hidden' class='ipt' value='"+data.title+"'>";
                        markup += "<input type='hidden' class='iph' value=''></td>";
                        markup += "</tr>";

                        $(".wtd").append(markup);

                        wordList();
                    }
                }
            });
        }
    }

    window.CallParent = function(id, cntn) {
        document.getElementById('wrd_'+id).value = cntn;
    }

    $('#wdtb tr').hover(function() {
        $(this).find("span").show();
    }, function() {
        $(this).find("span").hide();
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
            data.story_user = $( "#stusr" ).val();
            data.book_id = $( "#book_id" ).val();
            data.story_title = $( "#story_title" ).val();
            data.book_title = $( "#book_title" ).val();
            data.word_id = '';
            data.skill = '1';
            data.importance = '1';
            data.result = $('#SAVED').val();
            data.fail = $('#smm').val();
            var httpType = 'https://';
            if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: httpType+$('#hostname').val()+'/catalog/word/create',
                async: false,
                success : function(data) {
                    if (data.result != data.fail) {
                        var markup = "<li style='font-weight:bold'>"+data.title+"</li>";
                        $(".wsd").append(markup);
                    }
                }
            });
        }
    });

    $( ".ui-loader-header" ).text( "" );

    $( "#searchWordButton" ).click(function() {
        selectText = $("#searchStoryWord").val();
        dicSearch();
        imageSearch();
        createWord();
    });

    $( "#translateButton" ).click(function() {
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
            const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if(korean.test(selectText)) {
                data.src = 'ko';
                data.tgt = 'en';
            } else {
                data.src = 'en';
                data.tgt = 'ko';
            }
            data.content = '';
            var httpType = 'https://';
            if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: httpType+$('#hostname').val()+'/catalog/word/translate',
                async: false,
                success : function(data) {
                    console.log('translatedText:'+data.content);
                    $('#translatedText').html(data.content);
                    //$('#TranslationModal')[0].click();
                    selectContent = data.content;
                    $('#translateModal').addClass("show");
                    $('#translateModal').css('display', 'block');
                    $('#translateModal').attr('aria-hidden', 'false');
                    $('.modal-backdrop.show').css('display', 'block');
                    $('body').addClass("modal-open");
                    $('body').css('padding-right', '10px');
                    $( '<div class="modal-backdrop fade show"></div>' ).appendTo( 'body' );
                    wordList();
                }
            });
        }
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
                 data: "key=AIzaSyCBr1dGpg2bB-eTAXKFgnvpKL6vdSYQTSI&cx=012222057275105284918:2fhqptrxpgk&q="+selectText+"&num=10&start="+startImagNum+"&imgSize=medium&searchType=image",
                 dataType: 'JSON',
                 success: function(data){
                    showData.empty();
                    $.each(data.items, function (i, item) {
                        if(i == 0) showData.append('<ul />');
                        showData.append('<li><a href="'+item.image.contextLink+'" target="_blank"><img src="'+item.link+'" alt="'+item.title+'"></a><br/>'+item.title+'<br/>'+item.snippet + '</li>');
                    });
                 }
            });
        }			
    
    }

    $( "#nextImageButton" ).click(function() {
        startImagNum += 1;
        imageSearch();
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
        var checked = false;
        $('.wList').each(function(idx) {
            if ($(this).prop('checked')) {
                checked = true;
            }
        });
        if (!checked) {
            alert($('#CheckWords').val());
            return;
        }
        $('.wList').each(function(idx) {
            if ($(this).prop('checked')) {
                var data = {};
                data.id = $(this).val();
                data.story_id = $( "#story_id" ).val();
                data.story_user = $( "#stusr" ).val();
                data.book_id = $( "#book_id" ).val();
                data.story_title = $( "#story_title" ).val();
                data.book_title = $( "#book_title" ).val();
                data.title = $('.ipt')[idx].value;
                data.content = $('.txt')[idx].value;
                data.importance = $('.importance')[idx].value;
                data.skill = $('.skill')[idx].value;
                data.result = $('#SAVED').val();
                data.fail = $('#smm').val();
                data.index_of = $('#st_content').text().indexOf(data.title);
                var httpType = 'https://';
                if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: httpType+$('#hostname').val()+'/catalog/word/update',
                    async: false,
                    success : function(data) {
                        $(this).val(data.id);
                        //alert(data.result);
                    }
                });
            }
        });
        alert( $('#SAVED').val() );
        $('.wList:not(#checkall)').each(function () {
            $(this).prop('checked', false);
        });
        $('#checkall').prop('checked', false);
        //location.reload();
    });

    $('#wordDelete').click(function(){
        var checked = false;
        $('.wList').each(function(idx) {
            if ($(this).prop('checked')) {
                checked = true;
            }
        });
        if (!checked) {
            alert($('#CheckWords').val());
            return;
        }
        var isDel = true;
        $('.wList').each(function(idx) {
            if ($(this).prop('checked')) {
                var data = {};
                data.id = $(this).val();
                data.story_user = $( "#stusr" ).val();
                data.result = $('#DELETED').val();
                data.fail = $('#smm').val();
                var httpType = 'https://';
                if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: httpType+$('#hostname').val()+'/catalog/word/delete',
                    async: false,
                    success : function(data) {
                        if(data.result == data.fail) isDel = false;
                    }
                });
            }
        });
        if (isDel) {
            $('.wList').each(function(){
                if($(this).prop('checked')){
                    $(this).parents("tr").remove();
                }
            });
            alert($('#DELETED').val());
        }
        $('.wList:not(#checkall)').each(function () {
            $(this).prop('checked', false);
        });
        $('#checkall').prop('checked', false);
        //location.reload();
    });

    $('#wordAdd').click(function(){

        var ldxx = 0;
        $('.wList').each(function(idx) {
            ldxx = idx;
        });
        ldxx += 1;

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
        markup += "<button type='button' class='btn btn-primary' style='display: inline; float: right; margin-top: 8px;' onclick='imgAddress("+ldxx+")'>";
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
    
    var tft = $("#title_font").val();
    if(typeof tft != 'undefined' && tft != '') {
         
        var fary = {WorkSans:"Work Sans",LibreFranklin:"Libre Franklin",Inconsolata:"Inconsolata",roboto:"Roboto",
                    mirza:"Mirza",arial:"Arial",Oswald:"Oswald",Caveat:"Caveat",
                    Raleway:"Raleway",
                    ShadowsIntoLight:"Shadows Into Light",AbrilFatface:"Abril Fatface",
                    Teko:"Teko",Cormorant:"Cormorant",
                    AlfaSlabOne:"Alfa Slab One",PTSans:"PT Sans",NanumPenScript:"나눔 손글씨 펜",
                    NanumBrushScript:"나눔 손글씨 붓",
                    SongMyung:"송명",Gaegu:"개구쟁이",Jua:"주아",GamjaFlower:"감자꽃 마을",
                    CuteFont:"귀여운 폰트",Stylish:"스타일리시",YeonSung:"연성",
                    HiMelody:"하이멜로디",Sunflower:"해바라기",
                    BlackHanSans:"검은고딕",GothicA1:"고딕 A1",NanumGothic:"나눔고딕",
                    NanumMyeongjo:"나눔명조",PoorStory:"서툰이야기",
                    BlackAndWhitePicture:"흑백사진"};
        
        $('#tfnt').text(fary[tft.substring(8)]);
    }
    var sft = $("#title_size").val();
    if(typeof sft != 'undefined' && sft != '') {
        $('#sfnt').text(sft);
    }
    var wft = $("#title_weight").val();
    if(typeof wft != 'undefined' && wft != '') {
        $('#wfnt').text(wft);
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
            url: httpType+$('#hostname').val()+'/catalog/story_favs_ajax',
            success : function(data) {
                if(data.fayn == 'Y') {
                    alert($("#favy").val());
                } else {
                    alert($("#favn").val());
                }
                //alert('Recommended');
            },
            error: function(jqXHR) {
                alert(jqXHR.responseText);
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

    //$('.tltp').tooltip({html: true, placement: "right"});
    /*
    $('.tltp').tooltipster({   
        'theme': 'tooltipster-shadow',
        'interactive': true,
        'contentAsHTML': true,
        'autoClose': true,
        'side': 'bottom',
        'animation': 'fall',
        'trigger': 'click',
        'delay': '200',
        functionInit: function(instance, helper){
            var $origin = $(helper.origin);
            var content = $origin.find('.tpcontent').detach();
            instance.content(content);       
        }
    });
    */
   $('.tltp').tooltipster({
        theme: 'tooltipster-shadow',
        interactive: true,
        contentAsHTML: true,
        //autoClose: true,
        position: 'bottom',
        animation: 'grow',
        //trigger: 'click',
        //delay: '200',
        maxWidth: 640
    });

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

    if (document.getElementById('fileUpload') !=null) {
        var fileForm = document.getElementById('fileUpload');

        fileForm.addEventListener('submit', function(ev) {
            console.log('fileUpload started.');
            $("div.spanner").addClass("show");
            $("div.overlay").addClass("show");

            var oData = new FormData(fileForm);

            oData.append("CustomField", "This is some extra data");

            var oReq = new XMLHttpRequest();
            oReq.open("POST", "/upload", true);
            oReq.onload = function(oEvent) {
              if (oReq.status == 200) {
                $("div.spanner").removeClass("show");
                $("div.overlay").removeClass("show");
                var arr = oReq.responseText.split('&');
                var markup = "<tr><td><span id='"+arr[1]+"'>"+arr[2]+"</span>";
                markup += "&nbsp;<button class='btn btn-primary' onclick=CopyFilePath('"+arr[0]+"')>"+$("#cptr").val()+"</button>";
                markup += "&nbsp;<button class='btn btn-primary' onclick=DeleteFile('"+arr[1]+"','"+arr[0]+"')>"+$("#Delete").val()+"</button>";
                markup += "</td></tr>";
                $(".fts").append(markup);
                alert($("#Uploaded").val());
              } else {
                console.log('oReq.status:'+oReq.status);
				$("div.spanner").removeClass("show");
                $("div.overlay").removeClass("show");
                alert($("#UploadFailed").val());
              }
            };

            oReq.send(oData);
            ev.preventDefault();
        }, false);
    }

    $('.tts').click(function(){
        $('#translateModal').removeClass("show");
        $('#translateModal').css('display', 'none');
        $('#translateModal').attr('aria-hidden', 'true');
        //$('.modal-backdrop.show').css('display', 'none');
        $('.modal-backdrop').remove();
        $('body').removeClass("modal-open");
        $('body').css('padding-right', '');
    });

    $('#loading').hide();
});

function wrdSave(id) {
    var data = {};
    data.content = document.getElementById('wrd_'+id).value;
    data.id = id;
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/catalog/wrdSave',
        async: false,
        success : function(data) {

            alert($('#SAVED').val());

        }
    });
}

function wordDelete(o, id) {
    var data = {};
    data.id = id;
    data.story_user = $( "#stusr" ).val();
    data.result = $('#DELETED').val();
    data.fail = $('#smm').val();
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/catalog/word/delete',
        async: false,
        success : function(data) {
            if (typeof(o) == "object") {
                $(o).closest("tr").remove();
            }
            alert($('#DELETED').val());
        }
    });
}

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

function oxfordPopup(wd) {
    selectText = wd;
    dicSearch();
}

function wordPopup(w_id) {
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    window.open(httpType+$('#hostname').val()+"/catalog/word_popup?w_id="+w_id, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=250,left=200,width=650,height=600");
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
        url: httpType+$('#hostname').val()+'/catalog/story_bookMark_ajax',
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
    
    /*
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
    */
    
    if (selectText.length > 0) {
        var data = {};
        data.word = selectText.replace(/ /g, '_');
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        kword = '';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/catalog/story_oxford_ajax',
            async: false,
            success : function(data) {
                console.log('data.dic_kcontent:'+data.dic_kcontent+";");
                if (typeof data.oxfordWord_id != 'undefined') {
                    oxfordWord_id = data.oxfordWord_id;
                } else {
                    oxfordWord_id = '';
                }
                if (typeof data.oxfordWord_word != 'undefined') {
                    oxfordWord_word = data.oxfordWord_word.replace(/_/g, ' ');
                } else {
                    oxfordWord_word = '';
                }
                processDicData(data.dic_content, data.dic_kcontent, data.translation);
            },
            error: function(xhr, status, error) {
                oxfordWord_id = '';
                oxfordWord_word = '';
            }
        });
    }
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
    /*
    if (wordArray.length == 0 && $("#memo").val() == "") {
        document.querySelector('#snow-container').children[0].innerHTML = 
            "<p class='ql-font-PTSans' style='font-size:2em;'><strong>"+selectText+"&nbsp;&nbsp;&nbsp;"+selectContent+"</strong></p>";
    } else {
        document.querySelector('#snow-container').children[0].innerHTML = 
            html + "<br><p class='ql-font-PTSans' style='font-size:2em;'><strong>"+selectText+"&nbsp;&nbsp;&nbsp;"+selectContent+"</strong></p>";
    }
    */
    var selectedW = "<span class='ql-font-"+$('#cfnt').val()+"'>"+selectText+"</span>";
    var selectedC = selectContent;
    if ($('#cfnt2').val() != '') selectedC = "<span style='font-size: 1.5em;' class='ql-font-"+$('#cfnt2').val()+"'>"+selectedC+"</span>";
    document.querySelector('#snow-container').children[0].innerHTML = 
            html + "<br><p><span style='font-size: 1.5em;'><strong>"+selectedW+"&nbsp;&nbsp;&nbsp;"+selectedC+"</strong></span></p>";
    wordArray.push(selectText);
    saveMemo('Y');
}

function ReadingOnly() {
    $('#jb_content').removeClass('col-lg-6');
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
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').addClass('col-lg-6');
    //$('#jb_content').css('padding', '0 10% 0 10%');
    $('#jb_memo').css('display', 'block');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').css('display', 'inline-block');
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
    $('#jb_content').removeClass('col-lg-12');
    $('#jb_content').addClass('col-lg-6');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'none');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').css('display', 'inline-block');
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
    $('#jb_content').addClass('col-lg-6');
    $('#jb_content').css('padding', '0 20px 20px 20px');
    $('#jb_memo').css('display', 'none');
    $('#jb_txtEditor').css('display', 'block');
    $('#word_container').css('display', 'none');
    $('#jb_sidebar').css('display', 'inline-block');
    //$('.hgt').css('color', 'blue');
    if($("#pc").val() == "DESKTOP") {
        $(".nav-item").removeClass("active");
        if($("#book").val() != "") {
            $(".nav-item:eq(3)").addClass("active");
        } else {
            $(".nav-item:eq(2)").addClass("active");
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
            $(".nav-item:eq(4)").addClass("active");
        } else {
            $(".nav-item:eq(3)").addClass("active");
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

function storyTooltip() {

    var frm = document.getElementById("ftlp");
    frm.submit();

}

function preview() {
    console.log('preview start');
    var content = document.querySelector('#snow-container').children[0].innerHTML;

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    
    if($("#story_id").val() != "") {
        form.setAttribute("action", "/catalog/story/"+$("#story_id").val()+"/preview");
    } else {
        form.setAttribute("action", "/catalog/preview");
    }
    
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

function saveMemo(autoYN) {
        
    var data = {};
    data.story_id = $( "#story_id" ).val();
    data.story_user = $( "#stusr" ).val();
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
        success : function(data) {
            $('#memo_id').val(data.memo_id);
            if(autoYN == 'N') alert($('#SAVED').val());
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

function CopyFilePath(path) {
    var textArea = document.createElement("textarea");
    path = path.replace(/‡/g, "'");
    console.log("path:"+path);
    textArea.value = path;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("Copy");
    textArea.remove();
}

function DeleteFile(id, path) {
    var arr = path.split('/');

    var data = {};
    data.file_id = id;
    data.file_name = arr[5];
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/upload/delete',
        async: false,
        success : function(data) {
            var rw = document.getElementById(id);
            if (typeof(rw) == "object") {
                $(rw).closest("tr").remove();
            }
            alert($('#DELETED').val());
        }
    });
}

function DeleteAllFiles() {
    if($('#email').val() == '' || $('#password').val() == '') {
        alert($('#requireField').val());
        return;
    }
    if( confirm($('#WithdrawalConfirm').val()) ) {
        var data = {};
        data.email = $('#email').val();
        data.password = $('#password').val();
        data.success = '';
        var httpType = 'https://';
        if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: httpType+$('#hostname').val()+'/upload/deleteFiles',
            async: false,
            success : function(data) {
                if(data.success == 'Y') {
                    alert($('#WithdrawalComplete').val());
                    document.location.href = '/catalog/';
                } else {
                    alert($('#WrongEP').val());
                }
            }
        });
    }
}

function cs_change_music(music) {
      
     document.getElementById("myAudio").pause();
     document.getElementById("myAudio").setAttribute('src', music);
     document.getElementById("myAudio").load();
     document.getElementById("myAudio").play();
}

function toggleSurface(sfnt, ffmt) {
    $('#tfnt').text(sfnt);
    var frm = document.getElementById("storyForm");
    frm.title_font.value = 'ql-font-'+ffmt;
}

function toggleSurface2(sfnt) {
    $('#sfnt').text(sfnt);
    var frm = document.getElementById("storyForm");
    frm.title_size.value = sfnt;
}

function toggleSurface3(wfnt) {
    $('#wfnt').text(wfnt);
    var frm = document.getElementById("storyForm");
    frm.title_weight.value = wfnt;
}

function closeDic() {
	$('#treeview1').css("display", "none");
}

function processDicData(dic_content, kdata, translation) {
    var simpleData = [];
    /*
    var element = {text:'Parent 1'};
    simpleData.push(element);
    simpleData.push({text:'Parent 2'});
    simpleData.push({text:'Parent 3'});
    simpleData.push({text:'Parent 4'});
    simpleData.push({text:'Parent 5'});
    simpleData[0].nodes = [];
    simpleData[0].nodes.push({text:'Child 1'});
    simpleData[0].nodes.push({text:'Child 2'});
    simpleData[0].nodes[0].nodes = [];
    simpleData[0].nodes[0].nodes.push({text:'Grandchild 1'});
    simpleData[0].nodes[0].nodes.push({text:'Grandchild 2'});
    */
    console.log('==========================================================================DicData:\n'+dic_content);
    var voca = JSON.parse(dic_content);
    if (typeof kdata == 'undefined') kdata = '{}';
    if (kdata != '{}') {
        console.log('==========================================================================kdata['+kdata+']');
        var kvoca = JSON.parse(kdata);
        console.log('==========================================================================kvoca['+kvoca+']');
        kvoca = kvoca.replace(/\\\"/g, "'");
        kvoca = kvoca.replace(/\"/g, '"');
        kvoca = JSON.parse(kvoca);
        var kmean = kvoca.mean;
        console.log('==========================================================================kmean:\n'+kmean);
        if (typeof kmean === 'object') {
            for (let i = 0; i < kmean.length; i++) {
                kword = kword + kmean[i];
                if (i < (kmean.length - 1)) {
                    kword = kword + ', ';
                }
            }
        }
    }
    console.log('==========================================================================kword:'+kword);
    if (kword.trim() == '') {
        kword = translation;
    } else {
        if (kword.indexOf(translation) < 0) kword += ', '+translation;
    }
    var cptxtf = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href=\'#\' onclick=\'CopyFilePath(`';
    var cptxtb = '`);return false;\' style=\'cursor: pointer;align:right;padding-right:30px;\'><i class=\'fa\'>&#xf0c5;</i></a>';
    var word_id = voca.id;
    var results = voca.results;
    var headWord = '';
    for (let i = 0; i < results.length; i++) {
        var word = results[i].word;
        if (i == 0) {
            headWord = '<a onclick="sentence(\''+word+'\');" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+word+'</a>&nbsp;&nbsp;&nbsp;&nbsp;'+kword;
            headWord += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            headWord += '<a href="#" onclick="closeDic();return false;" style="cursor: pointer;align:right;padding-right:30px;">'+$('#close').val()+'</a>';
        } else {
            headWord = '<a onclick="sentence(\''+word+'\');" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+word+'</a>';
        }
        simpleData.push({text: headWord, selectable: true});
        console.log('word: '+word);
        var id = results[i].id;
        //console.log('results['+i+'].id: '+results[i].id);
        var language = results[i].language;
        var lexicalEntries = results[i].lexicalEntries;
        for (let j = 0; j < lexicalEntries.length; j++) {
            if (j == 0) simpleData[i].nodes = [];
            var lexicalEntries_language = lexicalEntries[j].language;
            var lexicalCategory = lexicalEntries[j].lexicalCategory;
            if (typeof lexicalCategory === 'object') {
                var lexicalCategory_id = lexicalCategory.id;
                var lexicalCategory_text = lexicalCategory.text;
                console.log('lexicalCategory.text:'+lexicalCategory.text);
                simpleData[i].nodes.push({text:lexicalCategory.text, selectable: true});
            }
            var pronunciations = lexicalEntries[j].pronunciations;
            if (typeof pronunciations === 'object') {
                for (let k = 0; k < pronunciations.length; k++) {
                    var audioFile = pronunciations[k].audioFile;
                    if (typeof audioFile !== 'undefined') {
                        console.log('audioFile: '+audioFile);
                        simpleData[i].nodes[j].text = simpleData[i].nodes[j].text + '&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fas fa-volume-up" src="'+audioFile+'"></a>';
                    }
                    var dialects = pronunciations[k].dialects;
                    //console.log('dialects: '+dialects);
                    var phoneticNotation = pronunciations[k].phoneticNotation;
                    var phoneticSpelling = pronunciations[k].phoneticSpelling;
                }
            }
            var text = lexicalEntries[j].text;
            var derivativeOf = lexicalEntries[j].derivativeOf;
            if (typeof derivativeOf === 'object') {
                //console.log('derivativeOf: '+derivativeOf[0].text);
                simpleData[i].nodes.push({text:'derivativeOf: '+derivativeOf[0].text, selectable: true});
            }
            var derivatives = lexicalEntries[j].derivatives;
            if (typeof derivatives === 'object') {
                for (let k = 0; k < derivatives.length; k++) {
                    //console.log('derivatives['+k+'].text: '+derivatives[k].text);
                }
                simpleData[i].nodes.push({text:'derivatives: '+derivatives[0].text, selectable: true});
            }
            var entries = lexicalEntries[j].entries;
            for (let k = 0; k < entries.length; k++) {
                var grammaticalFeatures = entries[k].grammaticalFeatures;
                if (typeof grammaticalFeatures === 'object') {
                    var grammaticalFeatures_id = grammaticalFeatures[0].id;
                    var grammaticalFeatures_text = grammaticalFeatures[0].text;
                    //console.log('grammaticalFeatures[0].text: '+grammaticalFeatures[0].text);
                    var grammaticalFeatures_type = grammaticalFeatures[0].type;
                    //console.log('grammaticalFeatures[0].type: '+grammaticalFeatures[0].type);
                }
                var etymologies = entries[k].etymologies;
                if (typeof etymologies === 'object') {
                    //console.log('etymologies: '+etymologies);
                    console.log('simpleData['+i+']: '+JSON.stringify(simpleData[i]));
                    
                    if (typeof simpleData[i].nodes[j].nodes !== 'object') {
                        simpleData[i].nodes[j].nodes = [];
                        simpleData[i].nodes[j].nodes.push({text:'<b>etymologies:</b> '+etymologies+cptxtf+JSON.stringify(etymologies[0]).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                    } else {
                        simpleData[i].nodes[j].nodes.push({text:'<b>etymologies:</b> '+etymologies+cptxtf+JSON.stringify(etymologies[0]).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                    }
                
                }
                var homographNumber = entries[k].homographNumber;
                var entries_pronunciations = entries[k].pronunciations;
                if (typeof entries_pronunciations === 'object') {
                    for (let l = 0; l < entries_pronunciations.length; l++) {
                        var entries_audioFile = entries_pronunciations[l].audioFile;
                        if (typeof entries_audioFile !== 'undefined') {
                            console.log('entries_audioFile: '+entries_audioFile);
                            if (typeof simpleData[i].nodes[j].nodes !== 'object') {
                                simpleData[i].nodes[j].nodes = [];
                                simpleData[i].nodes[j].nodes.push({text:'&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fas fa-volume-up" src="'+entries_audioFile+'"></a>', selectable: true});
                            } else {
                                var isExists = false;
                                var isIdx = 0;
                                for (let v = 0; v < simpleData[i].nodes[j].nodes.length; v++) {
                                    if (simpleData[i].nodes[j].nodes[v].text.indexOf("mp3") > -1) {
                                        isExists = true;
                                        isIdx = v;
                                    }
                                }
                                if (isExists) {
                                    simpleData[i].nodes[j].nodes[isIdx].text = simpleData[i].nodes[j].nodes[isIdx].text + '&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fas fa-volume-up" src="'+entries_audioFile+'"></a>';
                                } else {
                                    simpleData[i].nodes[j].nodes.push({text:'&nbsp;<a onclick="playAudio(this);" style="cursor: pointer;" class="fas fa-volume-up" src="'+entries_audioFile+'"></a>', selectable: true});
                                }
                            }
                        }
                        var entries_dialects = entries_pronunciations[l].dialects;
                        //console.log('entries_dialects: '+entries_dialects);
                        var entries_phoneticNotation = entries_pronunciations[l].phoneticNotation;
                        var entries_phoneticSpelling = entries_pronunciations[l].phoneticSpelling;
                    }
                }
                var senses = entries[k].senses;
                for (let l = 0; l < senses.length; l++) {
                    
                    var ssIdx = 0;
                    
                    if (typeof simpleData[i].nodes[j].nodes !== 'object') simpleData[i].nodes[j].nodes = [];
                    
                    var constructions = senses[l].constructions;
                    if (typeof constructions === 'object') {
                        console.log('constructions: '+constructions[0].text);
                    }
                    
                    var definitions = senses[l].definitions;
                    if (typeof definitions !== 'undefined') {
                        console.log('definitions: '+definitions);
                        simpleData[i].nodes[j].nodes.push({text:'<b>'+definitions+'</b>'+cptxtf+JSON.stringify(definitions[0]).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                        ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                    }
                    var crossReferenceMarkers = senses[l].crossReferenceMarkers;
                    if (typeof crossReferenceMarkers !== 'undefined') {
                        console.log('crossReferenceMarkers: '+crossReferenceMarkers);
                        simpleData[i].nodes[j].nodes.push({text:crossReferenceMarkers, selectable: true});
                    }
                    var crossReferences = senses[l].crossReferences;
                    if (typeof crossReferences === 'object') {
                        console.log('crossReferences[0].id: '+crossReferences[0].id);
                        console.log('crossReferences[0].text: '+crossReferences[0].text);
                        console.log('crossReferences[0].type: '+crossReferences[0].type);
                    }
                    var domains = senses[l].domains;
                    if (typeof domains === 'object') {
                        console.log('domains[0].id: '+domains[0].id);
                        console.log('domains[0].text: '+domains[0].text);
                    }
                    var examples = senses[l].examples;
                    if (typeof examples === 'object') {
                        for (let m = 0; m < examples.length; m++) {
                            var examples_registers = examples[m].registers;
                            if (typeof examples_registers !== 'undefined') {
                                //console.log('examples_registers[0].text: '+examples_registers[0].text);
                            }
                            var examples_text = examples[m].text;
                            console.log('examples_text: '+examples_text);
                            simpleData[i].nodes[j].nodes.push({text:'<i>'+examples[m].text+'</i>'+cptxtf+JSON.stringify(examples[m].text).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                            ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                        }
                    }
                    var senses_id = senses[l].id;
                    var registers = senses[l].registers;
                    if (typeof registers === 'object') {
                        console.log('registers[0].id: '+registers[0].id);
                        console.log('registers[0].text: '+registers[0].text);
                    }
                    var shortDefinitions = senses[l].shortDefinitions;
                    if (typeof shortDefinitions !== 'undefined') {
                        console.log('shortDefinitions: '+shortDefinitions);
                        simpleData[i].nodes[j].nodes.push({text:'<b>shortDefinitions:</b> '+shortDefinitions+cptxtf+JSON.stringify(shortDefinitions[0]).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                        ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                    }
                    var regions = senses[l].regions;
                    var notes = senses[l].notes;
                    if (typeof notes === 'object') {
                        var notes_text = notes[0].text;
                        var notes_type = notes[0].type;
                        for (let m = 0; m < notes.length; m++) {
                            simpleData[i].nodes[j].nodes.push({text:'<b>notes:</b> '+notes[m].text+' ('+notes[m].type+')'+cptxtf+JSON.stringify(notes[m].text).replace(/\"/g, '').replace(/'/g, '‡')+' ('+JSON.stringify(notes[m].type).replace(/\"/g, '').replace(/'/g, '‡')+')'+cptxtb, selectable: true});
                            ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                        }
                    }
                    var subsenses = senses[l].subsenses;
                    if (typeof subsenses === 'object') {
                        if (typeof simpleData[i].nodes[j].nodes[ssIdx].nodes !== 'object') simpleData[i].nodes[j].nodes[ssIdx].nodes = [];
                        for (let m = 0; m < subsenses.length; m++) {
                            var subsenses_definitions = subsenses[m].definitions;
                            if (typeof subsenses_definitions !== 'undefined') {
                                console.log('subsenses_definitions: '+subsenses_definitions);
                                simpleData[i].nodes[j].nodes[ssIdx].nodes.push({text:'<b>'+subsenses_definitions+'</b>'+cptxtf+JSON.stringify(subsenses_definitions[0]).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                            }
                            var subsenses_domains = subsenses[m].domains;
                            var subsenses_examples = subsenses[m].examples;
                            if (typeof subsenses_examples === 'object') {
                                for (let n = 0; n < subsenses_examples.length; n++) {
                                var subsenses_examples_registers = subsenses_examples[n].registers;
                                if (typeof subsenses_examples_registers !== 'undefined') {
                                    //console.log('subsenses_examples_registers[0].text: '+subsenses_examples_registers[0].text);
                                }
                                var subsenses_examples_text = subsenses_examples[n].text;
                                console.log('subsenses_examples_text: '+subsenses_examples_text);
                                simpleData[i].nodes[j].nodes[ssIdx].nodes.push({text:'<i>'+subsenses_examples[n].text+'</i>'+cptxtf+JSON.stringify(subsenses_examples[n].text).replace(/\"/g, '').replace(/'/g, '‡')+cptxtb, selectable: true});
                                }
                            }
                            var subsenses_id = subsenses[m].id;
                            var subsenses_registers = subsenses[m].registers;
                            var subsenses_regions = subsenses[m].regions;
                            if (typeof subsenses_regions === 'object') {
                                var subsenses_regions_id = subsenses_regions[0].id;
                                var subsenses_regions_text = subsenses_regions[0].text;
                                //console.log('subsenses_regions[0].text:'+subsenses_regions[0].text);
                            }
                            var subsenses_notes = subsenses[m].notes;
                            if (typeof subsenses_notes === 'object') {
                                var subsenses_notes_text = subsenses_notes[0].text;
                                var subsenses_notes_type = subsenses_notes[0].type;
                                //console.log('subsenses_notes[0].text:'+subsenses_notes[0].text);
                            }
                            var subsenses_shortDefinitions = subsenses[m].shortDefinitions;
                            if (typeof subsenses_shortDefinitions !== 'undefined') {
                                //console.log('subsenses_shortDefinitions: '+subsenses_shortDefinitions);
                            }
                            var subsenses_thesaurusLinks = subsenses[m].thesaurusLinks;
                        }
                    }
                    var thesaurusLinks = senses[l].thesaurusLinks;
                    if (typeof thesaurusLinks === 'object') {
                        simpleData[i].nodes[j].nodes.push({text:'thesaurus: <a onclick="thesaurus(\''+thesaurusLinks[0].entry_id+'\');" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+thesaurusLinks[0].entry_id+'</a>', selectable: true});
                        var thesaurusLinks_entry_id = thesaurusLinks[0].entry_id;
                        //console.log('thesaurusLinks[0].entry_id: '+thesaurusLinks[0].entry_id);
                        var thesaurusLinks_sense_id = thesaurusLinks[0].sense_id;
                    }
                }
            }
        }
        var type = results[i].type;
    }
    simpleData.push({text: '<a href="#" onclick="closeDic();return false;" style="cursor: pointer;align:right;padding-right:30px;">'+$('#close').val()+'</a>', selectable: true});
	console.log(JSON.stringify(simpleData));
    $('#treeview1').css("display", "block");
    $('#treeview1').treeview({
        levels: 99,
        highlightSelected: false,
        data: simpleData
    });
}

function thesaurus(word) {
    var data = {};
    data.word = word;
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/catalog/story_oxford_ajaxt',
        async: false,
        success : function(data) {
            processDicDatat(data.dic_content);
        }
    });    
}

function processDicDatat(dic_content) {
    var simpleData = [];
    var voca = JSON.parse(dic_content);
    
    var word_id = voca.id;
    var results = voca.results;

    var headWord = '';
    for (let i = 0; i < results.length; i++) {
        var word = results[i].word;
        if (i == 0) {
            headWord = '<a onclick="dicSearch();" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+word+'</a>';
            headWord += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            headWord += '<a href="#" onclick="closeDic();return false;" style="cursor: pointer;align:right;padding-right:30px;">'+$('#close').val()+'</a>';
        } else {
            headWord = '<a onclick="dicSearch();" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+word+'</a>';
        }
        simpleData.push({text: headWord});

        var id = results[i].id;
        //console.log('results['+i+'].id: '+results[i].id);
        var language = results[i].language;
        var lexicalEntries = results[i].lexicalEntries;
        for (let j = 0; j < lexicalEntries.length; j++) {
            if (j == 0) simpleData[i].nodes = [];
            var lexicalEntries_language = lexicalEntries[j].language;
            var lexicalCategory = lexicalEntries[j].lexicalCategory;
            if (typeof lexicalCategory === 'object') {
                var lexicalCategory_id = lexicalCategory.id;
                var lexicalCategory_text = lexicalCategory.text;
                console.log('lexicalCategory.text:'+lexicalCategory.text);
                simpleData[i].nodes.push({text:lexicalCategory.text});
            }
            var entries = lexicalEntries[j].entries;
            for (let k = 0; k < entries.length; k++) {
                var senses = entries[k].senses;
                for (let l = 0; l < senses.length; l++) {
                    
                    var ssIdx = 0;
                    
                    if (typeof simpleData[i].nodes[j].nodes !== 'object') simpleData[i].nodes[j].nodes = [];
                    
                    var antonyms = senses[l].antonyms;
                    if (typeof antonyms === 'object') {
                        for (let m = 0; m < antonyms.length; m++) {
                            simpleData[i].nodes[j].nodes.push({text:'antonym: '+'<b>'+antonyms[m].text+'</b>'});
                            ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                        }
                    }
                    
                    var examples = senses[l].examples;
                    if (typeof examples === 'object') {
                        for (let m = 0; m < examples.length; m++) {
                            simpleData[i].nodes[j].nodes.push({text:'<i>'+examples[m].text+'</i>'});
                            ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                        }
                    }
                    var senses_id = senses[l].id;
                    var registers = senses[l].registers;
                    if (typeof registers === 'object') {
                        console.log('registers[0].id: '+registers[0].id);
                        console.log('registers[0].text: '+registers[0].text);
                    }
                    var subsenses = senses[l].subsenses;
                    if (typeof subsenses === 'object') {
                        if (typeof simpleData[i].nodes[j].nodes[ssIdx].nodes !== 'object') simpleData[i].nodes[j].nodes[ssIdx].nodes = [];
                        for (let m = 0; m < subsenses.length; m++) {
                            var subsenses_synonyms = subsenses[m].synonyms;
                            if (typeof subsenses_synonyms === 'object') {
                                for (let n = 0; n < subsenses_synonyms.length; n++) {
                                    simpleData[i].nodes[j].nodes[ssIdx].nodes.push({text:'synonym: '+'<b>'+subsenses_synonyms[n].text+'</b>'});
                                }
                            }
                        }
                    }

                    var synonyms = senses[l].synonyms;
                    if (typeof synonyms === 'object') {
                        for (let m = 0; m < synonyms.length; m++) {
                            simpleData[i].nodes[j].nodes.push({text:'synonym: '+'<b>'+synonyms[m].text+'</b>'});
                            ssIdx = simpleData[i].nodes[j].nodes.length - 1;
                        }
                    }
                }
            }
        }
    }
    simpleData.push({text: '<a href="#" onclick="closeDic();return false;" style="cursor: pointer;align:right;padding-right:30px;">'+$('#close').val()+'</a>'});
	console.log(JSON.stringify(simpleData));
    $('#treeview1').css("display", "block");
    $('#treeview1').treeview({
        levels: 99,
        highlightSelected: false,
        data: simpleData
    });
}

function sentence(word) {
    var data = {};
    data.word = word;
    var httpType = 'https://';
    if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: httpType+$('#hostname').val()+'/catalog/story_oxford_ajaxs',
        async: false,
        success : function(data) {
            processDicDatas(data.dic_content);
        }
    });    
}

function processDicDatas(dic_content) {
    var simpleData = [];
    var voca = JSON.parse(dic_content);
    
    var word_id = voca.id;
    var results = voca.results;
    
    var headWord = '';
    for (let i = 0; i < results.length; i++) {
        var word = results[i].word;
        if (i == 0) {
            headWord = '<a onclick="dicSearch();" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+word+'</a>';
            headWord += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            headWord += '<a href="#" onclick="closeDic();return false;" style="cursor: pointer;align:right;padding-right:30px;">'+$('#close').val()+'</a>';
        } else {
            headWord = '<a onclick="dicSearch();" style="color: hotpink; text-decoration: underline; cursor: pointer;">'+word+'</a>';
        }
        simpleData.push({text: headWord});
        
        var id = results[i].id;
        //console.log('results['+i+'].id: '+results[i].id);
        var language = results[i].language;
        var lexicalEntries = results[i].lexicalEntries;
        for (let j = 0; j < lexicalEntries.length; j++) {
            if (j == 0) simpleData[i].nodes = [];
            var lexicalEntries_language = lexicalEntries[j].language;
            var lexicalCategory = lexicalEntries[j].lexicalCategory;
            if (typeof lexicalCategory === 'object') {
                var lexicalCategory_id = lexicalCategory.id;
                var lexicalCategory_text = lexicalCategory.text;
                console.log('lexicalCategory.text:'+lexicalCategory.text);
                simpleData[i].nodes.push({text:lexicalCategory.text});
            }
            var sentences = lexicalEntries[j].sentences;
            for (let k = 0; k < sentences.length; k++) {
                if (typeof simpleData[i].nodes[j].nodes !== 'object') simpleData[i].nodes[j].nodes = [];
                var regions = sentences[k].regions;
                var text = sentences[k].text;
                if(typeof regions === 'object') {
                    simpleData[i].nodes[j].nodes.push({text:regions[0].text+': '+'<b><i>'+text+'</i></b>'});
                } else {
                    simpleData[i].nodes[j].nodes.push({text:'<b><i>'+text+'</i></b>'});
                }
            }
        }
    }
    simpleData.push({text: '<a href="#" onclick="closeDic();return false;" style="cursor: pointer;align:right;padding-right:30px;">'+$('#close').val()+'</a>'});
	console.log(JSON.stringify(simpleData));
    $('#treeview1').css("display", "block");
    $('#treeview1').treeview({
        levels: 99,
        highlightSelected: false,
        data: simpleData
    });
}
