import MediumEditor from 'medium-editor'
import { merge } from 'lodash-es'

export default class RichTextEditor {
  static pluginName = 'rich-text-editor'
  editor: MediumEditor | null = null
  lf: any
  constructor({ lf }) {
    this.lf = lf
    const editorOption = {
      anchorPreview: false,
      toolbar: false,
      disableEditing: true,
      keyboardCommands: [
        {
          command: 'delete',
          key: 'backspace',
          meta: true,
          shift: false,
          alt: false,
        },
      ],
      tool: false, // TODO 确认外部工具栏联动方案
    }
    this.editor = new MediumEditor(
      '.lf-label-editor',
      merge(editorOption, lf.richTextConfig),
    )
  }

  destory() {
    this.editor.removeElements('.lf-label-editor')
    this.editor.destroy()
  }
}
