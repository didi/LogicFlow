import { Component } from 'preact/compat'
import { get, isEmpty } from 'lodash-es'
import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  observer,
  ElementType,
  ElementState,
  ModelType,
  EventType,
  LogicFlowUtil,
} from '@logicflow/core'
import LabelModel from './LabelModel'

import LabelOption = LogicFlow.LabelOption

const { StepDrag } = LogicFlowUtil

type IProps = {
  editable: boolean
  editor: any
  model: BaseEdgeModel | BaseNodeModel // 元素model
  graphModel: GraphModel // 画布model
  labelModel: LabelModel // 当前标签的配置数据
  haveEditor: boolean
}

@observer
export class Label extends Component<IProps> {
  id: string
  editor: any = null
  isHovered: boolean = false
  draggable: boolean = false
  editable: boolean = false
  stepDrag: LogicFlowUtil.StepDrag
  textRef: HTMLElement | null = null
  constructor(props) {
    super()
    const {
      labelModel: { id, draggable },
    } = props
    this.stepDrag = new StepDrag({
      eventType: 'LABEL',
      onDragging: this.onDragging,
      step: 1,
    })
    this.draggable = draggable
    this.id = id
  }
  setRef = (dom) => {
    this.textRef = dom
  }
  setHoverOn = () => {
    const { labelModel, model } = this.props
    labelModel.setAttribute('isHovered', true)
    model.setHovered(true)
    if (this.textRef) {
      this.textRef.style.zIndex = `${model.zIndex + 10}`
    }
  }
  setHoverOff = () => {
    const { labelModel, model } = this.props
    labelModel.setAttribute('isHovered', false)
    model.setHovered(false)
    if (this.textRef) {
      this.textRef.style.zIndex = `${model.zIndex}`
    }
  }
  // 拖拽事件
  onDragging = (e) => {
    const { model, labelModel, graphModel } = this.props
    const { transformModel, eventCenter } = graphModel
    const { deltaX, deltaY } = e
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)
    labelModel.moveLabel(curDeltaX, curDeltaY)
    eventCenter.emit(EventType.LABEL_DRAG, {
      data: labelModel,
      e,
      model,
    })
  }
  onDbClick = (e) => {
    const {
      labelModel,
      model,
      editable,
      graphModel: { eventCenter },
    } = this.props
    this.draggable = false
    model.setElementState(ElementState.TEXT_EDIT)
    labelModel.setAttribute('isFocus', true)
    if (editable && this.textRef && this.textRef.contentEditable !== 'true') {
      this.autoFocus()
    }
    eventCenter.emit(EventType.LABEL_DBCLICK, {
      data: labelModel,
      e,
      model,
    })
  }
  onBlur = (e) => {
    const {
      labelModel,
      model,
      editable,
      graphModel: { eventCenter },
    } = this.props
    if (editable && this.textRef && this.textRef.contentEditable !== 'false') {
      this.textRef.contentEditable = 'false'
      this.hideToolBar()
      this.setHoverOff()
      if (!this.textRef.innerText) {
        eventCenter.emit(EventType.LABEL_SHOULD_DELETE, {
          data: labelModel,
          model,
        })
      } else {
        const label = {
          content: this.textRef.innerHTML,
          value: this.textRef.innerText,
          isFocus: false,
        }
        labelModel.setAttributes(label)
        model.setElementState(ElementState.DEFAULT)
        this.draggable = !!labelModel.draggable
      }
      eventCenter.emit(EventType.LABEL_BLUR, {
        data: labelModel,
        e,
        element: this.textRef,
        model,
      })
    }
  }
  onMouseDown = (ev: MouseEvent) => {
    const {
      labelModel,
      graphModel: {
        editConfigModel: { nodeTextDraggable },
      },
    } = this.props
    if (this.draggable || nodeTextDraggable) {
      this.stepDrag.model = labelModel
      this.stepDrag.handleMouseDown(ev)
    }
  }
  autoFocus = () => {
    const {
      labelModel,
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
    this.showToolBar()
    eventCenter.emit(EventType.LABEL_FOCUS, {
      data: labelModel,
      element: this.textRef,
    })
  }

  showToolBar = () => {
    const { editor, labelModel } = this.props
    if (!isEmpty(editor)) {
      const toolDom = document.getElementById('medium-editor-toolbar-1')
      if (!toolDom) return
      toolDom.style.display = 'block'
      toolDom.style.position = 'absolute'
      toolDom.style.top = `${labelModel.y - 60}px`
      toolDom.style.left = `${labelModel.x - 20}px`
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
      labelModel,
    } = this.props
    const {
      width,
      height,
      BaseType,
      properties: { _labelOption },
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
    let maxWidth = labelModel.style.maxWidth
    let maxHeight = labelModel.style.maxHeight
    if (BaseType === 'node') {
      maxWidth = (_labelOption as LabelOption)?.isVertical ? height : width
      maxHeight = (_labelOption as LabelOption)?.isVertical ? width : height
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
        ((_labelOption as LabelOption)?.isVertical ? height : width)
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
    const {
      model: { state },
      labelModel,
      haveEditor,
      editor,
    } = this.props
    this.draggable = get(labelModel, 'draggable', false)
    this.id = get(labelModel, 'id', '')
    if (this.textRef) {
      this.textRef.innerHTML = get(labelModel, 'content', '')
    }
    if (state === ElementState.TEXT_EDIT && labelModel.isFocus) {
      this.autoFocus()
    }
    // 画布初始化时富文本插件还没有初始化，所以需要在update的时候加上监听事件
    // 画布初始化后的文本节点则在mounted时加上监听事件
    if (haveEditor && editor && !this.editor) {
      this.editor = editor
      if (!this.editor.elements.includes(this.textRef)) {
        this.editor.addElements('.lf-label-editor')
      }
      this.editor.on(this.textRef, 'dblclick', this.onDbClick)
      this.editor.on(this.textRef, 'mouseenter', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseover', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseleave', this.setHoverOff)
      this.editor.subscribe('blur', this.onBlur)
    }
  }

  componentDidUpdate(): void {
    const {
      model,
      labelModel: { isFocus = false },
      editor,
    } = this.props
    if (!model) return
    const { state } = model
    if (state === ElementState.TEXT_EDIT && isFocus) {
      this.autoFocus()
    }
    // 画布初始化时富文本插件还没有初始化，所以需要在update的时候加上监听事件
    if (editor && !this.editor) {
      this.editor = editor
      if (!this.editor.elements.includes(this.textRef)) {
        this.editor.addElements('.lf-label-editor')
      }
      this.editor.on(this.textRef, 'dblclick', this.onDbClick)
      this.editor.on(this.textRef, 'mouseenter', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseover', this.setHoverOn)
      this.editor.on(this.textRef, 'mouseleave', this.setHoverOff)
      this.editor.subscribe('blur', this.onBlur)
    }
  }

  render() {
    const {
      editor,
      labelModel,
      graphModel: { transformModel },
      model,
    } = this.props
    if (!model) return null
    const {
      properties: { _labelOption },
    } = model
    const { transform } = transformModel.getTransformStyle()
    return (
      <div
        id={`element-container-${labelModel.id}`}
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
          transform: `${transform} rotate(${
            (_labelOption as LabelOption)?.isVertical ? -0.25 : 0
          }turn)`,
          top: `${labelModel.y}px`,
          left: `${labelModel.x}px`,
        }}
      >
        <div
          id={`editor-container-${labelModel.id}`}
          ref={this.setRef}
          style={this.textRefStyle()}
          class="lf-label-editor"
        />
      </div>
    )
  }
}

export default Label
