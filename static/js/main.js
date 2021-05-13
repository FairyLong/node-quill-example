const Quill = require('quill');
const $ = require('jquery');
const blots = require('./blot')
const Delta = Quill.import('delta')
const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const richText = require('rich-text');
sharedb.types.register(richText.type);


// Open WebSocket connection to ShareDB server
const serverUrl = 'ws://localhost:7005/ot/server/user/123456/record/1234' // 转写服务器消息
const clientUrl = 'ws://localhost:7005/ot/pc/user/123456/record/1234' // PC端shareDB同步消息
const clientSocket = new ReconnectingWebSocket(clientUrl);
const serverSocket = new WebSocket(serverUrl);
const connection = new sharedb.Connection(clientSocket);

serverSocket.onopen = function () {
  serverSocket.send("{\"event\":\"record.call.begin\"}")
  serverSocket.send("{\"event\":\"record.call.begin\"}")
  setTimeout(function () {
    console.log("time send")
    serverSocket.send("{\"event\":\"record.call.begin\"}")
  },2000)

}

let editor = new Quill('#editor', {
  modules: {
    toolbar: {
      container : '#toolbar',
      handlers : {
        // 'interjection': function (value) {
        //   console.log(value)
        //   if (value) {
        //     this.quill.format('interjection', true)
        //   } else {
        //     this.quill.format('interjection', false)
        //   }
        // },
        // 'spoken': function (value) {
        //   console.log('spoken' + value)
        //   if (value) {
        //     this.quill.format('spoken', true)
        //   } else {
        //     this.quill.format('spoken', false)
        //   }
        // }
      }
    }
  },
  theme: 'snow'
});

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
let doc = connection.get('record_doc_4', '1234'); // 联调注意修改
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
    console.log("on op", op)
    editor.updateContents(op);
  });
});

// editor.insertText(0, 'Test', { bold: true });
// editor.formatText(0, 4, 'italic', true);

$('#click').click(function (){
  let op = [{
    insert: {speaker: {name: "魏老师"}},
    attributes: {lang: 'ch'}
  },{
    insert: "测试中文",
    attributes: {range: {begin:0, end: 1}, lang: 'ch'}
  },{
    insert: "\n"
  },{
    insert: {speaker: {name: 'Teacher Wei'}},
    attributes: {lang: 'en'}
  },{
    insert: "Test Chinese",
    attributes: {range: {begin:0, end: 1}, lang: 'en'}
  },{
    insert: "\n"
  },{
    insert: {speaker: {name: "魏老师"}}
  },{
    insert: "测试",
    attributes: {range: {begin:0, end: 1}}
  }]
  editor.updateContents(op);
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
  let msg = JSON.parse($('#message').val())
  if (msg instanceof Array) {
    console.log("send array")
    msg.forEach(m => {
      serverSocket.send(m)
    })
  } else {
    serverSocket.send(msg)
  }

})

$('#end').click(function () {
  serverSocket.close()
  clientSocket.close()
})