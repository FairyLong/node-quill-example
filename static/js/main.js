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
const serverPort = '7105'
const userId = 123456
const recordId = 1234
const collection = 'record_doc_' + recordId%10
// const collection = 'cloud_record_doc_' + recordId%10

// Open WebSocket connection to ShareDB server
const serverUrl = util.format('ws://%s:%s/ot/server/mile/user/%s/record/%s?origin=cn&translate=en', serverIp, serverPort, userId, recordId) // 转写服务器消息 mile
// const serverUrl = util.format('ws://%s:%s/ot/server/user/%s/record/%s?ishyb=1', serverIp, serverPort, userId, recordId) // 转写服务器消息
const clientUrl = util.format('ws://%s:%s/ot/pc/mile/user/%s/record/%s', serverIp, serverPort, userId, recordId) // PC端ws mile
// const clientUrl = util.format('ws://%s:%s/ot/pc/user/%s/record/%s', serverIp, serverPort, userId, recordId) // PC端shareDB同步消息
const shareUrl = util.format('ws://%s:%s/ot/share/record/%s?lang=EN', serverIp, serverPort, recordId) // PC端分享链接 mile
// const clientUrl = 'ws://meeting.beta.duiopen.com/ot/pc/user/1000002262/record/29987' // PC端shareDB同步消息
const clientSocket = new ReconnectingWebSocket(clientUrl);
const serverSocket = new WebSocket(serverUrl);
const shareSocket = new WebSocket(shareUrl);
const connection = new sharedb.Connection(clientSocket);

// clientSocket.onmessage = event => {
//     console.log('receive msg: ' + event.data + JSON.stringify(event))
//     try {
//         var data = (typeof event.data === 'string') ?
//         JSON.parse(event.data) : event.data;
//     } catch (err) {
//         return;
//     }
//
//     let request = {data: data};
//     connection.emit('receive', request);
//     if (!request.data) return;
//
//     try {
//         connection.handleMessage(request.data);
//     } catch (err) {
//         util.nextTick(function() {
//             connection.emit('error', err);
//         });
//     }
// }

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
    // console.log(doc)
    // let newOps = doc.data.ops.reduce((memo, op) => {
    //     if (typeof op.insert != 'object' && !/^\n$/.test(op.insert)) memo.push(op)
    //     return memo
    // },[])
    // console.log(newOps)
    // editor.setContents(newOps)
    // doc.on('op', function(op, source) {
    //     if (source === "quill") {
    //         console.log("source is quill, ignore")
    //         return;
    //     }
    //     console.log("on op", JSON.stringify(op))
    //     doc.fetch((err) => {
    //         newOps = doc.data.ops.reduce((memo, op) => {
    //             if (typeof op.insert != 'object' && !/^\n$/.test(op.insert)) memo.push(op)
    //             return memo
    //         },[])
    //         console.log(newOps)
    //         editor.setContents(newOps);
    //     })
    // });
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
        let i = 0
        msg.forEach(m => {
            setTimeout(() => {
                if (typeof m == 'string') {
                    serverSocket.send(m)
                } else {
                    doc.submitOp(m)
                }

            }, 100 * i)
            i++
        })
    } else {
        serverSocket.send(msg)
    }

})

$('#clientSend').click(function () {
    let msg = JSON.parse($('#clientOp').val())
    if (msg instanceof Array) {
        console.log("send client array")
        let i = 0
        msg.forEach(m => {
            setTimeout(() => {
                doc.submitOp(msg)
            }, 200 * i)
            i++
        })
    } else {
        doc.submitOp(msg)
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

$('#auto').click(function () {
    // serverSocket.send(msg)
})