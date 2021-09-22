const Quill = require('quill');
const $ = require('jquery');
const blots = require('./blot')
const Delta = Quill.import('delta')
const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client');
const richText = require('rich-text');
const util = require('util')
sharedb.types.register(richText.type);

const serverIp = '172.16.56.176'
const serverPort = '7005'
const userId = 123456
const recordId = 1234
const collection = 'record_doc_' + recordId%10

// Open WebSocket connection to ShareDB server
const serverUrl = util.format('ws://%s:%s/ot/server/user/%s/record/%s?ishyb=1', serverIp, serverPort, userId, recordId) // 转写服务器消息
const clientUrl = util.format('ws://%s:%s/ot/pc/user/%s/record/%s', serverIp, serverPort, userId, recordId) // PC端shareDB同步消息
// const clientUrl = 'ws://meeting.beta.duiopen.com/ot/pc/user/1000002262/record/29987' // PC端shareDB同步消息
const clientSocket = new ReconnectingWebSocket(clientUrl);
const serverSocket = new WebSocket(serverUrl);
const connection = new sharedb.Connection(clientSocket);

// serverSocket.onopen = function () {
//   serverSocket.send("{\"event\":\"record.call.begin\"}")
//   serverSocket.send("{\"event\":\"record.call.begin\"}")
//   setTimeout(function () {
//     console.log("time send")
//     serverSocket.send("{\"event\":\"record.call.begin\"}")
//   },2000)
//
// }

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
let doc = connection.get(collection, recordId.toString()); // 联调注意修改
doc.subscribe(function(err) {
  if (err) throw err;
  console.log(doc)
  editor.setContents(doc.data);
  editor.on('text-change', function(delta, oldDelta, source) {
    if (source !== 'user') return;
    doc.submitOp(delta, {source: 'quill'});
  });
  doc.on('op', function(op, source) {
    if (source === "quill") {
      console.log("source is quill, ignore")
      return;
    }
    console.log("on op", JSON.stringify(op))
    editor.updateContents(op);
  });
});

// editor.insertText(0, 'Test', { bold: true });
// editor.formatText(0, 4, 'italic', true);

$('#click').click(function (){
  let op = [{"insert":{"speakerV2":{"name":"我","tag":"role","role":0,"timestamp":437604,"src":"https://meeting.beta.duiopen.com/h5/wechat/assets/icon_speaker_me.png"}}},{"insert":"\n"},{"attributes":{"range":{"begin":426364,"end":427604,"role":0,"speaker":null},"spoken":true},"insert":"唉"},{"attributes":{"range":{"begin":426364,"end":427604,"role":0,"speaker":null}},"insert":"晚上吃啥呢？"},{"insert":"\n"}]
  editor.updateContents(op);

  setTimeout(() => {
    op = [{"retain":10},{"insert":"四1","attributes":{"renderAsBlock":1,"range":{"var":true}}}]
    editor.updateContents(op);
  },1000)

  setTimeout(() => {
    op = [{"retain":10},{"insert":{"speakerV2":{"name":"我","tag":"role","role":0,"timestamp":437604,"src":"https://meeting.beta.duiopen.com/h5/wechat/assets/icon_speaker_me.png"}}},{"insert":"\n"}]
    editor.updateContents(op);
  },2000)

  setTimeout(() => {
    op = [{"retain":12},{"insert":"418","attributes":{"range":{"begin":437604,"end":438904,"role":0,"speaker":null}}}]
    editor.updateContents(op);
  },3000)
  editor.updateContents(new Delta().retain(4,  {bold:null, italic: null}));
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

$('#clear').click(function () {
  $.post(util.format('http://%s:%s/ot/record/clear', serverIp, serverPort), {recordId, userId}, function (res) {
    console.log(res)
  }, 'json')
})