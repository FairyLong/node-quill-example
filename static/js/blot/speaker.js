// 口语顺滑词标记
const Quill = require('quill');
const Inline = Quill.import('blots/inline');
const Embed = Quill.import('blots/embed');
const Text = Quill.import('blots/text');

class iconBlot extends Inline {
  static create ({ iconText }) {
    const node = super.create()
    node.appendChild(Text.create(iconText))
    return node
  }
  static formats (node) {
    return {
      iconText: node.innerText
    }
  }
}

iconBlot.className = 'speaker-icon'
iconBlot.blotName = 'speakerIcon'
iconBlot.tagName = 'span'


class Speaker extends Embed {
  constructor (node, value) {
    super(node)
    const { name, tag, direct } = value
    if (name == '未知') {
      this.domNode.classList.add('unknow-speaker')
    }

    this.domNode.setAttribute('direct', direct)
    this.domNode.setAttribute('tag', tag)
    this.domNode.setAttribute('name', name)

    const $preI = iconBlot.create({ iconText: name && name[0] ? name[0] : ' ' })
    this.contentNode.appendChild($preI)
    this.contentNode.appendChild(Text.create(`${name}：`))
  }

  static value (domNode) {
    return {
      direct: domNode.getAttribute('direct'),
      tag: domNode.getAttribute('tag'),
      name: domNode.getAttribute('name')
    }
  }

  optimize (context) {
    if (this.parent && (this.parent.statics.blotName == 'spoken' || this.parent.statics.blotName == 'range')) {
      this.parent.isolate(0, 1)
      this.parent.unwrap()
    } else {
      super.optimize(context)
    }
  }
}
Speaker.className = 'speaker'
Speaker.blotName = 'speaker'
Speaker.tagName = 'span'

Quill.register(Speaker)