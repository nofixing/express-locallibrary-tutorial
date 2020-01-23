  var Font = Quill.import('formats/font');
  Font.whitelist = ['LibreFranklin', 'inconsolata', 'roboto', 'mirza', 'arial', 'NanumPenScript', 'NanumBrushScript', 'SongMyung', 'Gaegu', 'Jua', 
  'GamjaFlower', 'CuteFont', 'Stylish', 'YeonSung', 'HiMelody', 'Sunflower', 
  'BlackHanSans', 'GothicA1', 'NanumGothic', 'NanumMyeongjo', 'PoorStory', 'BlackAndWhitePicture', 
  'Oswald', 'Caveat', 'Raleway', 'ShadowsIntoLight', 'AbrilFatface', 'Teko', 'Cormorant', 'AlfaSlabOne', 'PTSans'];
  Quill.register(Font, true);
  
  var Size = Quill.import('attributors/style/size');
  Size.whitelist = ['1em', '1.5em', '2em', '2.5em', '3em', '3.5em', '4em', '6em', '8em', '10em'];
  Quill.register(Size, true);

var Inline = Quill.import('blots/inline');

class LinkBlot extends Inline {
  static create(url) {
    var node = super.create();
    // Sanitize url if desired
    node.setAttribute('href', '#');
    node.setAttribute('title', url);
    // Okay to set other non-format related attributes
    node.setAttribute('target', '_blank');
    node.setAttribute('class', 'tltp');
    return node;
  }
  
  static formats(node) {
    // We will only be called with a node already
    // determined to be a Link blot, so we do
    // not need to check ourselves
    return node.getAttribute('href');
  }
}
LinkBlot.blotName = 'tooltip';
LinkBlot.tagName = 'a';

Quill.register(LinkBlot, true);

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
AudioBlot.blotName = 'audio';
AudioBlot.tagName = 'audio';
Quill.register(AudioBlot, true);

var quill = new Quill('#bubble-container', {
  modules: {
      syntax: true,
      toolbar: '#toolbar-container'
  },
  theme: 'bubble'
});

function imageHandler() {
  var range = this.quill.getSelection();
  var value = prompt('What is the image URL');
  if(value){
      this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
  }
}

var toolbar = quill.getModule('toolbar');
  
var currentIdx = 0;
toolbar.addHandler('video', function() {
  var range = this.quill.getSelection();
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
  }
  vsrc = "https://www.youtube.com/embed/"+vsrc;
  if($('#video_width').val() == '' || $('#video_height').val() == '') {
    $('#video_width').val('560');
    $('#video_height').val('315');
  }
  quill.insertEmbed(currentIdx, 'video', vsrc, Quill.sources.USER);
  quill.formatText(currentIdx, 1,'width', $('#video_width').val());
  quill.formatText(currentIdx, 1,'height', $('#video_height').val());
  $('#vcls')[0].click();
});

var audioButton = document.querySelector('.audio');
audioButton.addEventListener('click', function(event) {
  console.log('audioButton Clicked');
  var range = quill.getSelection();
  var value = prompt('What is the audio src URL');
  if(value){
    console.log('audioButton audio src Entered ->:'+value);
    quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.insertEmbed(range.index + 1, 'audio', value, Quill.sources.USER);
    quill.setSelection(range.index + 2, Quill.sources.SILENT);
  }
  event.preventDefault();
});

toolbar.addHandler('image', imageHandler);

$('#InsertTooltip').click(function(){
  var sTag = "<img src="+$('#recipient-name').val()+"><h4>"+$('#message-text').val()+"</h4>";
  quill.format('tooltip', sTag);
  console.log(quill.root.innerHTML);
  $('#tcls')[0].click();
});

var memo = $('#memo').val();
if(typeof memo != 'undefined') {
  quill.clipboard.dangerouslyPasteHTML(memo);
}

var videos = document.querySelectorAll('.ql-video');
for (let i = 0; i < videos.length; i++) {
  var embedContainer = document.createElement('div');
  embedContainer.setAttribute('class', 'embed-container');
  var parent = videos[i].parentNode;
  parent.insertBefore(embedContainer, videos[i]);
  embedContainer.appendChild(videos[i]);
}
