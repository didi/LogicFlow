import { Component, h } from 'preact';
import { ElementType, ModelType } from '../../constant/constant';
import { BaseNodeModel, LineEdgeModel } from '../../model';
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
  getNodesOutline() {
    const { graphModel } = this.props;
    const { nodes, editConfig: { hoverOutline, nodeSelectedOutline } } = graphModel;
    const nodeOutline = [];
    nodes.forEach(element => {
      if (element.isHovered || element.isSelected) {
        const {
          isHovered,
          // isSelected,
          x,
          y,
          width,
          height,
          hideOutline,
        } = element;
        if (!hideOutline && (nodeSelectedOutline || (hoverOutline && isHovered))) {
          const style = (element as BaseNodeModel).getOutlineStyle();
          let attributes = {};
          Object.keys(style).forEach((key) => {
            if (key !== 'hover') {
              attributes[key] = style[key];
            }
          });
          if (isHovered) {
            const hoverStyle = style.hover;
            attributes = {
              ...attributes,
              ...hoverStyle,
            };
          }
          nodeOutline.push(
            <Rect
              className="lf-outline-node"
              {...{
                x, y, width: width + 10, height: height + 10,
              }}
              {
                ...attributes
              }
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
      if (!edge.hideOutline && edge.isSelected && edgeSelectedOutline) {
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
    const style = line.getOutlineStyle();
    return (
      <Rect
        className="lf-outline-edge"
        {...{
          x, y, width, height,
        }}
        {
          ...style
        }
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
    const style = polyline.getOutlineStyle();
    return (
      <Rect
        className="lf-outline"
        {...{
          x, y, width, height,
        }}
        {
          ...style
        }
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
    const style = bezier.getOutlineStyle();
    return (
      <Rect
        className="lf-outline"
        {...{
          x, y, width, height,
        }}
        {
          ...style
        }
      />
    );
  }

  render() {
    return (
      <g className="lf-outline">
        {this.getNodesOutline()}
        {this.getEdgeOutline()}
      </g>
    );
  }
}
