import MediumEditor from 'medium-editor'
import Picker from 'vanilla-picker'
import rangy from 'rangy'
import 'rangy/lib/rangy-classapplier'

export const defaultOptions = {
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
    standardizeSelectionStart: false,
    updateOnEmptySelection: false,
  },

  placeholder: {
    text: '请输入内容',
    hideOnClick: true,
  },
  disableEditing: true,
}

export function createColorPickerButtonClass(MediumEditor?: any) {
  const ButtonBase =
    MediumEditor?.extensions?.button || MediumEditor?.extensions?.button
  const ExtensionBase =
    MediumEditor?.Extension || (MediumEditor as any)?.Extension

  // 当 Button 扩展基类不可用时，回退到 Extension 基类，避免在模块加载阶段抛错
  const Base = ButtonBase || ExtensionBase
  if (!Base) {
    console.warn(
      'MediumEditor button/extension base not available; using noop extension',
    )
    return class {}
  }

  return Base.extend({
    name: 'colorpicker',
    tagNames: ['mark'],
    contentDefault: '<b>Color</b>',
    aria: 'Color Picker',
    action: 'colorPicker',
    init: function () {
      try {
        rangy.init()
      } catch {
        console.error('rangy.init failed')
      }
      // 初始化按钮（ButtonBase 才有 prototype.init）
      try {
        ;(ButtonBase as any)?.prototype?.init?.call(this)
      } catch {
        console.error('ButtonBase.init failed')
      }
      this.colorPicker = new Picker({
        parent: (this as any).button || undefined,
        color: '#000',
        onDone: (res) => {
          try {
            if (this.coloredText && this.coloredText.isAppliedToSelection?.()) {
              this.coloredText.undoToSelection()
            }
            this.coloredText = rangy.createClassApplier('colored', {
              elementTagName: 'span',
              elementProperties: { style: { color: res.hex } },
              normalize: true,
            })
            this.coloredText.toggleSelection()
            this.base?.checkContentChanged?.()
            this.setInactive?.()
          } catch {
            console.error('Picker.onDone failed')
          }
        },
      })
    },
    getButton: function () {
      return (this as any).button
    },
    handleClick: function () {
      this.setActive?.()
      this.colorPicker?.show?.()
    },
    isAlreadyApplied: function (node) {
      return node?.nodeName?.toLowerCase?.() === 'mark'
    },
    isActive: function () {
      return (this as any).button?.classList?.contains(
        'medium-editor-button-active',
      )
    },
    setInactive: function () {
      ;(this as any).button?.classList?.remove('medium-editor-button-active')
    },
    setActive: function () {
      ;(this as any).button?.classList?.add('medium-editor-button-active')
    },
  })
}

export { MediumEditor }
