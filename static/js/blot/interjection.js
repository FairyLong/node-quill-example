// 口语顺滑词标记
const Quill = require('quill');
const Inline = Quill.import('blots/inline');

class interjection extends Inline {
  static create(value) {
    console.log('interjection create()');
    let node = super.create();
    node.setAttribute('interjection', 'true')
    return node;
  }

  optimize (context) {
    console.log('interjection optimize()');
    if (this.children.length === 0) {
      this.remove()
      console.log('this interjection removed',this);
    }
  }

  static formats(node){
    console.log('interjection formats()');
    return true;
  }

  /**
   * 更新或删除格式的时候会走这个方法
   * 新增的时候调用create()，该方法不调用
   *
   * @param index 当前所处domNode中，格式化的起始位置
   * @param length 格式化的长度
   * @param name  应用的格式blot名
   * @param value 格式化的值
   * @returns {*} Delta
   */
  formatAt (index, length, name, value) {
    console.log('interjection formatAt()' + index+  length+  name+  value)
    if (name != 'interjection')return super.formatAt(index, length, name, value);

    console.log('===> interjection formatAt')
    if (!value) this.unwrap();

  }
}

interjection.blotName = 'interjection';
interjection.tagName = 'span';
interjection.className = 'smooth';

Quill.register(interjection);
