import { pick } from 'lodash-es';
import BaseNode from '../model/node/BaseNodeModel';
import CircleNode from '../model/node/CircleNodeModel';
import RectNode from '../model/node/RectNodeModel';
import EllipseNode from '../model/node/EllipseNodeModel';
import PolygonNode from '../model/node/PolygonNodeModel';
import {
  Point,
  Direction,
  NodeConfig,
} from '../type';
import { isInSegment } from '../algorithm/edge';
import { SegmentDirection } from '../constant/constant';

/* 获取所有锚点 */
export const getAnchors = (data): Point[] => {
  const {
    anchors,
  } = data;
  return anchors;
};

type NodeContaint = {
  node: BaseNode;
  anchorIndex: number;
  anchorPosition: Point;
};

/* 手动连线时获取目标节点的信息：目标节点，目标节点的锚点index以及坐标 */
export const targetNodeInfo = (position: Point, nodes:BaseNode[]): NodeContaint => {
  let nodeInfo;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const inNode = isInNodeBbox(position, nodes[i]);
    if (inNode) {
      const anchorInfo = getClosestAnchor(position, nodes[i]);
      if (anchorInfo) { // 不能连接到没有锚点的节点
        const currentNodeInfo = {
          node: nodes[i],
          anchorIndex: anchorInfo.index,
          anchorPosition: anchorInfo.anchor,
        };
        nodeInfo = currentNodeInfo;
        break;
      }
    }
  }
  return nodeInfo;
};

type AnchorInfo = {
  index: number,
  anchor: Point,
};
/* 手动连线时获取目标节点上，距离目标位置最近的锚点 */
const getClosestAnchor = (position: Point, node: BaseNode): AnchorInfo => {
  const anchors = getAnchors(node);
  let closest;
  let minDistance = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < anchors.length; i++) {
    const len = distance(position.x, position.y, anchors[i].x, anchors[i].y);
    if (len < minDistance) {
      minDistance = len;
      closest = {
        index: i,
        anchor: {
          x: anchors[i].x,
          y: anchors[i].y,
        },
      };
    }
  }
  return closest;
};

/* 两点之间距离 */
export const distance = (
  x1: number, y1: number, x2: number, y2: number,
): number => Math.hypot(x1 - x2, y1 - y2);

/* 是否在某个节点内，手否进行连接，有offset控制粒度，与outline有关，可以优化 */
export const isInNode = (position: Point, node: BaseNode): boolean => {
  let inNode = false;
  const offset = 0;
  const bBox = getNodeBBox(node);
  if (position.x >= bBox.minX - offset
    && position.x <= bBox.maxX + offset
    && position.y >= bBox.minY - offset
    && position.y <= bBox.maxY + offset) {
    inNode = true;
  }
  return inNode;
};
export const isInNodeBbox = (position: Point, node): boolean => {
  let inNode = false;
  const offset = 5;
  const bBox = getNodeBBox(node);
  if (position.x >= bBox.minX - offset
    && position.x <= bBox.maxX + offset
    && position.y >= bBox.minY - offset
    && position.y <= bBox.maxY + offset) {
    inNode = true;
  }
  return inNode;
};

export type NodeBBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
};

/* 获取节点bbox */
export const getNodeBBox = (node: BaseNode): NodeBBox => {
  const {
    x,
    y,
    width,
    height,
  } = node;
  const bBox = {
    minX: x - width / 2,
    minY: y - height / 2,
    maxX: x + width / 2,
    maxY: y + height / 2,
    x,
    y,
    width,
    height,
    centerX: x,
    centerY: y,
  };
  return bBox;
};
type RadiusCircle = {
  x: number,
  y: number,
  r: number,
};
export const getRectRadiusCircle = (node: BaseNode): RadiusCircle[] => {
  const {
    x, y, width, height, radius,
  } = node as RectNode;
  const radiusCenter = [
    {
      x: x - width / 2 + radius,
      y: y - height / 2 + radius,
      r: radius,
    },
    {
      x: x + width / 2 - radius,
      y: y - height / 2 + radius,
      r: radius,
    },
    {
      x: x - width / 2 + radius,
      y: y + height / 2 - radius,
      r: radius,
    },
    {
      x: x + width / 2 - radius,
      y: y + height / 2 - radius,
      r: radius,
    },
  ];
  return radiusCenter;
};

export const getClosestRadiusCenter = (
  point: Point, direction: Direction, node: BaseNode,
): Point => {
  const radiusCenter = getRectRadiusCircle(node as RectNode);
  let closestRadiusPoint;
  let minDistance = Number.MAX_SAFE_INTEGER;
  radiusCenter.forEach(item => {
    const radiusDistance = distance(point.x, point.y, item.x, item.y);
    if (radiusDistance < minDistance) {
      minDistance = radiusDistance;
      closestRadiusPoint = item;
    }
  });
  const corssPoint = getCrossPointWithCircle(point, direction, closestRadiusPoint);
  return corssPoint;
};
/* 求点在垂直或者水平方向上与圆形的交点 */
export const getCrossPointWithCircle = (
  point: Point, direction: Direction, node: BaseNode,
): Point => {
  let crossPoint;
  const { x, y, r } = node as CircleNode;
  if (direction === SegmentDirection.HORIZONTAL) {
    // 水平，x轴
    const crossLeft = x - Math.sqrt(r * r - (point.y - y) * (point.y - y));
    const crossRight = x + Math.sqrt(r * r - (point.y - y) * (point.y - y));
    const crossX = Math.abs(crossLeft - point.x) < Math.abs(crossRight - point.x)
      ? crossLeft
      : crossRight;
    crossPoint = {
      x: crossX,
      y: point.y,
    };
  } else if (direction === SegmentDirection.VERTICAL) {
    // 垂直，y轴
    const crossTop = y - Math.sqrt(r * r - (point.x - x) * (point.x - x));
    const crossBottom = y + Math.sqrt(r * r - (point.x - x) * (point.x - x));
    const crossY = Math.abs(crossTop - point.y) < Math.abs(crossBottom - point.y)
      ? crossTop
      : crossBottom;
    crossPoint = {
      x: point.x,
      y: crossY,
    };
  }
  return crossPoint;
};

