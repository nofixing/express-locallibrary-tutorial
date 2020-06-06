$( document ).ready(function() {
    
    var atft = $("#cfnt").val();
    if(typeof atft != 'undefined' && atft != '') {
         
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
        
        $('#atfnt').text(fary[atft]);
    }

    var atft2 = $("#cfnt2").val();
    if(typeof atft2 != 'undefined' && atft2 != '') {
         
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
        
        $('#atfnt2').text(fary[atft2]);
    }
  
  $( "#alterFtBtn" ).click(function() {
    $("#cfnt").val($('#atfnt').text());
    $("#cfnt2").val($('#atfnt2').text());

      var httpType = 'https://';
      if ( $('#hostname').val().indexOf('localhost') > -1 ) httpType = 'http://';
      $.ajax({
          type: 'POST',
          data: $("#alterFtForm").serialize(),
          url: httpType+$('#hostname').val()+'/user/alter_font_post',
          async: false,
          success : function(data) {
              if ( data.rcode == "000" ) {
                alert($("#alterFtSuccess").val());
                document.location.href = httpType+$('#hostname').val()+'/catalog';
              }
          }
      });

  });

    function atoggleSurface(sfnt, ffmt) {
        $('#atfnt').text(sfnt);
    }

    function atoggleSurface2(sfnt, ffmt) {
        $('#atfnt2').text(sfnt);
    }
    
});