import { h, Component } from 'preact';
import { BaseNodeModel, GraphModel } from '@logicflow/core';
import Control from './Control';
import Rect from '../BasicShape/Rect';
import NodeResize from '../index';

interface IProps {
  model: BaseNodeModel,
  graphModel: GraphModel,
}

interface IState {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  draging: boolean,
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
      {
        x: minX,
        y: minY,
      },
      {
        x: maxX,
        y: minY,
      },
      {
        x: maxX,
        y: maxY,
      },
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
      model: {
        x,
        y,
        width,
        height,
      },
    } = this.props;
    const { stroke, strokeWidth, strokeDasharray } = NodeResize.style.outline;
    return (
      <Rect
        fill="none"
        x={x}
        y={y}
        width={width}
        height={height}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
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
