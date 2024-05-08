import { Component, h } from 'preact'
import { Text } from '../shape'
import { StepDrag } from '../../util'
import { ElementState } from '../../constant'
import { GraphModel, Model } from '../../model'

type IProps = {
  model: Model.BaseModel
  graphModel: GraphModel
  draggable: boolean
  editable: boolean
}
type IState = {
  isHovered: boolean
}

export class BaseText extends Component<IProps, IState> {
  stepDrag: StepDrag

  constructor(config) {
    super()
    const { draggable } = config
    this.stepDrag = new StepDrag({
      onDragging: this.onDragging,
      step: 1,
      isStopPropagation: draggable,
    })
  }

  getShape(): h.JSX.Element | null {
    const { model, graphModel } = this.props
    const { text } = model
    const { editConfigModel } = graphModel
    const { value, x, y, editable, draggable } = text
    const attr = {
      x,
      y,
      className: '',
      value,
    }
    if (editable) {
      attr.className = 'lf-element-text'
    } else if (draggable || editConfigModel.nodeTextDraggable) {
      attr.className = 'lf-text-draggable'
    } else {
      attr.className = 'lf-text-disabled'
    }
    const style = model.getTextStyle()
    return <Text {...attr} {...style} model={model} />
  }

  onDragging = ({ deltaX, deltaY }) => {
    const {
      model,
      graphModel: { transformModel },
    } = this.props
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)
    model.moveText(curDeltaX, curDeltaY)
  }
  dblClickHandler = () => {
    // 静默模式下，双击不更改状态，不可编辑
    const { editable } = this.props
    if (editable) {
      const { model } = this.props
      model.setElementState(ElementState.TEXT_EDIT)
    }
  }
  mouseDownHandle = (ev: MouseEvent) => {
    const {
      draggable,
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

  render() {
    const {
      model: { text },
    } = this.props
    if (text) {
      return (
        <g onMouseDown={this.mouseDownHandle} onDblClick={this.dblClickHandler}>
          {this.getShape()}
        </g>
      )
    }
  }
}

export default BaseText
