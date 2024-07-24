import {
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

export interface ILabelProps {
  label: LabelModel
  element: BaseNodeModel | BaseEdgeModel
  graphModel: GraphModel
}

export interface ILabelState {}

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
      step: gridSize,
      eventType: 'LABEL',
      model: label,
      eventCenter,
    })
  }

  setHoverOn = () => {
    const { label, element } = this.props
    if (label.isHovered) return

    label.isHovered = true
    element.setHovered(true)
  }
  setHoverOff = () => {
    const { label, element } = this.props
    if (!label.isHovered) return

    label.isHovered = false
    element.setHovered(false)
  }

  handleMouseDown = (e: MouseEvent) => {
    const { label, graphModel } = this.props
    const {
      editConfigModel: { nodeTextDraggable },
    } = graphModel

    // 当 label 允许拖拽时，基于 StepDrag 开启拖拽
    console.log('label.draggable --->>>', label.draggable)
    if (label.draggable ?? nodeTextDraggable) {
      this.stepDrag.handleMouseDown(e)
    }
  }
  handleDragging = ({ deltaX, deltaY }: IDragParams) => {
    console.log('zzZ')
    const {
      label,
      //graphModel
      //
    } = this.props
    // const { transformModel } = graphModel
    // const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)

    // TODO：触发 LABEL:DRAG 事件，并抛出相关的数据
    label.moveLabel(deltaX, deltaY)
    // eventCenter.emit('label:drag', {
    //   data: label.getData(),
    //   e: event,
    //   model: element,
    // })
  }

  handleDbClick = (e: MouseEvent) => {
    const { label, element, graphModel } = this.props
    label.draggable = false
    element.setSelected()
    element.setElementState(ElementState.TEXT_EDIT)
    label.isEditing = true

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
  handleBlur = (e: FocusEvent) => {
    const { label } = this.props
    label.isEditing = false

    // TODO: 1. 触发 LABEL:BLUR 事件，并抛出相关的数据
    console.log('e', e)
    // TODO: 2. 调用 LabelModel 的方法保存 label 的数据
    console.log('this.textRef.current --->>>', this.textRef.current)

    const text = this.textRef.current?.innerText ?? ''
    const content = this.textRef.current?.innerHTML ?? ''
    label.updateLabel(text, content)

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
    const {
      label,
      element,
      graphModel: { eventCenter },
    } = this.props

    eventCenter.on('blank:click', () => {
      if (label.isEditing) {
        label.isEditing = false
      }
    })

    eventCenter.on('node:drag', ({ e, data }) => {
      if (data.id === element.id) {
        console.log('data --->>>', data)
        console.log('e --->>>', e)

        console.log('label.x', label.x)
        console.log('label.x', label.y)
      }
    })

    // TODO: 节点拖拽结束后，更新 Label 的位置
    eventCenter.on('node:drop', () => {})

    eventCenter.on('node:mousemove', ({ e, data }) => {
      if (data.id === element.id) {
        console.log('element label mouse move', element.getData())
        console.log('e -->>>', e)
        console.log('data -->>>', data)
        // TODO：在这个事件中，重新计算 Label 的位置
      }
    })
  }

  render() {
    const { label, graphModel } = this.props
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
        className="lf-label-editor-container"
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
            'lf-label-editor-editing': label.isEditing,
          })}
        >
          {label.content}
        </div>
      </div>
    )
  }
}

export default Label
