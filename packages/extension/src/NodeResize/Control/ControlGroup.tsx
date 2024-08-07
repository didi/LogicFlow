import { h, Component } from 'preact';
import { BaseNodeModel, GraphModel } from '@logicflow/core';
import Control from './Control';
import Rect from '../BasicShape/Rect';

interface IProps {
  model: BaseNodeModel,
  graphModel: GraphModel,
}

interface IState {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  dragging: boolean,
}

class ControlGroup extends Component<IProps> {
  constructor() {
    super();
    this.state = {};
  }
  getResizeControl() {
    const {
      model,
      graphModel,
    } = this.props;
    const { x, y, width, height } = model;
    const box = {
      minX: x - width / 2,
      minY: y - height / 2,
      maxX: x + width / 2,
      maxY: y + height / 2,
    };
    const { minX, minY, maxX, maxY } = box;
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
    ];
    return controlList.map((control, index) => (
      <Control
        index={index}
        {...control}
        model={model}
        graphModel={graphModel}
      />
    ));
  }
  // 一般节点被选中了会有outline, 先不用这个
  getGroupSolid() {
    const {
      model,
    } = this.props;
    const {
      x,
      y,
      width,
      height,
    } = model;
    const style = model.getResizeOutlineStyle();
    return (
      <Rect
        fill="none"
        {
          ...style
        }
        x={x}
        y={y}
        width={width}
        height={height}
      />
    );
  }
  render() {
    return (
      <g className="lf-resize-control">
        {this.getGroupSolid()}
        {this.getResizeControl()}
      </g>
    );
  }
}

export default ControlGroup;
