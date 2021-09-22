const Quill = require('quill')

const Embed = Quill.import('blots/embed')
const Text = Quill.import('blots/text')
const Inline = Quill.import('blots/inline')
const equal = require('deep-equal');

class rangeBlot extends Inline {
    static create(value) {
        const node = super.create()
        if (value.speaker) node.setAttribute('speaker', value.speaker)
        if (value.name) node.setAttribute('name', value.name)
        if (value.class) node.setAttribute('class', value.class)
        if (value.begin) node.setAttribute('begin', value.begin)
        if (value.end) node.setAttribute('end', value.end)
        if (value.var) node.setAttribute('var', value.var)
        if (value.role) node.setAttribute('role', value.role)
        if (value.tag) node.setAttribute('tag', value.tag)
        if (value.voiceId) node.setAttribute('voiceId', value.voiceId)
        return node
    }

    static formats(node) {
        return {
            class: node.getAttribute('class'),
            speaker: node.getAttribute('speaker'),
            begin: node.getAttribute('begin'),
            end: node.getAttribute('end'),
            var: node.getAttribute('var'),
            role: node.getAttribute('role'),
            tag: node.getAttribute('tag'),
            name: node.getAttribute('name'),
            voiceId: node.getAttribute('voiceId')
        }
    }

    optimize(context) {
        if (!this.prev) return
        if (this.prev.statics.blotName != 'range') return

        const formats = this.formats()
        const attributes = formats && formats.range ? formats.range : {}
        if (attributes.var) return

        const prevFormats = this.prev.formats()
        const prevAttributes = prevFormats && prevFormats.range
            ? prevFormats.range : {}
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

    formatAt(index, length, name, value) {
        console.log('===> range formatAt{},{},{},{}', index, length, name, value)

        if (name == 'spoken' || name == 'sensitive') {
            let blot = this.isolate(index, length)
            blot.children.forEach(i => {
                if (i.statics.blotName == 'spoken' || i.statics.blotName == 'sensitive') {
                    i.domNode.classList.add(name)
                } else {
                    i.wrap(name, value)
                }
            })
        } else {
            return super.formatAt(index, length, name, value)
        }
    }
}

rangeBlot.blotName = 'range'
rangeBlot.tagName = 'span'

class iconBlot extends Inline {
    static create({iconText}) {
        const node = super.create()
        node.appendChild(Text.create(iconText))
        return node
    }

    static formats(node) {
        return {
            iconText: node.innerText
        }
    }
}

iconBlot.className = 'speaker-icon'
iconBlot.blotName = 'speakerIcon'
iconBlot.tagName = 'span'


class speakerBlot extends Embed {
    constructor(node, value) {
        super(node)
        const {name, tag, direct, voiceId} = value
        if (name == '未知') {
            this.domNode.classList.add('unknow-speaker')
        }

        this.domNode.setAttribute('direct', direct)
        this.domNode.setAttribute('tag', tag)
        this.domNode.setAttribute('name', name)
        this.domNode.setAttribute('voiceId', voiceId)

        const $preI = iconBlot.create({iconText: name && name[0] ? name[0] : ' '})
        this.contentNode.appendChild($preI)
        this.contentNode.appendChild(Text.create(`${name}：`))
    }

    static value(domNode) {
        return {
            direct: domNode.getAttribute('direct'),
            tag: domNode.getAttribute('tag'),
            name: domNode.getAttribute('name'),
            voiceId: domNode.getAttribute('voiceId')
        }
    }

    optimize(context) {
        if (this.parent && (this.parent.statics.blotName == 'spoken'
            || this.parent.statics.blotName == 'range'
            || this.parent.statics.blotName == 'sensitive')) {
            this.parent.isolate(0, 1)
            this.parent.unwrap()
        } else {
            super.optimize(context)
        }
    }
}

speakerBlot.className = 'speaker'
speakerBlot.blotName = 'speaker'
speakerBlot.tagName = 'span'

class speakerV2Blot extends Embed {
    constructor(node, value) {

        super(node)
        const {name, role, tag, timestamp, src} = value
        if (name == '未知') {
            this.domNode.classList.add('unknow-speaker')
        }

        this.domNode.setAttribute('role', role)
        this.domNode.setAttribute('tag', tag)
        this.domNode.setAttribute('name', name)
        this.domNode.setAttribute('timestamp', timestamp)

        const $preI = iconBlot.create({ iconText: name && name[0] ? name[0] : ' ' })
        this.contentNode.appendChild($preI)
        this.contentNode.appendChild(Text.create(`${name}：`))
        let time = formatBegin(timestamp)
        this.contentNode.appendChild(Text.create(time))
    }

