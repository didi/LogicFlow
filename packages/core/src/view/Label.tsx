import { Component } from 'preact/compat'
import { get } from 'lodash-es'
import { GraphModel, BaseEdgeModel, BaseNodeModel } from '../model'
import { ElementState, ElementType, ModelType, EventType } from '../constant'
import { StepDrag } from '../util'
import LogicFlow from '../LogicFlow'
import { observer } from '..'

import LabelType = LogicFlow.LabelType
import LabelConfig = LogicFlow.LabelConfig

type IProps = {
  labelIndex: number
  editable: boolean
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelState: LabelType // 当前标签的配置数据
}

// type IState = {}
type IState = {
  ref: HTMLElement
  status: number
  draggable: boolean
  editable: boolean
  content: string
  x: number
  y: number
  width: number
  height: number
  style: object
  isHovered: boolean
}
@observer
export class Label extends Component<IProps, IState> {
  id: string
  draggable: boolean = false
  editable: boolean = false
  isHovered: boolean = false
  stepDrag: StepDrag
  textElememt: HTMLElement | null = null
  constructor(props) {
    super()
    const {
      labelState: { id },
      model: {
        text: { draggable = false },
      },
    } = props
    this.stepDrag = new StepDrag({
      eventType: 'TEXT',
      onDragging: this.onDragging,
      step: 1,
      isStopPropagation: draggable,
    })
    this.id = id
  }
  // 拖拽事件
  onDragging = (e) => {
    const {
      model,
      labelState,
      graphModel: { transformModel, eventCenter },
    } = this.props
    const { deltaX, deltaY } = e
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)
    model.moveText(curDeltaX, curDeltaY)
    eventCenter.emit(EventType.TEXT_DRAG, {
      data: labelState,
      e,
      model,
    })
  }
  onDbClick = (e) => {
    const {
      labelState,
      model,
      editable,
      graphModel: { eventCenter },
    } = this.props
    model.setElementState(ElementState.TEXT_EDIT)
    if (
      editable &&
      this.textElememt &&
      this.textElememt.contentEditable !== 'true'
    ) {
      this.autoFocus()
    }
    eventCenter.emit(EventType.TEXT_DRAG, {
      data: labelState,
      e,
      model,
    })
  }
  onBlur = (e) => {
    const {
      labelState,
      model,
      editable,
      graphModel: { eventCenter },
    } = this.props
    if (
      editable &&
      this.textElememt &&
      this.textElememt.contentEditable !== 'false'
    ) {
      this.textElememt.contentEditable = 'false'
      const label = {
        content: this.textElememt.innerHTML,
        value: this.textElememt.innerText,
        isFocus: false,
      }
      // if (!trim(this.textElememt.innerText)) {
      //   this.props.editor.removeElements(this.textElememt)
      //   this.props.model.deleteText({ id: this.id })
      //   return
      // }
      model.updateText(label, this.id)
      model.setElementState(ElementState.DEFAULT)
      eventCenter.emit(EventType.TEXT_BLUR, {
        data: labelState,
        e,
        element: this.textElememt,
        model,
      })
    }
  }
  onMouseDown = (ev: MouseEvent) => {
    const {
      labelState: { draggable },
      model,
      graphModel: {
        editConfigModel: { nodeTextDraggable },
      },
    } = this.props
    if (draggable || nodeTextDraggable) {
      this.stepDrag.model = model
      this.stepDrag.handleMouseDown(ev)
    }
  }
  autoFocus() {
    const {
      labelState,
      graphModel: { eventCenter },
    } = this.props
    if (!this.textElememt) return
    this.textElememt.contentEditable = 'true'
    this.textElememt.focus()
    eventCenter.emit(EventType.TEXT_FOCUS, {
      data: labelState,
      element: this.textElememt,
    })
  }

  setHoverON = () => {
    this.setState({ isHovered: true })
  }

  setHoverOFF = () => {
    this.setState({ isHovered: false })
  }

  textElementStyle = () => {
    const {
      model,
      graphModel: { theme },
      labelState,
    } = this.props
    const {
      width,
      height,
      BaseType,
      properties: { labelConfig },
    } = model
    // const { inputText } = theme
    let elementStyle
    // 自动换行节点边通用样式
    const commonAutoStyle = {
      minWidth: '1em',
      minHeight: '1em',
      resize: 'auto',
      whiteSpace: 'normal',
      wordBreak: 'break-all',
    }
    // 首先判断渲染传入的数据里是否设置了最大宽高，是的话就用传入的
    // 其次判断是节点还是边，如果是节点最大宽高取节点的宽高；如果是边则不做限制
    // 最后判断文本朝向，如果是纵向文本，最大宽高===节点的高宽；如果是横向文本，最大宽高===节点宽高
    let maxWidth = labelState.maxWidth
    let maxHeight = labelState.maxHeight
    if (BaseType === 'node') {
      maxWidth = `${(labelConfig as LabelConfig)?.verticle ? height : width}px`
      maxHeight = `${(labelConfig as LabelConfig)?.verticle ? width : height}px`
    }
    // 如果边文案自动换行, 设置编辑框宽度
    if (BaseType === ElementType.EDGE) {
      const {
        edgeText: { overflowMode, lineHeight, wrapPadding, textWidth },
      } = theme
      if (textWidth && overflowMode === 'autoWrap') {
        elementStyle = {
          ...commonAutoStyle,
          width: textWidth,
          minWidth: textWidth,
          lineHeight,
          padding: wrapPadding,
          maxWidth,
          maxHeight,
        }
      }
    } else if (BaseType === ElementType.NODE) {
      // 如果节点文案自动换行, 设置编辑框宽度
      const {
        nodeText: { overflowMode, lineHeight, wrapPadding, textWidth },
      } = theme
      const { width, modelType, textWidth: nodeTextWidth } = model
      const finalTextWidth =
        nodeTextWidth ||
        textWidth ||
        ((labelConfig as LabelConfig)?.verticle ? height : width)
      // 文本节点没有默认宽高，只有在设置了textWidth之后才能进行自动换行
      if (
        (modelType !== ModelType.TEXT_NODE && overflowMode !== 'autoWrap') ||
        (modelType === ModelType.TEXT_NODE && textWidth)
      ) {
        elementStyle = {
          ...commonAutoStyle,
          width: finalTextWidth,
          minWidth: finalTextWidth,
          lineHeight,
          padding: wrapPadding,
          maxWidth,
          maxHeight,
          background: 'transparent',
        }
      }
    }
    return {
      ...elementStyle,
      // ...inputText,
    }
  }

  elementContainerClass = () => {
    const classNames = ['lf-label-editor-container']
    const {
      labelState,
      graphModel,
      model: { BaseType },
    } = this.props
    const {
      editConfigModel: { nodeTextDraggable, edgeTextDraggable },
    } = graphModel
    const { draggable } = labelState
    if (
      (BaseType === ElementType.NODE && nodeTextDraggable && draggable) ||
      (BaseType === ElementType.EDGE && edgeTextDraggable && draggable)
    ) {
      classNames.push('lf-text-draggable')
    }
    return classNames.join(' ')
  }

  componentDidMount(): void {
    const { labelState } = this.props
    this.textElememt = document.getElementById(
      `editor-container-${labelState.id}`,
    )
    // this.props.editor.on(this.textElememt, 'dblclick', this.onDbClick)
    // this.props.editor.on(this.textElememt, 'blur', this.onBlur)
    if (this.textElememt) {
      this.textElememt.innerHTML = get(labelState, 'content', '')
    }
    if (labelState.isFocus) {
      this.autoFocus()
    }
  }

  componentDidUpdate(): void {
    const {
      model: { state },
      labelState: { isFocus = false },
    } = this.props
    if (state === ElementState.TEXT_EDIT && isFocus) {
      this.autoFocus()
    }
  }

  render() {
    const {
      labelState,
      model: {
        properties: { labelConfig },
        getTextShape,
      },
    } = this.props
    if (getTextShape()) {
      return <div>{getTextShape()}</div>
    }
    return (
      <div
        id={`element-container-${labelState.id}`}
        class={this.elementContainerClass()}
        onMouseDown={this.onMouseDown}
        onDblClick={this.onDbClick}
        onBlur={this.onBlur}
        style={{
          width: '20px',
          height: '20px',
          transform: `rotate(${
            (labelConfig as LabelConfig)?.verticle ? '-0.25turn' : 0
          })`,
          top: `${labelState.y}px`,
          left: `${labelState.x}px`,
          pointerEvents: labelState.content ? 'all' : 'none',
        }}
      >
        <div
          id={`editor-container-${labelState.id}`}
          style={this.textElementStyle()}
          class="lf-label-editor"
        />
      </div>
    )
  }
}

export default Label
