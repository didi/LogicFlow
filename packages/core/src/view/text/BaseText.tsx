import classNames from 'classnames'
import { createElement as h, Component } from 'preact/compat'
import { ElementState, EventType } from '../../constant'
import { GraphModel, BaseNodeModel, BaseEdgeModel } from '../../model'
import { Text } from '../shape'
import { IDragParams, StepDrag } from '../../util'

export type IBaseTextProps = {
  model: BaseNodeModel | BaseEdgeModel
  graphModel: GraphModel
  draggable: boolean
  editable: boolean
}

export type IBaseTextState = {
  isHovered: boolean
}

export class BaseText<
  P extends IBaseTextProps,
  S extends IBaseTextState,
> extends Component<P, S> {
  stepperDrag: StepDrag

  constructor(props: P) {
    super()
    const { draggable } = props
    // TODO: 确认为什么不在 new 的时候传入 model，而在下面使用的时候赋值
    this.stepperDrag = new StepDrag({
      onDragging: this.onDragging,
      step: 1,
      // model,
      eventType: 'TEXT',
      isStopPropagation: draggable,
    })
  }

  getShape(): h.JSX.Element | null {
    const { model, graphModel } = this.props
    const { editConfigModel } = graphModel
    const {
      text: { value, x, y, editable, draggable },
    } = model
    const attr = {
      x,
      y,
      className: '',
      value,
    }
    // DONE: 代码优化，看是否可以引入 classnames
    // TODO: 确认下面逻辑是否正确，确认正确后删除下面注释
    // if (editable) {
    //   attr.className = 'lf-element-text';
    // } else if (draggable || editConfigModel.nodeTextDraggable) {
    //   attr.className = 'lf-text-draggable';
    // } else {
    //   attr.className = 'lf-text-disabled';
    // }
    const style = model.getTextStyle()
    const isDraggable = editConfigModel.nodeTextDraggable || draggable

    return (
      <Text
        {...attr}
        {...style}
        className={classNames({
          'lf-element-text': editable,
          'lf-text-draggable': !editable && isDraggable,
          'lf-text-disabled': !editable && !isDraggable,
        })}
        model={model}
      />
    )
  }

  mouseDownHandler = (e: MouseEvent) => {
    const { draggable, model, graphModel } = this.props
    const {
      editConfigModel: { nodeTextDraggable },
    } = graphModel

    if (draggable ?? nodeTextDraggable) {
      e.stopPropagation()
      this.stepperDrag.model = model
      this.stepperDrag.handleMouseDown(e)
    }
  }

  onDragging = ({ deltaX, deltaY }: IDragParams) => {
    const {
      model,
      graphModel: { transformModel },
    } = this.props

    if (deltaX || deltaY) {
      const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY)
      model.moveText(curDeltaX, curDeltaY)
    }
  }

  dbClickHandler = () => {
    // 静默模式下，双击不更改状态，不可编辑
    const {
      editable,
      graphModel: { eventCenter },
      model,
    } = this.props
    if (editable) {
      model.setElementState(ElementState.TEXT_EDIT)
    }
    eventCenter.emit(EventType.TEXT_DBCLICK, {
      data: model.text,
      model,
    })
  }

  render(): h.JSX.Element | undefined {
    const {
      model: { text },
    } = this.props
    if (text) {
      return (
        <g onMouseDown={this.mouseDownHandler} onDblClick={this.dbClickHandler}>
          {this.getShape()}
        </g>
      )
    }
  }
}

export default BaseText