    static value(domNode) {
        return {
            role: domNode.getAttribute('role'),
            tag: domNode.getAttribute('tag'),
            name: domNode.getAttribute('name'),
            timestamp: domNode.getAttribute('timestamp'),
            src: domNode.firstElementChild.firstElementChild.getAttribute('src')
        }
    }

    optimize(context) {
        if (this.parent && (this.parent.statics.blotName == 'spoken' || this.parent.statics.blotName == 'range')) {
            this.parent.isolate(0, 1)
            this.parent.unwrap()
        } else {
            super.optimize(context)
        }
    }
}

speakerV2Blot.className = 'speakerV2'
speakerV2Blot.blotName = 'speakerV2'
speakerV2Blot.tagName = 'span'

// 敏感词转化
class sensitiveBlot extends Inline {
    static formats(node) {
        return true
    }

    optimize(context) {
        if (this.children.length === 0) {
            this.remove()
        }
    }

    formatAt(index, length, name, value) {
        console.log('===> sensitive formatAt{},{},{},{}', index, length, name, value)
        if (name != 'sensitive') return super.formatAt(index, length, name, value)

        // console.log('===> sensitive formatAt')
        this.children.forEach(i => {
            if (i.statics.blotName == 'range') {
                i.children.forEach(iChild => iChild.wrap('sensitive', true))
            }
        })
        this.unwrap()
    }

    static create(value) {
        const node = super.create()
        return node
    }
}

sensitiveBlot.className = 'sensitive'
sensitiveBlot.blotName = 'sensitive'
sensitiveBlot.tagName = 'span'

class spokenBlot extends Inline {
    static formats(node) {
        return true
    }

    optimize(context) {
        if (this.children.length === 0) {
            this.remove()
        }
    }

    formatAt(index, length, name, value) {
        console.log('===> spoken formatAt{},{},{},{}', index, length, name, value)
        if (name != 'spoken') {
            return super.formatAt(index, length, name, value)
        }

        // console.log('===> spoken formatAt')
        this.children.forEach(i => {
            if (i.statics.blotName == 'range') {
                i.children.forEach(iChild => iChild.wrap('spoken', true))
            }
        })
        this.unwrap()
    }

    static create(value) {
        const node = super.create()
        return node
    }
}

spokenBlot.className = 'spoken'
spokenBlot.blotName = 'spoken'
spokenBlot.tagName = 'span'

class timestampBlot extends Embed {
    constructor(node, value) {
        super(node)
        const {timestamp} = value
        this.domNode.setAttribute('timestamp', timestamp)
        let time = formatBegin(timestamp)
        this.contentNode.appendChild(Text.create(time))
    }

    static value(domNode) {
        return {
            timestamp: domNode.getAttribute('timestamp'),
        }
    }
}

timestampBlot.className = 'timestamp'
timestampBlot.blotName = 'timestamp'
timestampBlot.tagName = 'span'

Quill.register(spokenBlot)
Quill.register(rangeBlot)
Quill.register(speakerBlot)
Quill.register(speakerV2Blot)
Quill.register(sensitiveBlot)
Quill.register(timestampBlot)

function formatBegin(begin,fmt) {
    if (!begin) return '00:00:00'
    const second=typeof begin === 'number' ? Math.floor(begin)/1000 : 0
    if (!fmt) fmt = 'hh:mm:ss'
    var leftSecond = typeof second === 'number' ? Math.floor(second) : 0
    var str = ''
    var substrs = function (str, len) {
        return len == 1 ? str : (('00' + str).substr((('' + str).length) > 2 ? 2 : ('' + str).length))
    }
    // 天
    if (/(d+)/.test(fmt)) {
        var dd = Math.floor(leftSecond / (3600 * 24))
        fmt = fmt.replace(/d+/, substrs(dd, RegExp.$1.length))
        leftSecond = leftSecond % (3600 * 24)
    }
    // 小时
    if (/h+/.test(fmt)) {
        var hh = Math.floor(leftSecond / (3600))
        fmt = fmt.replace(/h+/, substrs(hh, RegExp.$1.length))
        leftSecond = leftSecond % (3600)
    }
    // 分钟
    if (/m+/.test(fmt)) {
        var mm = Math.floor(leftSecond / (60))
        fmt = fmt.replace(/m+/, substrs(mm, RegExp.$1.length))
        leftSecond = leftSecond % (60)
    }
    // 秒
    if (/s+/.test(fmt)) {
        var ss = Math.round(leftSecond / 1)
        fmt = fmt.replace(/s+/, substrs(ss, RegExp.$1.length))
    }
    return fmt

}