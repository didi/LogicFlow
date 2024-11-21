import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  Component,
  createRef,
  ElementState,
  GraphModel,
  IDragParams,
  observer,
  StepDrag,
} from '@logicflow/core'
import classNames from 'classnames'
import LabelModel from './LabelModel'
import { findIndex } from 'lodash-es'

import LabelConfig = LogicFlow.LabelConfig

export interface ILabelProps {
  label: LabelModel
  element: BaseNodeModel | BaseEdgeModel
  graphModel: GraphModel
}

export interface ILabelState {
  isEditing: boolean
  isHovered: boolean
  isDragging: boolean
}

@observer
export class Label extends Component<ILabelProps, ILabelState> {
  textRef = createRef<HTMLDivElement>()
  stepDrag: StepDrag

  constructor(props: ILabelProps) {
    super(props)
    const {
      label,
      graphModel: { gridSize, eventCenter },
    } = props

    this.stepDrag = new StepDrag({
      onDragging: this.handleDragging,
      onDragEnd: this.handleDragEnd,
      step: gridSize,
      eventType: 'LABEL',
      model: label,
      eventCenter,
    })

    this.state = {
      isEditing: false,
      isHovered: false,
      isDragging: false,
    }
  }

  setHoverOn = () => {
    const { element } = this.props
    if (element.isDragging || this.state.isHovered) return // 当节点或边在拖拽中时，不触发 hover 态

    this.setState({ isHovered: true })
    element.setHovered(true)
  }
  setHoverOff = () => {
    const { element } = this.props
    if (!this.state.isHovered) return

    this.setState({ isHovered: false })
    element.setHovered(false)
  }

  handleMouseDown = (e: MouseEvent) => {
    const { label, graphModel } = this.props
    const {
      editConfigModel: { nodeTextDraggable },
    } = graphModel
    // 当 label 允许拖拽 且不处于拖拽状态时， StepDrag 开启拖拽
    if ((label.draggable ?? nodeTextDraggable) && !this.state.isDragging) {
      this.stepDrag.handleMouseDown(e)
    }
  }
  handleMouseUp = (e: MouseEvent) => {
    if (this.state.isDragging) {
      this.stepDrag.handleMouseUp(e)
    }
  }
  handleDragging = ({ deltaX, deltaY }: IDragParams) => {
    if (!this.state.isDragging) {
      this.setState({ isDragging: true })
    }
    const { label, element, graphModel } = this.props

    // DONE: 添加缩放时拖拽的逻辑，对 deltaX 和 deltaY 进行按比例缩放
    const { transformModel } = graphModel
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)

    // DONE：更新 label 位置，触发 LABEL:DRAG 事件，并抛出相关的数据
    const {
      properties: { _label },
    } = element
    const elementLabel = _label as LabelConfig[]
    const idx = findIndex(elementLabel, (cur) => cur.id === label.id)

    const target = elementLabel[idx]
    elementLabel[idx] = {
      ...target,
      x: target.x + curDeltaX,
      y: target.y + curDeltaY,
    }
    const targetElem = graphModel.getElement(element.id)
    targetElem?.setProperty('_label', elementLabel)

