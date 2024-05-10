import { h, Component, Rect, BaseNodeModel, GraphModel } from '@logicflow/core'
import Control from './Control'
import { GroupNodeModel } from '../../materials/group'

interface IControlGroupProps {
  model: BaseNodeModel
  graphModel: GraphModel
}

class ControlGroup extends Component<IControlGroupProps> {
  constructor() {
    super()
    this.state = {}
  }

  getResizeControl(): h.JSX.Element[] {
    const { model, graphModel } = this.props
    const { x, y, width, height } = model
    const box = {
      minX: x - width / 2,
      minY: y - height / 2,
      maxX: x + width / 2,
      maxY: y + height / 2,
    }
    const { minX, minY, maxX, maxY } = box
    const controlList = [
      // 左上角
      {
        x: minX,
        y: minY,
      },
      // 右上角
      {
        x: maxX,
        y: minY,
      },
      // 右下角
      {
        x: maxX,
        y: maxY,
      },
      // 左下角
      {
        x: minX,
        y: maxY,
      },
    ]
    return controlList.map((control, index) => (
      <Control
        index={index}
        {...control}
        model={model}
        graphModel={graphModel}
      />
    ))
  }

  // 一般节点被选中了会有outline, 先不用这个
  getGroupSolid() {
    const { model } = this.props
    const { x, y, width, height } = model
    const style = (model as GroupNodeModel).getResizeOutlineStyle()
    return <Rect {...style} x={x} y={y} width={width} height={height} />
  }

  render(): h.JSX.Element {
    return (
      <g className="lf-resize-control">
        {this.getGroupSolid()}
        {this.getResizeControl()}
      </g>
    )
  }
}

export default ControlGroup
