import { createRef, Component } from 'preact/compat'
import { IToolProps } from '.'
import { ElementState, observer } from '..'
import { ElementType, EventType, ModelType } from '../constant'

type IState = {
  style: {
    left: number
    top: number
  }
}

@observer
export class TextEditTool extends Component<IToolProps, IState> {
  static toolName = 'text-edit-tool'
  ref = createRef()
  __prevText = {
    type: '',
    text: '',
    id: '',
  }

  constructor(props: IToolProps) {
    super(props)
    this.state = {
      style: {
        left: 0,
        top: 0,
      },
    }
  }

  static getDerivedStateFromProps(props: IToolProps): IState | null {
    const { textEditElement, graphModel } = props
    const { transformModel, theme } = graphModel
    const { inputText } = theme

    let autoStyle
    if (textEditElement) {
      // 由于边上的文本是依据显示的时候动态计算出来的
      // 所以不能在边创建的时候就初始化文本位置。
      // 而是在边上新建文本的时候创建。
      if (!textEditElement.text?.value) {
        if (textEditElement.BaseType === ElementType.EDGE) {
          // textEditElement = textEditElement as BaseEdgeModel
          const textConfig = textEditElement.text
          const { x, y } = textEditElement.textPosition
          textConfig.x = x
          textConfig.y = y
          textEditElement.setText(textConfig)
        }
      }
      // 自动换行节点边通用样式
      const commonAutoStyle = {
        resize: 'auto',
        whiteSpace: 'normal',
        wordBreak: 'break-all',
      }
      if (textEditElement.BaseType === ElementType.EDGE) {
        // 如果边文案自动换行, 设置编辑框宽度
        const {
          edgeText: { overflowMode, lineHeight, wrapPadding, textWidth },
        } = theme
        if (textWidth && overflowMode === 'autoWrap') {
          autoStyle = {
            ...commonAutoStyle,
            width: textWidth,
            minWidth: textWidth,
            lineHeight,
            padding: wrapPadding,
          }
        }
      } else if (textEditElement.BaseType === ElementType.NODE) {
        // 如果节点文案自动换行, 设置编辑框宽度
        const {
          nodeText: { overflowMode, lineHeight, wrapPadding, textWidth },
        } = theme
        const { width, modelType, textWidth: nodeTextWidth } = textEditElement

        const finalTextWidth = nodeTextWidth || textWidth || width
        // 文本节点没有默认宽高，只有在设置了textWidth之后才能进行自动换行
        if (
          (modelType !== ModelType.TEXT_NODE && overflowMode === 'autoWrap') ||
          (modelType === ModelType.TEXT_NODE && textWidth)
        ) {
          autoStyle = {
            ...commonAutoStyle,
            width: finalTextWidth,
            minWidth: finalTextWidth,
            lineHeight,
            padding: wrapPadding,
          }
        }
      }

      const { x, y } = textEditElement.text
      const [left, top] = transformModel.CanvasPointToHtmlPoint([x, y])
      return {
        style: {
          left,
          top,
          ...autoStyle,
          ...inputText,
        },
      }
    }

    return null
  }

  componentDidUpdate() {
    const { graphModel } = this.props
    if (this.ref.current) {
      this.ref.current.focus()
      this.placeCaretAtEnd(this.ref.current)
    }
    if (this.__prevText.id !== '') {
      const { text, id } = this.__prevText
      graphModel.updateText(id, text)
      graphModel.eventCenter.emit(EventType.TEXT_UPDATE, {
        data: { ...this.__prevText },
      })
      this.__prevText.id = ''
      this.__prevText.text = ''
      this.__prevText.type = ''
    }
  }

  keyupHandler = (ev: KeyboardEvent) => {
    const {
      graphModel: { textEditElement },
    } = this.props
    // 按下alt+enter表示输入完成
    if (ev.key === 'Enter' && ev.altKey) {
      textEditElement?.setElementState(ElementState.DEFAULT)
    }
  }
  inputHandler = (ev: any) => {
    const { innerText: value } = ev.target as HTMLElement
    const {
      graphModel: { textEditElement },
    } = this.props
    if (textEditElement) {
      this.__prevText = {
        type: textEditElement.type,
        text: value.replace(/(\r\n)+$|(\n)+$/, ''), // fix #488: 文本后面的换行符不保留
        id: textEditElement.id,
      }
    }
  }
  // fix: #587 #760
  keydownHandler = (ev: any) => {
    ev.stopPropagation()
  }

  placeCaretAtEnd(el: any) {
    if (
      window.getSelection !== undefined &&
      document.createRange !== undefined
    ) {
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }

  render() {
    const {
      graphModel: { textEditElement },
    } = this.props
    const { style } = this.state
    return textEditElement ? (
      <div
        contentEditable
        className="lf-text-input"
        style={style}
        ref={this.ref}
        key={textEditElement.id}
        onKeyUp={this.keyupHandler}
        onKeyDown={this.keydownHandler}
        onKeyPress={this.keydownHandler}
        onInput={this.inputHandler}
      >
        {textEditElement.text?.value}
      </div>
    ) : null
  }
}

export default TextEditTool
