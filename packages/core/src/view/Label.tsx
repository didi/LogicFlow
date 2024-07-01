import { Component } from 'preact/compat'
import { get, isEmpty } from 'lodash-es'
import { GraphModel, BaseEdgeModel, BaseNodeModel } from '../model'
import { ElementState, ElementType, ModelType, EventType } from '../constant'
import { StepDrag } from '../util'
import LogicFlow from '../LogicFlow'
import { observer } from '..'

import LabelType = LogicFlow.LabelType
import LabelConfig = LogicFlow.LabelConfig

type IProps = {
  editable: boolean
  editor: any
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelInfo: LabelType // 当前标签的配置数据
  haveEditor: boolean
}

@observer
export class Label extends Component<IProps> {
  id: string
  editor: any = null
  isHovered: boolean = false
  draggable: boolean = false
  editable: boolean = false
  stepDrag: StepDrag
  textRef: HTMLElement | null = null
  constructor(props) {
    super()
    const {
      labelInfo: { id, draggable },
    } = props
    this.stepDrag = new StepDrag({
      eventType: 'TEXT',
      onDragging: this.onDragging,
      step: 1,
      isStopPropagation: draggable,
    })
    this.draggable = draggable
    this.id = id
  }
  setRef = (dom) => {
    this.textRef = dom
  }
  setHoverOn = () => {
    const { labelInfo, model } = this.props
    labelInfo.isHovered = true
    model.setHovered(true)
    if (this.textRef) {
      this.textRef.style.zIndex = `${model.zIndex + 1}`
    }
  }
  setHoverOff = () => {
    const { labelInfo, model } = this.props
    labelInfo.isHovered = false
    model.setHovered(false)
    if (this.textRef) {
      this.textRef.style.zIndex = `${model.zIndex}`
    }
  }
  // 拖拽事件
  onDragging = (e) => {
    const { model, labelInfo, graphModel } = this.props
    const { transformModel, eventCenter } = graphModel
    const { deltaX, deltaY } = e
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)
    model.moveText(curDeltaX, curDeltaY, labelInfo.id)
    eventCenter.emit(EventType.TEXT_DRAG, {
      data: labelInfo,
      e,
      model,
    })
  }
  onDbClick = (e) => {
    const {
      labelInfo,
      model,
      editable,
      graphModel: { eventCenter },
    } = this.props
    this.draggable = false
    model.setElementState(ElementState.TEXT_EDIT)
    labelInfo.isFocus = true
    if (editable && this.textRef && this.textRef.contentEditable !== 'true') {
      this.autoFocus()
    }
    eventCenter.emit(EventType.TEXT_DBCLICK, {
      data: labelInfo,
      e,
      model,
    })
  }
  onBlur = (e) => {
    const {
      labelInfo,
      model,
      editable,
      graphModel: { eventCenter },
    } = this.props
    if (editable && this.textRef && this.textRef.contentEditable !== 'false') {
      this.textRef.contentEditable = 'false'
      const label = {
        content: this.textRef.innerHTML,
        value: this.textRef.innerText,
        isFocus: false,
      }
      model.updateText(label, this.id)
      model.setElementState(ElementState.DEFAULT)
      labelInfo.isFocus = false
      this.draggable = !!labelInfo.draggable
      eventCenter.emit(EventType.TEXT_BLUR, {
        data: labelInfo,
        e,
        element: this.textRef,
        model,
      })
    }
    this.hideToolBar()
    this.setHoverOff()
  }
  onMouseDown = (ev: MouseEvent) => {
    const {
      model,
      graphModel: {
        editConfigModel: { nodeTextDraggable },
      },
    } = this.props
    if (this.draggable || nodeTextDraggable) {
      this.stepDrag.model = model
      this.stepDrag.handleMouseDown(ev)
    }
  }
  onMouseUp = () => {
    const selection = window.getSelection()
    if (selection) {
      this.showToolBar()
    }
  }
  autoFocus = () => {
    const {
      labelInfo,
      graphModel: { eventCenter },
    } = this.props
    if (!this.textRef) return
    this.textRef.contentEditable = 'true'
    this.textRef.focus()
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(this.textRef)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
    eventCenter.emit(EventType.TEXT_FOCUS, {
      data: labelInfo,
      element: this.textRef,
    })
  }

  showToolBar = () => {
    console.log('showToolBar')
    const { editor, labelInfo } = this.props
    if (!isEmpty(editor)) {
      const toolDom = document.getElementById('medium-editor-toolbar-1')
      if (!toolDom) return
      toolDom.style.display = 'block'
      toolDom.style.position = 'absolute'
      toolDom.style.top = `${labelInfo.y - 60}px`
      toolDom.style.left = `${labelInfo.x - 20}px`
    }
  }

  hideToolBar = () => {
    const { editor } = this.props
    if (!isEmpty(editor)) {
      const toolDom = document.getElementById('medium-editor-toolbar-1')
      if (!toolDom) return
      toolDom.style.display = 'none'
      toolDom.style.position = 'absolute'
      toolDom.style.top = '0px'
      toolDom.style.left = '0px'
    }
  }

  textRefStyle = () => {
    const {
      model,
      graphModel: { theme },
      labelInfo,
    } = this.props
    const {
      width,
      height,
      BaseType,
      properties: { labelConfig },
    } = model
    // 自动换行节点边通用样式
    const commonAutoStyle = {
      // minWidth: '1em',
      minHeight: '1em',
      resize: 'auto',
      whiteSpace: 'normal',
    }
    let elementStyle
    // 首先判断渲染传入的数据里是否设置了最大宽高，是的话就用传入的
    // 其次判断是节点还是边，如果是节点最大宽高取节点的宽高；如果是边则不做限制
    // 最后判断文本朝向，如果是纵向文本，最大宽高===节点的高宽；如果是横向文本，最大宽高===节点宽高
    let maxWidth = labelInfo.maxWidth
    let maxHeight = labelInfo.maxHeight
    if (BaseType === 'node') {
      console.log('node text width', width, height)
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
      console.log('finalTextWidth', nodeTextWidth, textWidth, width)
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
          // width: finalTextWidth - 2,
          minWidth:
            modelType === ModelType.TEXT_NODE ? undefined : finalTextWidth - 2,
          lineHeight,
          padding: wrapPadding,
          wordBreak:
            modelType === ModelType.TEXT_NODE ? 'keep-all' : 'break-all',
          maxWidth: modelType === ModelType.TEXT_NODE ? undefined : maxWidth,
          maxHeight: modelType === ModelType.TEXT_NODE ? undefined : maxHeight,
          // background: 'transparent',
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
      graphModel,
      model: { BaseType },
    } = this.props
    const {
      editConfigModel: { nodeTextDraggable, edgeTextDraggable },
    } = graphModel
    if (
      (BaseType === ElementType.NODE && nodeTextDraggable && this.draggable) ||
      (BaseType === ElementType.EDGE && edgeTextDraggable && this.draggable)
    ) {
      classNames.push('lf-text-draggable')
    }
    return classNames.join(' ')
  }

  componentDidMount(): void {
    const { labelInfo, haveEditor, editor } = this.props
    if (this.textRef) {
      this.textRef.innerHTML = get(labelInfo, 'content', '')
    }
    if (labelInfo.isFocus) {
      this.autoFocus()
    }
    // 画布初始化时富文本插件还没有初始化，所以需要在update的时候加上监听事件
    // 画布初始化后的文本节点则在mounted时加上监听事件
    if (haveEditor && editor && !this.editor) {
      this.editor = editor
      this.editor.on(this.textRef, 'dblclick', this.onDbClick)
      this.editor.on(this.textRef, 'mouseup', this.onMouseUp)
      this.editor.on(this.textRef, 'mouseenter', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseover', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseleave', this.setHoverOff)
      this.editor.subscribe('blur', this.onBlur)
    }
  }

  componentDidUpdate(): void {
    const {
      model: { state },
      labelInfo: { isFocus = false },
      editor,
    } = this.props
    // 画布初始化时富文本插件还没有初始化，所以需要在update的时候加上监听事件
    if (editor && !this.editor) {
      this.editor = editor
      this.editor.on(this.textRef, 'dblclick', this.onDbClick)
      this.editor.on(this.textRef, 'mouseup', this.onMouseUp)
      this.editor.on(this.textRef, 'mouseenter', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseover', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseleave', this.setHoverOff)
      this.editor.subscribe('blur', this.onBlur)
    }
    if (state === ElementState.TEXT_EDIT && isFocus) {
      this.autoFocus()
    }
  }

  render() {
    const {
      editor,
      labelInfo,
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
        id={`element-container-${labelInfo.id}`}
        class={this.elementContainerClass()}
        onMouseDown={this.onMouseDown}
        onDblClick={(!editor && this.onDbClick) || undefined}
        onBlur={(!editor && this.onBlur) || undefined}
        onMouseEnter={(!editor && this.setHoverOn) || undefined}
        onMouseOver={(!editor && this.setHoverOn) || undefined}
        onMouseLeave={(!editor && this.setHoverOff) || undefined}
        style={{
          width: '20px',
          height: '20px',
          transform: `rotate(${
            (labelConfig as LabelConfig)?.verticle ? '-0.25turn' : 0
          })`,
          top: `${labelInfo.y}px`,
          left: `${labelInfo.x}px`,
          pointerEvents: labelInfo.content ? 'all' : 'none',
        }}
      >
        <div
          id={`editor-container-${labelInfo.id}`}
          ref={this.setRef}
          style={this.textRefStyle()}
          class="lf-label-editor"
        />
      </div>
    )
  }
}

export default Label
