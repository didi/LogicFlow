import { h, Component } from 'preact';
import { BaseNodeModel, GraphModel, LogicFlowUtil } from '@logicflow/core';
import Rect from './Rect';
import { getRectReizeEdgePoint } from './Util';

const { createDrag } = LogicFlowUtil;

type TargetNodeId = string;

interface IProps {
  index: number,
  x: number,
  y: number,
  nodeModel: BaseNodeModel,
  graphModel: GraphModel,
  style?: CSSStyleDeclaration,
  hoverStyle?: CSSStyleDeclaration,
  edgeStyle?: CSSStyleDeclaration,
}

interface IState {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  draging: boolean,
}
class Control extends Component<IProps> {
  dragHandler: Function;
  index: number;
  nodeModel: BaseNodeModel;
  graphModel: GraphModel;
  constructor(props) {
    super();
    this.index = props.index;
    this.nodeModel = props.nodeModel;
    this.graphModel = props.graphModel;
    this.state = {};
    this.dragHandler = createDrag({
      onDragStart: this.onDragStart,
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
    });
  }
  onDragStart = () => {
    console.log(this.nodeModel);
  };
  getNodeEdges(nodeId) {
    const { graphModel } = this;
    const { edges } = graphModel;
    const sourceEdges = [];
    const targetEdges = [];
    for (let i = 0; i < edges.length; i++) {
      const edgeModel = edges[i];
      if (edgeModel.sourceNodeId === nodeId) {
        sourceEdges.push(edgeModel);
      } else if (edges[i].targetNodeId === nodeId) {
        targetEdges.push(edgeModel);
      }
    }
    return { sourceEdges, targetEdges };
  }
  onDraging = ({ deltaX, deltaY }) => {
    console.log(deltaX, deltaY);
    const { id, x, y, width, height } = this.nodeModel;
    const { index } = this;

    this.nodeModel.x = x + deltaX / 2;
    this.nodeModel.y = y + deltaY / 2;
    this.nodeModel.moveText(deltaX / 2, deltaY / 2);
    const size = {
      width,
      height,
    };
    switch (index) {
      case 0:
        size.width = width - deltaX;
        size.height = height - deltaY;
        break;
      case 1:
        size.width = width + deltaX;
        size.height = height - deltaY;
        break;
      case 2:
        size.width = width + deltaX;
        size.height = height + deltaY;
        break;
      case 3:
        size.width = width - deltaX;
        size.height = height + deltaY;
        break;
      default:
        break;
    }
    // todo 限制放大缩小的最大最小范围
    this.nodeModel.width = size.width;
    this.nodeModel.height = size.height;

    const edges = this.getNodeEdges(id);
    const { props } = this;
    const params = {
      control: {
        x: props.x,
        y: props.y,
      },
      point: '',
      deltaY,
      deltaX,
      width,
      height,
    };
    edges.sourceEdges.forEach(item => {
      params.point = item.startPoint;
      const afterPoint = getRectReizeEdgePoint(params);
      item.updateStartPoint(afterPoint);
    });
    edges.targetEdges.forEach(item => {
      params.point = item.endPoint;
      const afterPoint = getRectReizeEdgePoint(params);
      item.updateEndPoint(afterPoint);
    });
  };
  onDragEnd = () => {
    this.checkEnd();
  };

  checkEnd = () => {
  };
  render() {
    const {
      x, y, style,
    } = this.props;
    return (
      <g className="lf-resize-control">
        <Rect
          className="lf-node-control"
          {...{ x, y }}
          {...style}
          width={7}
          height={7}
          stroke="#000000"
          onMouseDown={this.dragHandler}
        />
      </g>
    );
  }
}

export default Control;
