import MediumEditor from 'medium-editor'
import Picker from 'vanilla-picker'
import rangy from 'rangy'
import 'rangy/lib/rangy-classapplier'
import { merge } from 'lodash-es'

const ColorPickerButton = MediumEditor.extensions.button.extend({
  name: 'colorpicker',
  tagNames: ['mark'],
  contentDefault: '<b>Color</b>',
  aria: 'Color Picker',
  action: 'colorPicker',
  init: function () {
    rangy.init()
    MediumEditor.extensions.button.prototype.init.call(this)
    this.colorPicker = new Picker({
      parent: this.button,
      color: '#000',
      onDone: (res) => {
        if (this.coloredText && this.coloredText.isAppliedToSelection()) {
          this.coloredText.undoToSelection()
        }
        this.coloredText = rangy.createClassApplier('colored', {
          elementTagName: 'span',
          elementProperties: {
            style: {
              color: res.hex,
            },
          },
          normalize: true,
        })
        this.coloredText.toggleSelection()
        this.base.checkContentChanged()
        this.setInactive()
      },
    })
  },
  getButton: function () {
    return this.button
  },
  handleClick: function () {
    this.setActive()
    this.colorPicker.show()
  },
  isAlreadyApplied: function (node) {
    return node.nodeName.toLowerCase() === 'mark'
  },
  isActive: function () {
    return this.button.classList.contains('medium-editor-button-active')
  },
  setInactive: function () {
    this.button.classList.remove('medium-editor-button-active')
  },
  setActive: function () {
    this.button.classList.add('medium-editor-button-active')
  },
})

class RichTextEditor {
  static pluginName = 'richTextEditor'
  enable: boolean = false
  editorOptions: any
  editor: MediumEditor | null = null

  constructor({ lf, options }) {
    this.enable = options.enable
    lf.useRichText = true
    const defaultOption = {
      toolbar: {
        allowMultiParagraphSelection: true,
        buttons: [
          'bold',
          'colorpicker',
          'italic',
          'underline',
          'strikethrough',
          'quote',
          'justifyLeft',
          'justifyCenter',
          'justifyRight',
          'justifyFull',
          'superscript',
          'subscript',
          'orderedlist',
          'unorderedlist',
          'pre',
          'removeFormat',
          'outdent',
          'indent',
          'h2',
          'h3',
        ],
        diffLeft: 100,
        diffTop: 0,
        standardizeSelectionStart: false,
        updateOnEmptySelection: false,
      },

      placeholder: {
        text: '请输入内容',
        hideOnClick: true,
      },
      disableEditing: true,
    }
    this.editorOptions = merge(defaultOption, lf.richTextConfig)
    lf.on('rich-text:init', () => {
      this.init()
    })
  }

  init() {
    const container = document.getElementById('lf-label-overlay')
    this.editor = new MediumEditor(
      '.lf-label-editor',
      merge(this.editorOptions, {
        elementsContainer: container,
        toolbar: {
          relativeContainer: container,
        },
        extensions: {
          colorPicker: new ColorPickerButton(),
        },
      }),
    )
  }

  addElements(
    elements:
      | string
      | HTMLElement
      | string[]
      | HTMLElement[]
      | NodeList
      | HTMLCollection,
  ) {
    this.editor.addElements(elements)
  }

  removeElements(
    elements:
      | string
      | HTMLElement
      | string[]
      | HTMLElement[]
      | NodeList
      | HTMLCollection,
  ) {
    this.editor.removeElements(elements)
  }

  updateElements(
    elements:
      | string
      | HTMLElement
      | string[]
      | HTMLElement[]
      | NodeList
      | HTMLCollection,
  ) {
    this.removeElements(elements)
    this.addElements(elements)
  }

  destory() {
    this.editor.destroy()
  }

  restore() {
    this.editor.restore()
  }

  changeEnable(enable: boolean = true) {
    enable ? this.restore() : this.destory()
    this.enable = enable
  }
}

export { RichTextEditor }

export default RichTextEditor
