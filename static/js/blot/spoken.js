// 口语顺滑词标记 xytt
const Quill = require('quill');
const Inline = Quill.import('blots/inline');

class spoken extends Inline {
  static formats(node) {
    console.log('spoken formats()');
    return true
  }

  optimize (context) {
    console.log('spoken optimize()', this);
    if (this.children.length === 0) {
      this.remove()
      console.log('this spoken removed',this);
    }
  }

  // formatAt (index, length, name, value) {
  //   console.log('spoken formatAt()' + index+  length+  name+  value)
  //   if (name != 'spoken') return super.formatAt(index, length, name, value)
  //
  //   console.log('===> spoken formatAt')
  //   if (!value) this.unwrap();
  //
  // }

  static create (value) {
    console.log('spoken create()');
    const node = super.create()
    return node
  }
}

spoken.className = 'spoken'
spoken.blotName = 'spoken'
spoken.tagName = 'span'

Quill.register(spoken);