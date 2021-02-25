import { ModelType } from '../constant/constant';
import PolylineEdgeModel from '../model/edge/PolylineEdgeModel';
import BezierEdgeModel from '../model/edge/BezierEdgeModel';
import { poins2PointsList, getBBoxOfPoints, getBezierPoints } from '../util/edge';

// 获取节点的out
export const getNodeOutline = ({
  x, y, width, height,
}) => ({
  x: x - width / 2,
  y: y - height / 2,
  x1: x + width / 2,
  y1: y + height / 2,
});

export const getLineOutline = (edge) => {
  const { startPoint, endPoint } = edge;
  const x = (startPoint.x + endPoint.x) / 2;
  const y = (startPoint.y + endPoint.y) / 2;
  const width = Math.abs(startPoint.x - endPoint.x) + 10;
  const height = Math.abs(startPoint.y - endPoint.y) + 10;
  return {
    x: x - width / 2,
    y: y - height / 2,
    x1: x + width / 2,
    y1: y + height / 2,
  };
};

export const getPolylineOutline = (edge) => {
  const { points } = edge;
  const pointsList = poins2PointsList(points);
  const bbox = getBBoxOfPoints(pointsList, 8);
  const {
    x, y, width, height,
  } = bbox;
  return {
    x: x - width / 2,
    y: y - height / 2,
    x1: x + width / 2,
    y1: y + height / 2,
  };
};

export const getBezierOutline = (edge) => {
  const { path } = edge;
  const pointsList = getBezierPoints(path);
  const bbox = getBBoxOfPoints(pointsList, 8);
  const {
    x, y, width, height,
  } = bbox;
  return {
    x: x - width / 2,
    y: y - height / 2,
    x1: x + width / 2,
    y1: y + height / 2,
  };
};

export const getEdgeOutline = (edge) => {
  if (edge.modelType === ModelType.LINE_EDGE) {
    return getLineOutline(edge);
  }
  if (edge.modelType === ModelType.POLYLINE_EDGE) {
    return getPolylineOutline(edge as PolylineEdgeModel);
  }
  if (edge.modelType === ModelType.BEZIER_EDGE) {
    return getBezierOutline(edge as BezierEdgeModel);
  }
};
