  var Font = Quill.import('formats/font');
  Font.whitelist = ['WorkSans', 'LibreFranklin', 'Inconsolata', 'roboto', 'mirza', 'arial', 'NanumPenScript', 'NanumBrushScript', 'SongMyung', 'Gaegu', 'Jua', 
  'GamjaFlower', 'CuteFont', 'Stylish', 'YeonSung', 'HiMelody', 'Sunflower', 
  'BlackHanSans', 'GothicA1', 'NanumGothic', 'NanumMyeongjo', 'PoorStory', 'BlackAndWhitePicture', 
  'Oswald', 'Caveat', 'Raleway', 'ShadowsIntoLight', 'AbrilFatface', 'Teko', 'Cormorant', 'AlfaSlabOne', 'PTSans'];
  Quill.register(Font, true);
  
  var Size = Quill.import('attributors/style/size');
  Size.whitelist = ['1em', '1.5em', '2em', '2.5em', '3em', '3.5em', '4em', '6em', '8em', '10em'];
  Quill.register(Size, true);

  var BlockEmbed = Quill.import('blots/block/embed');
  class AudioBlot extends BlockEmbed {
    static create(url) {
      let node = super.create();
      node.setAttribute('src', url);
      node.setAttribute('controls', '');
      return node;
    }
    
    static value(node) {
      return node.getAttribute('src');
    }
  }
  AudioBlot.blotName = 'ado';
  AudioBlot.tagName = 'audio';
  Quill.register(AudioBlot, true);

var quill = new Quill('#bubble-container', {
  modules: {
      syntax: false,
      toolbar: '#toolbar-container'
  },
  theme: 'bubble'
});

var imgButton = document.querySelector('#img');
imgButton.addEventListener('click', function(event) {
  var range = quill.getSelection();
  var value = prompt('What is the image URL');
  if(value){
      quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
  }
});

var audioButton = document.querySelector('#ado');
audioButton.addEventListener('click', function(event) {
  console.log('audioButton Clicked');
  var range = quill.getSelection();
  var value = prompt('What is the audio src URL');
  if(value){
    console.log('audioButton audio src Entered ->:'+value);
    quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.insertEmbed(range.index + 1, 'ado', value, Quill.sources.USER);
    quill.setSelection(range.index + 2, Quill.sources.SILENT);
  }
  event.preventDefault();
});

var currentIdx = 0;  
var youtuButton = document.querySelector('#youtu');
youtuButton.addEventListener('click', function(event) {
  console.log('youtuButton Clicked');
  console.log(quill);
  var range = quill.getSelection();
  console.log(range);
  currentIdx = range.index;
  $('#OpenVideo')[0].click();
});

$('#InsertVideo').click(function(){
  var spath = $('#video_src').val();
  var arr = spath.split("/");
  var lnum = spath.split("/").length -1;
  var vsrc = arr[lnum];
  if(vsrc.indexOf('watch?v=') > -1) {
    var arr2 = vsrc.split("=");
    vsrc = arr2[1];
    if(vsrc.indexOf('&') > -1) {
      vsrc = vsrc.substring(0, vsrc.indexOf('&'));
    }
  }
  vsrc = "https://www.youtube.com/embed/"+vsrc;
  quill.insertEmbed(currentIdx, 'video', vsrc, Quill.sources.USER);
  quill.formatText(currentIdx, 1,'width', '640');
  quill.formatText(currentIdx, 1,'height', '360');
  $('#vcls')[0].click();
});

var memo = $('#memo').val();
if(typeof memo != 'undefined') {
  quill.clipboard.dangerouslyPasteHTML(memo);
}
