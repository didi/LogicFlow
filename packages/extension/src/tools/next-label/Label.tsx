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
      this.setState({ isDragging: true })
      this.stepDrag.handleMouseDown(e)
    }
  }
  handleDragging = ({ deltaX, deltaY }: IDragParams) => {
    const { label, element, graphModel } = this.props

    // TODO: 添加缩放时拖拽的逻辑，对 deltaX 和 deltaY 进行按比例缩放
    // const { transformModel } = graphModel
    // const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)

    // TODO：更新 label 位置，触发 LABEL:DRAG 事件，并抛出相关的数据
    const {
      properties: { _label },
    } = element
    const elementLabel = _label as LabelConfig[]
    const idx = findIndex(elementLabel, (cur) => cur.id === label.id)

    const target = elementLabel[idx]
    elementLabel[idx] = {
      ...target,
      x: target.x + deltaX,
      y: target.y + deltaY,
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

    graphModel.eventCenter.emit('label:dblclick', {
      data: label.getData(),
      e,
      model: element,
    })
  }
  handleBlur = () => {
    this.setState({
      isDragging: false,
      isHovered: false,
      isEditing: false,
    })
    // TODO: 1. 触发 LABEL:BLUR 事件，并抛出相关的事件

    // TODO: 2. 调用 LabelModel 的方法保存 label 的数据
    // const text = this.textRef.current?.innerText ?? ''
    // const content = this.textRef.current?.innerHTML ?? ''
    // label.updateLabel(text, content)

    // REMIND: 还原 contentEditable 属性，直接通过 JSX 的方式配置属性不得行，不会自动出现光标
    // if (this.textRef.current) {
    //   this.textRef.current.contentEditable = 'false'
    // }
  }

  // 重新计算 Label 大小
  reCaleLabelSize = () => {}

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

        console.log('elementLabel[idx]', elementLabel[idx])
        const targetElem = graphModel.getElement(element.id)
        targetElem?.setProperty('_label', elementLabel)
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

  render() {
    const { label, graphModel } = this.props
    const { isDragging, isHovered, isEditing } = this.state
    const { transformModel } = graphModel
    const { transform } = transformModel.getTransformStyle()

    const containerStyle = {
      left: `${label.x - 10}px`,
      top: `${label.y - 10}px`,
      width: '20px',
      height: '20px',
      transform: `${transform} rotate(${label.vertical ? -0.25 : 0}turn)`,
    }

    return (
      <div
        id={`element-container-${label.id}`}
        className={classNames('lf-label-editor-container')}
        style={containerStyle}
        onMouseDown={this.handleMouseDown}
        onDblClick={this.handleDbClick}
        onBlur={this.handleBlur}
        onMouseEnter={this.setHoverOn}
        onMouseOver={this.setHoverOn}
        onMouseLeave={this.setHoverOff}
      >
        <div
          ref={this.textRef}
          id={`editor-container-${label.id}`}
          className={classNames('lf-label-editor', {
            'lf-label-editor-dragging': isDragging,
            'lf-label-editor-editing': isEditing,
            'lf-label-editor-hover': !isEditing && isHovered,
          })}
          style={label.style}
          dangerouslySetInnerHTML={{ __html: label.content }}
        ></div>
      </div>
    )
  }
}

export default Label
