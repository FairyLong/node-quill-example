const Quill = require('quill')

const Embed = Quill.import('blots/embed')
const Text = Quill.import('blots/text')
const Inline = Quill.import('blots/inline')

class SpokenBlot extends Inline {
  static formats(node) {
    return true
  }

  // insertAt () {
  //   // console.log('===> insertAt')
  // }

  optimize (context) {
    // if (this.parent instanceof Inline && this.parent.statics.blotName == 'range') return
    if (this.children.length === 0) {
      this.remove()
    }
  }

  formatAt (index, length, name, value) {
    if (name != 'spoken') return super.formatAt(index, length, name, value)

    console.log('===> spoken formatAt')

    this.children.forEach(i => {
      if (i.statics.blotName == 'range') {
        i.children.forEach(iChild => iChild.wrap('spoken', true))
      }
    })
    this.unwrap()
  }

  static create (value) {
    const node = super.create()
    // const { spoken } = value
    // const $text = Text.create(spoken)
    // node.appendChild($text)
    // node.setAttribute('spoken', spoken)
    // node['__blot'] = {blot: this}
    return node
  }
}

SpokenBlot.className = 'spoken'
SpokenBlot.blotName = 'spoken'
SpokenBlot.tagName = 'span'

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


class rangeBlot extends Inline {
  optimize (context) {
    if (!this.prev) return
    if (this.prev.statics.blotName != 'range') return

    const formats = this.formats()
    const attributes = formats && formats.range ? formats.range : {}
    if (attributes.var) return

    const prevFormats = this.prev.formats()
    const prevAttributes = prevFormats && prevFormats.range ? prevFormats.range : {}
    // if (prevAttributes.begin != attributes.begin) return
    if (!equal(attributes, prevAttributes)) return


    // 合并
    if (this.children) {
      this.children.forEach(i => this.prev.appendChild(i))
      this.remove()
    } else {
      this.prev.appendChild(this)
    }
  }

  formatAt (index, length, name, value) {
    if (name != 'spoken') return super.formatAt(index, length, name, value)

    console.log('===> range format')

    let blot = this.isolate(index, length)
    blot.children.forEach(i => i.wrap(name, value))
  }

  static create (value) {
    const node = super.create()
    const spokens = value.spokens

    if (value.begin != null) node.setAttribute('begin', value.begin)
    if (value.end != null) node.setAttribute('end', value.end)
    if (value.var) node.setAttribute('var', value.var)
    if (value.role) node.setAttribute('role', value.role)
    if (value.speaker) node.setAttribute('speaker', value.speaker)
    if (value.tag) node.setAttribute('tag', value.tag)
    if (value.direct != null) node.setAttribute('direct', value.direct)

    return node
  }

  static formats (node) {
    return {
      begin: node.getAttribute('begin'),
      end: node.getAttribute('end'),
      var: node.getAttribute('var'),
      role: node.getAttribute('role'),
      speaker: node.getAttribute('speaker'),
      tag: node.getAttribute('tag'),
      direct: node.getAttribute('direct')
    }
  }
}
rangeBlot.blotName = 'range'
rangeBlot.tagName = 'span'

class languageBlot extends Inline {
  static create(value) {
    const node = super.create()
    node.setAttribute('ot-lang', value)
    console.log("create lang",value)
    return node
  }

  static formats (node) {
    return node.getAttribute('ot-lang')
  }

  formatAt (index, length, name, value) {
    console.log("lang formatAt",index, length, name, value)
    if (name != 'lang') return super.formatAt(index, length, name, value)

    console.log('===> lang format')

  }

  optimize (context) {
    console.log("*****lang optimize")
    // if (this.children) {
    //   this.children.forEach(item => {
    //     console.log("wrap start")
    //     item.wrap('lang', this.format())
    //     console.log("wrap end")
    //   })
    //   this.unwrap()
    // }
  }
}
languageBlot.blotName = 'lang'

Quill.register(SpokenBlot)
Quill.register(Speaker)
Quill.register(rangeBlot)
Quill.register(languageBlot)