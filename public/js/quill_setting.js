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

const QuillVideo = Quill.import('formats/video');
const BlockEmbed = Quill.import('blots/block/embed');

const VIDEO_ATTRIBUTES = ['height', 'width'];

// provides a custom div wrapper around the default Video blot
class Video extends BlockEmbed {
  static create (value) {
    const iframeNode = QuillVideo.create(value);
    const node = super.create();
    node.appendChild(iframeNode);
    return node;
  }

  static formats (domNode) {
    const iframe = domNode.getElementsByTagName('iframe')[0];
    return VIDEO_ATTRIBUTES.reduce(function (formats, attribute) {
      if (iframe.hasAttribute(attribute)) {
        formats[attribute] = iframe.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static value (domNode) {
    return domNode.getElementsByTagName('iframe')[0].getAttribute('src');
  }

  format (name, value) {
    if (VIDEO_ATTRIBUTES.indexOf(name) > -1) {
      if (value) { this.domNode.setAttribute(name, value) }
      else { this.domNode.removeAttribute(name) }
    }
    else { super.format(name, value) }
  }
}

Video.blotName = 'video';
Video.className = 'embed-container';
Video.tagName = 'DIV';

Quill.register(Video, true);

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
LinkBlot.blotName = 'link';
LinkBlot.tagName = 'a';

Quill.register(LinkBlot);

  var quill = new Quill('#snow-container', {
    modules: {
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
  toolbar.addHandler('omega', function() {
    console.log('omega');
  });

toolbar.addHandler('video', function() {
  var range = this.quill.getSelection();
  $('#OpenVideo')[0].click();
  /*
  var value = prompt('What is the video URL');
  if(value){
      this.quill.insertEmbed(range.index, 'video', value, Quill.sources.USER);
  }
  */
});

$('#InsertVideo').click(function(){
  var range = this.quill.getSelection();
  this.quill.insertEmbed(range.index, 'video', $('#video_src').val(), Quill.sources.USER);
  quill.format('width', $('#video_width').val());
  quill.format('height', $('#video_height').val());
  $('#vcls')[0].click();
});

  toolbar.addHandler('image', imageHandler);

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

$('#InsertTooltip').click(function(){
  var sTag = "<img src="+$('#recipient-name').val()+"><h4>"+$('#message-text').val()+"</h4>";
  quill.format('link', sTag);
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