    graphModel.eventCenter.emit('label:drag', {
      data: label.getData(),
      model: label,
    })
  }
  handleDragEnd = () => {
    this.setState({ isDragging: false })
  }

  handleDbClick = (e: MouseEvent) => {
    const { label, element, graphModel } = this.props
    graphModel.eventCenter.emit('label:dblclick', {
      data: label.getData(),
      e,
      model: element,
    })

    if (!label.editable) {
      element.setSelected(true)
      return
    }
    element.setSelected()
    element.setElementState(ElementState.TEXT_EDIT)

    this.setState({ isEditing: true })

    // DONE: 触发当前 label 的 focus 事件，设置内容可编辑，且在文本最后添加光标
    if (this.textRef.current) {
      this.textRef.current.contentEditable = 'true'
      this.textRef.current.focus()

      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(this.textRef.current)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }
  handleBlur = (e: FocusEvent) => {
    const {
      label,
      element,
      graphModel: { eventCenter },
    } = this.props

    // DONE: 触发 LABEL:BLUR 事件，并抛出相关的事件
    eventCenter.emit('label:blur', {
      e,
      model: element,
      data: label.getData(),
      element: this.textRef.current,
    })

    this.setState({
      isDragging: false,
      isHovered: false,
    })
  }

  // 重新计算 Label 大小
  reCalcLabelSize = () => {}

  // TODO：如何处理 Label zIndex 的问题, Label 永远会比节点层级高
  // 当 Label 被元素遮盖时，隐藏它

  componentDidMount() {
    const { label, element, graphModel } = this.props

    // 在点击元素、边或者画布 时，结束 Label 的编辑态
    graphModel.eventCenter.on('blank:click,node:click,edge:click', () => {
      // 如果当前 label 处于编辑态，则结束编辑态
      if (this.state.isEditing) {
        this.setState({ isEditing: false })

        const value = this.textRef.current?.innerText ?? ''
        const content = this.textRef.current?.innerHTML ?? ''

        const {
          properties: { _label },
        } = element
        const elementLabel = _label as LabelConfig[]
        const idx = findIndex(elementLabel, (cur) => cur.id === label.id)

        const target = elementLabel[idx]
        elementLabel[idx] = {
          ...target,
          value,
          content,
        }

        const targetElem = graphModel.getElement(element.id)
        targetElem?.setProperty('_label', elementLabel)

        element.setElementState(ElementState.DEFAULT)
      }
      if (this.textRef.current) {
        this.textRef.current.contentEditable = 'false'
      }
    })

    // TODO: 节点拖拽结束后，更新 Label 的位置
    // eventCenter.on('node:drag', () => {})
    // eventCenter.on('node:drop', () => {})
    // eventCenter.on('node:mousemove', () => {})
    //
    // eventCenter.on('node:properties-change,node:properties-delete', () => {})
  }

  componentDidUpdate() {
    // snapshot: any, // previousState: Readonly<ILabelState>, // previousProps: Readonly<ILabelProps>,
    console.log('Label componentDidUpdate')
    // console.log('previousProps', previousProps)
    // console.log('previousState', previousState)
    // console.log('snapshot', snapshot)
  }

  componentWillUnmount() {
    const { graphModel } = this.props
    graphModel.eventCenter.off('blank:click,node:click,edge:click')
  }

  // TODO: 当某一个标签更新时，如何避免其它标签的更新
  // shouldComponentUpdate or memo

  render() {
    const { label, element, graphModel } = this.props
    const { isDragging, isHovered, isEditing } = this.state
    const { transformModel } = graphModel
    const { transform } = transformModel.getTransformStyle()
    const {
      id,
      x,
      y,
      zIndex,
      vertical,
      style,
      rotate,
      content,
      labelWidth,
      textOverflowMode,
    } = label

    const maxLabelWidth: number =
      labelWidth ?? (element.BaseType === 'node' ? element.width - 20 : 80)
    const containerStyle = {
      left: `${x - maxLabelWidth / 2}px`,
      top: `${y - 10}px`,
      width: `${maxLabelWidth}px`,
      height: '20px',
      zIndex: zIndex ?? 1,
      transform: rotate
        ? `${transform} rotate(${rotate}deg)`
        : `${transform} rotate(${vertical ? -0.25 : 0}turn)`,
    }

    return (
      <div
        id={`element-container-${id}`}
        className={classNames('lf-label-editor-container')}
        style={containerStyle}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onDblClick={this.handleDbClick}
        onBlur={this.handleBlur}
        onMouseEnter={this.setHoverOn}
        onMouseOver={this.setHoverOn}
        onMouseLeave={this.setHoverOff}
      >
        <div
          ref={this.textRef}
          id={`editor-container-${id}`}
          className={classNames('lf-label-editor', {
            'lf-label-editor-dragging': isDragging,
            'lf-label-editor-editing': isEditing,
            'lf-label-editor-hover': !isEditing && isHovered,
            [`lf-label-editor-${textOverflowMode}`]: !isEditing,
          })}
          style={{
            maxWidth: `${maxLabelWidth}px`,
            boxSizing: 'border-box',
            display: 'inline-block',
            background:
              isEditing || element.BaseType === 'edge' ? '#fff' : 'transparent',
            ...style,
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
      </div>
    )
  }
}

export default Label
