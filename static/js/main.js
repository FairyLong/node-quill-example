const Quill = require('quill');
const $ = require('jquery');
const blots = require('./blot')
const Delta = Quill.import('delta')
const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const richText = require('rich-text');
sharedb.types.register(richText.type);


// Open WebSocket connection to ShareDB server
const serverUrl = 'ws://localhost:7005/ot/server/user/123456/record/1234'
const clientUrl = 'ws://localhost:7005/ot/pc/user/123456/record/1234'
const clientSocket = new ReconnectingWebSocket(clientUrl);
const serverSocket = new WebSocket(serverUrl);
const connection = new sharedb.Connection(clientSocket);

let editor = new Quill('#editor', {
  modules: {
    toolbar: {
      container : '#toolbar',
      handlers : {
        'interjection': function (value) {
          console.log(value)
          if (value) {
            this.quill.format('interjection', true)
          } else {
            this.quill.format('interjection', false)
          }
        },
        'spoken': function (value) {
          console.log('spoken' + value)
          if (value) {
            this.quill.format('spoken', true)
          } else {
            this.quill.format('spoken', false)
          }
        }
      }
    }
  },
  theme: 'snow'
});

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
let doc = connection.get('record_doc_4', '1234');
doc.subscribe(function(err) {
  if (err) throw err;
  console.log(doc)
  editor.setContents(doc.data);
  // editor.on('text-change', function(delta, oldDelta, source) {
  //   if (source !== 'user') return;
  //   doc.submitOp(delta, {source: quill});
  // });
  doc.on('op', function(op, source) {
    if (source === editor) {
      console.log("source is quill, ignore")
      return;
    }
    editor.updateContents(op);
  });
});

// editor.insertText(0, 'Test', { bold: true });
// editor.formatText(0, 4, 'italic', true);

$('#click').click(function (){
  editor.updateContents(new Delta().insert('电话开始'));
  // editor.updateContents(new Delta().retain(4,  {bold:null, italic: null}));
})

$('#click2').click(function (){
  editor.setText("new words");
})

let smooth = false;
$('#smooth').click(function (){
  if (!smooth) {
    $('.smooth').hide();
    smooth = true;
  } else {
    $('.smooth').show();
    smooth = false;
  }
});

$('#send').click(function () {
  serverSocket.send(JSON.parse($('#message').val()))
})

$('#end').click(function () {
  serverSocket.close()
  clientSocket.close()
})