const Quill = require('quill');
const $ = require('jquery');
const blots = require('./blot')
const Delta = Quill.import('delta')

var editor = new Quill('#editor', {
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

editor.insertText(0, 'Test', { bold: true });
editor.formatText(0, 4, 'italic', true);

$('#click').click(function (){
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