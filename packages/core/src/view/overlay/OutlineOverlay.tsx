import { Component, h } from 'preact';
import { ElementType, ModelType } from '../../constant/constant';
import { LineEdgeModel } from '../../model';
import BezierEdgeModel from '../../model/edge/BezierEdgeModel';
import PolylineEdgeModel from '../../model/edge/PolylineEdgeModel';
import GraphModel from '../../model/GraphModel';
import { poins2PointsList, getBezierPoints, getBBoxOfPoints } from '../../util/edge';
import Rect from '../basic-shape/Rect';
import { observer } from '../..';

type IProps = {
  graphModel: GraphModel;
};

@observer
export default class OutlineOverlay extends Component<IProps> {
  // 节点outline
  getNodeOutline() {
    const { graphModel } = this.props;
    const { selectElements, editConfig: { hoverOutline, nodeSelectedOutline } } = graphModel;
    const nodeOutline = [];
    selectElements.forEach(element => {
      if (element.BaseType === ElementType.NODE) {
        const {
          isHovered,
          isSelected,
          x,
          y,
          width,
          height,
          outlineColor,
          hoverOutlineColor,
          outlineStrokeDashArray,
          hoverOutlineStrokeDashArray,
        } = element;
        if (nodeSelectedOutline || (hoverOutline && isHovered)) {
          const color = isSelected ? outlineColor : hoverOutlineColor;
          const strokeDashArray = isSelected ? outlineStrokeDashArray : hoverOutlineStrokeDashArray;
          nodeOutline.push(
            <Rect
              className="lf-outline-node"
              {...{
                x, y, width: width + 10, height: height + 10,
              }}
              radius={0}
              fill="none"
              stroke={color}
              strokeDasharray={strokeDashArray}
            />,
          );
        }
      }
    });
    return nodeOutline;
  }
  // 边的outline
  getEdgeOutline() {
    const { graphModel: { edges: edgeList, editConfig: { edgeSelectedOutline } } } = this.props;
    const edgeOutline = [];
    for (let i = 0; i < edgeList.length; i++) {
      const edge = edgeList[i];
      if (edge.isSelected && edgeSelectedOutline) {
        if (edge.modelType === ModelType.LINE_EDGE) {
          edgeOutline.push(this.getLineOutline(edge));
        } else if (edge.modelType === ModelType.POLYLINE_EDGE) {
          edgeOutline.push(this.getPolylineOutline(edge as PolylineEdgeModel));
        } else if (edge.modelType === ModelType.BEZIER_EDGE) {
          edgeOutline.push(this.getBezierOutline(edge as BezierEdgeModel));
        }
      }
    }
    return edgeOutline;
  }
  // 直线outline
  getLineOutline(line: LineEdgeModel) {
    const { startPoint, endPoint } = line;
    const x = (startPoint.x + endPoint.x) / 2;
    const y = (startPoint.y + endPoint.y) / 2;
    const width = Math.abs(startPoint.x - endPoint.x) + 10;
    const height = Math.abs(startPoint.y - endPoint.y) + 10;
    const { graphModel } = this.props;
    const { outlineColor, outlineStrokeDashArray } = graphModel.theme.line;
    return (
      <Rect
        className="lf-outline-edge"
        {...{
          x, y, width, height,
        }}
        radius={0}
        fill="none"
        stroke={outlineColor}
        strokeDasharray={outlineStrokeDashArray}
      />
    );
  }
  // 折线outline
  getPolylineOutline(polyline: PolylineEdgeModel) {
    const { points } = polyline;
    const pointsList = poins2PointsList(points);
    const bbox = getBBoxOfPoints(pointsList, 8);
    const {
      x, y, width, height,
    } = bbox;
    const { graphModel } = this.props;
    const { outlineColor, outlineStrokeDashArray } = graphModel.theme.polyline;
    return (
      <Rect
        className="lf-outline"
        {...{
          x, y, width, height,
        }}
        radius={0}
        fill="none"
        stroke={outlineColor}
        strokeDasharray={outlineStrokeDashArray}
      />
    );
  }
  // 曲线outline
  getBezierOutline(bezier: BezierEdgeModel) {
    const { path } = bezier;
    const pointsList = getBezierPoints(path);
    const bbox = getBBoxOfPoints(pointsList, 8);
    const {
      x, y, width, height,
    } = bbox;
    const { graphModel } = this.props;
    const { outlineColor, outlineStrokeDashArray } = graphModel.theme.bezier;
    return (
      <Rect
        className="lf-outline"
        {...{
          x, y, width, height,
        }}
        radius={0}
        fill="none"
        stroke={outlineColor}
        strokeDasharray={outlineStrokeDashArray}
      />
    );
  }

  render() {
    return (
      <g className="lf-outline">
        {this.getNodeOutline()}
        {this.getEdgeOutline()}
      </g>
    );
  }
}
