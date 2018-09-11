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
  'Oswald', 'ShadowsIntoLight', 'AbrilFatface', 'Teko', 'Cormorant', 'AlfaSlabOne'];
  Quill.register(Font, true);
  
  var Size = Quill.import('attributors/style/size');
  Size.whitelist = ['1em', '1.5em', '2em', '2.5em', '3em', '3.5em', '4em', '6em', '8em', '10em'];
  Quill.register(Size, true);

  var quill = new Quill('#snow-container', {
    modules: {
      toolbar: '#toolbar-container'
    },
    theme: 'snow'
  });
  var memo = $('#memo').val();
  if(typeof memo != 'undefined') {
    quill.clipboard.dangerouslyPasteHTML(memo);
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