/* 判断点所在边的方向 */
export const pointEdgeDirection = (point: Point, node: BaseNode): Direction => {
  const dx = Math.abs(point.x - node.x);
  const dy = Math.abs(point.y - node.y);
  return dx / node.width > dy / node.height
    ? SegmentDirection.VERTICAL
    : SegmentDirection.HORIZONTAL;
};

// 判断矩形外框上一点是否在矩形直行线上
export const inStraightLineOfRect = (point: Point, node: BaseNode): boolean => {
  const rect = node as RectNode;
  let isInStraight = false;
  const rectStragit = {
    minX: rect.x - rect.width / 2 + rect.radius,
    maxX: rect.x + rect.width / 2 - rect.radius,
    minY: rect.y - rect.height / 2 + rect.radius,
    maxY: rect.x + rect.height / 2 - rect.radius,
  };
  const {
    x, y, width, height,
  } = rect;
  if (point.y === y + (height / 2) || point.y === y - (height / 2)) {
    isInStraight = point.x > rectStragit.minX && point.x < rectStragit.maxX;
  } else if (point.x === x + (width / 2) || point.x === x - (width / 2)) {
    isInStraight = point.y > rectStragit.minY && point.y < rectStragit.maxY;
  }
  return isInStraight;
};

/* 求点在垂直或者水平方向上与椭圆的交点 */
export const getCrossPointWithEllipse = (
  point: Point, direction: Direction, node: BaseNode,
) => {
  let crossPoint;
  const {
    x, y, rx, ry,
  } = node as EllipseNode;
  if (direction === SegmentDirection.HORIZONTAL) {
    // 水平
    const crossLeft = x
      - Math.sqrt(rx * rx - ((point.y - y) * (point.y - y) * rx * rx) / (ry * ry));
    const crossRight = x
      + Math.sqrt(rx * rx - ((point.y - y) * (point.y - y) * rx * rx) / (ry * ry));
    const crossX = Math.abs(crossLeft - point.x) < Math.abs(crossRight - point.x)
      ? crossLeft
      : crossRight;
    crossPoint = {
      x: crossX,
      y: point.y,
    };
  } else if (direction === SegmentDirection.VERTICAL) {
    // 垂直
    const crossTop = y
      - Math.sqrt(ry * ry - ((point.x - x) * (point.x - x) * ry * ry) / (rx * rx));
    const crossBottom = y
      + Math.sqrt(ry * ry - ((point.x - x) * (point.x - x) * ry * ry) / (rx * rx));
    const crossY = Math.abs(crossTop - point.y) < Math.abs(crossBottom - point.y)
      ? crossTop
      : crossBottom;
    crossPoint = {
      x: point.x,
      y: crossY,
    };
  }
  return crossPoint;
};

/* 求点在垂直或者水平方向上与多边形的交点 */
export const getCrossPointWithPolyone = (
  point: Point, direction: Direction, node: BaseNode,
): Point => {
  const { pointsPosition } = node as PolygonNode;
  let minDistance = Number.MAX_SAFE_INTEGER;
  let crossPoint;
  const segments = [];
  for (let i = 0; i < pointsPosition.length; i++) {
    segments.push({
      start: pointsPosition[i],
      end: pointsPosition[(i + 1) % pointsPosition.length],
    });
  }
  segments.forEach(item => {
    const { start, end } = item;
    let a = start; let b = end;
    if (start.x > end.x) {
      a = end;
      b = start;
    }
    const k = (b.y - a.y) / (b.x - a.x);
    const m = (a.x * b.y - b.x * a.y) / (a.x - b.x);
    let pointXY;
    if (k > Number.MAX_SAFE_INTEGER || m > Number.MAX_SAFE_INTEGER) {
      pointXY = {
        x: point.x,
        y: point.y,
      };
    } else if (direction === SegmentDirection.HORIZONTAL) {
      pointXY = {
        x: (point.y - m) / k,
        y: point.y,
      };
    } else if (direction === SegmentDirection.VERTICAL) {
      pointXY = {
        x: point.x,
        y: k * point.x + m,
      };
    }
    // 如果交点在线段上
    const inSegment = isInSegment(pointXY, start, end);
    if (inSegment) {
      const currentDistance = distance(pointXY.x, pointXY.y, point.x, point.y);
      if (currentDistance < minDistance) {
        minDistance = currentDistance;
        crossPoint = pointXY;
      }
    }
  });
  return crossPoint;
};

// 规范节点初始化数据
export const pickNodeConfig = (data): NodeConfig => {
  const nodeData = pick(data, [
    'id',
    'type',
    'x',
    'y',
    'text',
    'properties',
  ]);
  return nodeData;
};
