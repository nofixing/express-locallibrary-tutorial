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
/*
  var weight = Quill.import('formats/bold');
  weight.whitelist = ['100', '200', '300', 'normal', '500', '600', 'bold', '800', '900'];
  Quill.register(weight, true);
*/
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

class TagBlot extends Inline {
  static create(url) {
    var node = super.create();
    node.setAttribute('class', url);
    return node;
  }
}
TagBlot.blotName = 'pan';
TagBlot.tagName = 'span';

Quill.register(TagBlot, true);

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
AudioBlot.blotName = 'ql-audio';
AudioBlot.tagName = 'audio';
Quill.register(AudioBlot, true);

var Parchment = Quill.import("parchment");

let AudioClass = new Parchment.Attributor.Class('audio', 'ql-audio', {
  scope: Parchment.Scope.BLOCK
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
var currentLgh = 0;
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
    if(vsrc.indexOf('&') > -1) {
      vsrc = vsrc.substring(0, vsrc.indexOf('&'));
    }
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

var audioButton = document.querySelector('.ql-audio');
audioButton.addEventListener('click', function(event) {
  console.log('audioButton Clicked');
  var range = quill.getSelection();
  
  var value = prompt('What is the audio src URL');
  if(value){
    console.log('audioButton audio src Entered ->:'+value);
    quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.insertEmbed(range.index + 1, 'ql-audio', value, Quill.sources.USER);
    quill.setSelection(range.index + 2, Quill.sources.SILENT);
  }
  event.preventDefault();
  
  //quill.formatText(range.index, range.length, 'font-weight', 'bold');
  /*
  quill.updateContents(
    {
      ops: [
        { retain: range.index },
        { retain: range.length, attributes: { style: 'fontWeight: 900' } }
      ]
    }
    , Quill.sources.USER
  );
  */
  //  $('#snow-container').css('font-weight', '900');
});
/*
var customButton = document.querySelector('.ql-omega');
customButton.addEventListener('click', function(event) {
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
  event.preventDefault();
});
*/
toolbar.addHandler('image', imageHandler);

$('#InsertTooltip').click(function(){
  var sTag = "<img src="+$('#recipient-name').val()+"><h4>"+$('#message-text').val()+"</h4>";
  quill.format('tooltip', sTag);
  console.log(quill.root.innerHTML);
  $('#tcls')[0].click();
});
quill.on('selection-change', function(range, oldRange, source) {
  /*
  if (range) {
    if (range.length == 0) {
      console.log('User cursor is on', range.index);
    } else {
      var text = quill.getText(range.index, range.length);
      console.log('User has highlighted', text);
    }
  } else {
    console.log('Cursor not in the editor');
  }
  */
  if (oldRange) {
    if (oldRange.length == 0) {
      console.log('User old cursor is on', oldRange.index);
    } else {
      currentIdx = oldRange.index;
      currentLgh = oldRange.length;
      /*
      var text = quill.getText(oldRange.index, oldRange.length);
      console.log('User old has highlighted', text);
      */
    }
  } else {
    console.log('old Cursor not in the editor');
  }
});
/*
var weight = document.querySelector('.ql-weight');
weight.addEventListener('click', function(event) {
  console.log('ql-weight click');
  var range = quill.getSelection();
  if(range){
    currentIdx = range.index;
    currentLgh = range.length;
    console.log('currentLgh'+currentLgh);
  } else {
    console.log('range is not setting');
  }
  
});
*/
$('.ql-weight').on('change', function() {
    console.log('ql-weight change');
    quill.setSelection(currentIdx, currentLgh, Quill.sources.USER);
    quill.format('pan', 'fw'+this.value);
  });
/*
var memo = $('#memo').val();
if(typeof memo != 'undefined') {
  quill.clipboard.dangerouslyPasteHTML(memo);
}
*/
var videos = document.querySelectorAll('.ql-video');
for (let i = 0; i < videos.length; i++) {
  var embedContainer = document.createElement('div');
  embedContainer.setAttribute('class', 'embed-container');
  var parent = videos[i].parentNode;
  parent.insertBefore(embedContainer, videos[i]);
  embedContainer.appendChild(videos[i]);
}
/*
var audios = document.querySelectorAll('.ql-audio');
for (let i = 0; i < audios.length; i++) {
  var embedContainer = document.createElement('div');
  embedContainer.setAttribute('class', 'embed-container');
  var parent = audios[i].parentNode;
  parent.insertBefore(embedContainer, audios[i]);
  embedContainer.appendChild(audios[i]);
}
*/
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
