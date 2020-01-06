var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean'],                                         // remove formatting button
    ['link', 'image', 'video']
  ];

  // Add fonts to whitelist
  var Font = Quill.import('formats/font');
  // We do not add Sans Serif since it is the default
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

const BlockEmbed = Quill.import('blots/block/embed');
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

var Parchment = Quill.import("parchment");

let AudioClass = new Parchment.Attributor.Class('audio', 'ql-audio', {
  scope: Parchment.Scope.EMBED
});

Quill.register(AudioClass, true);

let CustomClass = new Parchment.Attributor.Class('omega', 'ql-omega', {
  scope: Parchment.Scope.INLINE
});

Quill.register(CustomClass, true);

var quill = new Quill('#snow-container', {
  modules: {
      syntax: true,
      toolbar: '#toolbar-container'
  },
  theme: 'snow'
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

var audioButton = document.querySelector('.ql-audio');
audioButton.addEventListener('click', function() {
  var range = this.quill.getSelection();
  var value = prompt('What is the audio src URL');
  if(value){
      this.quill.insertEmbed(range.index, 'audio', value, Quill.sources.USER);
  }
});

var customButton = document.querySelector('.ql-omega');
customButton.addEventListener('click', function() {
  var range = quill.getSelection();
  if (range) {
    if (range.length == 0) {
      console.log('User cursor is at index', range.index);
    } else {
      $('#OpenModal')[0].click();
    }
  } else {
    console.log('User cursor is not in editor');
  }
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

  /*
  var txtArea = document.createElement('textarea');
  txtArea.style.cssText = "width: 100%;height: 750px;margin: 0;background: rgb(255, 255, 255);box-sizing: border-box;color: rgb(0, 0, 0);"+
  "font-size: 13px;outline: none;padding: 20px;line-height: 24px;font-family: Consolas, Menlo, Monaco, &quot;Courier New&quot;, monospace;"+
  "position: absolute;top: 0;bottom: 0;border: none;display:none";
  
  var htmlEditor = quill.addContainer('ql-custom');
  htmlEditor.appendChild(txtArea);
  
  var myEditor = document.querySelector('#snow-container');
  txtArea.value = myEditor.children[0].innerHTML;
  quill.on('text-change', function(delta, oldDelta, source){
    var html = myEditor.children[0].innerHTML;
    txtArea.value = html;
  });
  
  var customButton = document.querySelector('.ql-showHtml');
  customButton.addEventListener('click', function () {
    var tContent = txtArea.value;
    var find = '<p><br></p>';
    var re = new RegExp(find, 'g');
    tContent = tContent.replace(re, '');
    txtArea.value = tContent;
    if (txtArea.style.display === '') {
      var html = txtArea.value;
      self.quill.clipboard.dangerouslyPasteHTML(html);
      customButton.style.cssText = "font-weight: normal;";
    } else {
      customButton.style.cssText = "font-weight: bold;";
    }
    txtArea.style.display = txtArea.style.display === 'none' ? '' : 'none';
  });
  
  var clearContents = document.querySelector('.ql-clearContents');
  clearContents.addEventListener('click', function () {
    myEditor.children[0].innerHTML = '';
          wordArray = [];
  });
  
  var openFile = document.querySelector('.ql-opnFile');
  openFile.addEventListener('click', function () {
    selectLocalFile();
  });
  
  function selectLocalFile() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.click();
  
    // Listen upload local image and save to server
    input.onchange(function(){
      const file = input.files[0];
  
      var reader = new FileReader();
      
      reader.addEventListener('load', function (e) {
        var htm = e.target.result;
        htm = htm.substring(htm.indexOf("<body>")+6, htm.indexOf("</body>"));
        self.quill.clipboard.dangerouslyPasteHTML(htm);
      });
      
      reader.readAsText(file);
    });
  }
  */
