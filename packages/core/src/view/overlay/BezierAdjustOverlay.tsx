import { observer } from 'mobx-react';
import { Component, h } from 'preact';
import { ModelType } from '../../constant/constant';
import BezierEdgeModel from '../../model/edge/BezierEdgeModel';
import GraphModel from '../../model/GraphModel';
import { Point } from '../../type';
import { createDrag } from '../../util/drag';
import { getBezierPoints } from '../../util/edge';
import Circle from '../basic-shape/Circle';
import Line from '../basic-shape/Line';

type IProps = {
  graphModel: GraphModel;
};

type IAnchorProps = {
  position: Point;
  bezierModel: BezierEdgeModel;
  graphModel: GraphModel;
  type: string;
};

type IState = {
  endX: number;
  endY: number;
};

// bezier曲线的可调整锚点
class BezierAdjustAnchor extends Component<IAnchorProps, IState> {
  dragHandler: Function;
  constructor(props) {
    super();
    this.dragHandler = createDrag({
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
    });
    const { position } = props;
    this.state = {
      endX: position.x,
      endY: position.y,
    };
  }
  onDraging = ({ deltaX, deltaY }) => {
    const { graphModel, bezierModel, type } = this.props;
    const { transformMatrix } = graphModel;
    const { endX, endY } = this.state;
    const [x, y] = transformMatrix.moveCanvasPointByHtml(
      [endX, endY],
      deltaX,
      deltaY,
    );
    this.setState({ endX: x, endY: y });
    bezierModel.updateAdjustAnchor({ x, y }, type);
  };
  onDragEnd = (() => {
    const { endX, endY } = this.state;
    const { bezierModel, type } = this.props;
    bezierModel.updateAdjustAnchor({ x: endX, y: endY }, type);
  });
  render() {
    const { position } = this.props;
    const { x, y } = position;
    const {
      adjustAnchorStroke,
      adjustAnchorFill,
      adjustAnchorFillOpacity,
    } = this.props?.graphModel?.theme?.bezier;
    return (
      <Circle
        className="lf-bezier-adjust-anchor"
        x={x}
        y={y}
        r={4}
        stroke={adjustAnchorStroke}
        fill={adjustAnchorFill}
        fillOpacity={adjustAnchorFillOpacity}
        onMouseDown={this.dragHandler}
      />
    );
  }
}

@observer
export default class BezierAdjustOverlay extends Component<IProps> {
  getBezierAdjust(bezier: BezierEdgeModel, graphModel: GraphModel) {
    const { path } = bezier;
    const pointsList = getBezierPoints(path);
    const [start, sNext, ePre, end] = pointsList;
    const { adjustLineColor } = graphModel.theme.bezier;
    const result = [];
    result.push(<Line
      x1={start.x}
      y1={start.y}
      x2={sNext.x}
      y2={sNext.y}
      stroke={adjustLineColor}
    />);
    result.push(<BezierAdjustAnchor
      position={sNext}
      bezierModel={bezier}
      graphModel={graphModel}
      type="sNext"
    />);
    result.push(<Line
      x1={end.x}
      y1={end.y}
      x2={ePre.x}
      y2={ePre.y}
      stroke={adjustLineColor}
    />);
    result.push(<BezierAdjustAnchor
      position={ePre}
      bezierModel={bezier}
      graphModel={graphModel}
      type="ePre"
    />);
    return result;
  }
  // 获取选中bezier曲线，调整操作线和锚点
  selectedBezierEdge() {
    const { graphModel } = this.props;
    const edgeList = graphModel.edges;
    const edgeAdjust = [];
    for (let i = 0; i < edgeList.length; i++) {
      const edge = edgeList[i];
      if (edge.isSelected && edge.modelType === ModelType.BEZIER_EDGE && edge.draggable) {
        edgeAdjust.push(this.getBezierAdjust(edge as BezierEdgeModel, graphModel));
      }
    }
    return edgeAdjust;
  }
  render() {
    return (
      <g className="lf-bezier-adjust">
        {this.selectedBezierEdge()}
      </g>
    );
  }
}
