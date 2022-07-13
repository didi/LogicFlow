import { pick } from 'lodash-es';
import LineEdgeModel from '../model/edge/LineEdgeModel';
import PolylineEdgeModel from '../model/edge/PolylineEdgeModel';
import BaseNode from '../model/node/BaseNodeModel';
import { Point, Direction, EdgeConfig } from '../type/index';
import { getCrossPointOfLine, isInSegment } from '../algorithm/edge';
import { SegmentDirection } from '../constant/constant';
import {
  getNodeBBox, isInNode, distance,
} from './node';
import { getVerticalPointOfLine } from '../algorithm';

/* 手动创建边时edge->edgeModel */
export const setupEdgeModel = (edge, graphModel) => {
  let model;
  switch (edge.type) {
    case 'line':
      model = new LineEdgeModel(edge, graphModel);
      break;
    case 'polyline':
      model = new PolylineEdgeModel(edge, graphModel);
      break;
    default:
      model = new LineEdgeModel(edge, graphModel);
      break;
  }
  return model;
};

type PolyPoint = {
  x: number;
  y: number;
  id?: string;
};

type PolyPointMap = {
  [key: string]: PolyPoint;
};

type PolyPointLink = Record<PolyPoint['id'], PolyPoint['id']>;

type PBBox = Partial<{
  x: number;
  y: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  height: number;
  width: number;
  centerX: number;
  centerY: number;
}>;

/* 判断两个Bbox是否重合 */
export const isBboxOverLapping = (b1: PBBox, b2: PBBox): boolean => (
  Math.abs(b1.centerX - b2.centerX) * 2 < b1.width + b2.width
  && Math.abs(b1.centerY - b2.centerY) * 2 < b1.height + b2.height
);

/* 连接点去重，去掉x,y位置重复的点 */
export const filterRepeatPoints = (points: PolyPoint[]): PolyPoint[] => {
  const result: PolyPoint[] = [];
  const pointsMap: Record<string, PolyPoint> = {};
  points.forEach(p => {
    const id = `${p.x}-${p.y}`;
    p.id = id;
    pointsMap[id] = p;
  });
  Object.keys(pointsMap).forEach(p => {
    result.push(pointsMap[p]);
  });
  return result;
};

/* 获取简单边:边之间除了起始点，只有1个中间点 */
export const getSimplePolyline = (sPoint: PolyPoint, tPoint: PolyPoint): PolyPoint[] => {
  const points = [
    sPoint,
    { x: sPoint.x, y: tPoint.y },
    tPoint,
  ];
  return filterRepeatPoints(points);
};

/* 扩展的bbox,保证起始点的下一个点一定在node的垂直方向，不会与线重合, offset是点与线的垂直距离 */
export const getExpandedBBox = (bbox: PBBox, offset: number): PBBox => {
  if (bbox.width === 0 && bbox.height === 0) {
    return bbox;
  }
  return {
    centerX: bbox.centerX,
    centerY: bbox.centerY,
    minX: bbox.minX - offset,
    minY: bbox.minY - offset,
    maxX: bbox.maxX + offset,
    maxY: bbox.maxY + offset,
    height: bbox.height + 2 * offset,
    width: bbox.width + 2 * offset,
  };
};

/**
 * 判断点与中心点边的方向：是否水平，true水平，false垂直
 */
export const pointDirection = (point: PolyPoint, node: BaseNode): Direction => {
  const dx = Math.abs(point.x - node.x);
  const dy = Math.abs(point.y - node.y);
  const { width, height } = node;
  const hDistance = width / 2 - dx; // 锚点距离节点左右两边的最小距离，值大于0表示在minX与maxX之间
  const vDistance = height / 2 - dy; // 锚点距离节点上下两边的最小距离，值大于0表示在minY与maxY之间
  if (hDistance > 0 && vDistance > 0) {
    // 锚点在节点内部，寻找与锚点距离最近的边的方向
    return hDistance < vDistance ? SegmentDirection.HORIZONTAL : SegmentDirection.VERTICAL;
  }
  // 锚点在节点边上或者节点外部，比较锚点斜率(dy/dx)与节点斜率(height/width)
  return dx / node.width > dy / node.height
    ? SegmentDirection.HORIZONTAL
    : SegmentDirection.VERTICAL;
};

/* 获取扩展图形上的点，即起始终点相邻的点，上一个或者下一个节点 */
export const getExpandedBBoxPoint = (bbox: PBBox, point: PolyPoint, direction): PolyPoint => {
  // const direction = pointDirection(point, bbox);
  if (direction === SegmentDirection.HORIZONTAL) {
    return {
      x: point.x > bbox.centerX ? bbox.maxX : bbox.minX,
      y: point.y,
    };
  }
  return {
    x: point.x,
    y: point.y > bbox.centerY ? bbox.maxY : bbox.minY,
  };
};

/* 获取包含2个图形的外层box */
export const mergeBBox = (b1: PBBox, b2: PBBox): PBBox => {
  const minX = Math.min(b1.minX, b2.minX);
  const minY = Math.min(b1.minY, b2.minY);
  const maxX = Math.max(b1.maxX, b2.maxX);
  const maxY = Math.max(b1.maxY, b2.maxY);
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    minX,
    minY,
    maxX,
    maxY,
    height: maxY - minY,
    width: maxX - minX,
  };
};

/* 获取多个点的外层bbox
* 这个函数的用处
* 1、获取起始终点相邻点(expendBboxPoint)的bbox
* 2、polylineEdge, bezierEdge，获取outline边框，这种情况传入offset
*/
export const getBBoxOfPoints = (points: PolyPoint[] = [], offset?: number): PBBox => {
  const xList: number[] = [];
  const yList: number[] = [];
  points.forEach(p => {
    xList.push(p.x);
    yList.push(p.y);
  });
  const minX = Math.min(...xList);
  const maxX = Math.max(...xList);
  const minY = Math.min(...yList);
  const maxY = Math.max(...yList);
  let width = maxX - minX;
  let height = maxY - minY;
  if (offset) {
    width += offset;
    height += offset;
  }
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    maxX,
    maxY,
    minX,
    minY,
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    height,
    width,
  };
};
/* 获取box四个角上的点 */
export const getPointsFromBBox = (bbox: PBBox): PolyPoint[] => {
  const {
    minX,
    minY,
    maxX,
    maxY,
  } = bbox;
  return [
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
};
/* 判断某一点是否在box中 */
export const isPointOutsideBBox = (point: PolyPoint, bbox: PBBox): boolean => {
  const { x, y } = point;
  return x < bbox.minX || x > bbox.maxX || y < bbox.minY || y > bbox.maxY;
};

/* 获取点的x方向上与box的交点 */
export const getBBoxXCrossPoints = (bbox: PBBox, x: number): PolyPoint[] => {
  if (x < bbox.minX || x > bbox.maxX) {
    return [];
  }
  return [
    {
      x,
      y: bbox.minY,
    },
    {
      x,
      y: bbox.maxY,
    },
  ];
};

/* 获取点的y方向上与box的交点 */
export const getBBoxYCrossPoints = (bbox: PBBox, y: number): PolyPoint[] => {
  if (y < bbox.minY || y > bbox.maxY) {
    return [];
  }
  return [
    {
      x: bbox.minX,
      y,
    },
    {
      x: bbox.maxX,
      y,
    },
  ];
};

/* 获取点的x,y方向上与box的交点 */
export const getBBoxCrossPointsByPoint = (bbox: PBBox, point: PolyPoint): PolyPoint[] => (
  getBBoxXCrossPoints(bbox, point.x).concat(getBBoxYCrossPoints(bbox, point.y))
);

/* 计算两点之间的预测距离(非直线距离) */
export const estimateDistance = (p1: PolyPoint, p2: PolyPoint): number => (
  Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)
);

/* 减少点别重复计算进距离的误差 */
export const costByPoints = (p: PolyPoint, points: PolyPoint[]): number => {
  const offset = -2;
  let result = 0;
  points.forEach(point => {
    if (point) {
      if (p.x === point.x) {
        result += offset;
      }
      if (p.y === point.y) {
        result += offset;
      }
    }
  });
  return result;
};

/* 预估距离 */
export const heuristicCostEstimate = (
  p: PolyPoint,
  ps: PolyPoint,
  pt: PolyPoint,
  source?: PolyPoint,
  target?: PolyPoint,
): number => estimateDistance(p, ps)
  + estimateDistance(p, pt)
  + costByPoints(p, [ps, pt, source!, target!]);

/* 重建路径，根据cameFrom属性计算出从起始到结束的路径 */
export const rebuildPath = (
  pathPoints: PolyPoint[],
  pointById: PolyPointMap,
  cameFrom: PolyPointLink,
  currentId: string,
  iterator?: number,
): void => {
  if (!iterator) {
    iterator = 0;
  }
  pathPoints.unshift(pointById[currentId]);
  if (cameFrom[currentId] && cameFrom[currentId] !== currentId && iterator <= 100) {
    rebuildPath(pathPoints, pointById, cameFrom, cameFrom[currentId], iterator + 1);
  }
};

/* 把计算完毕的点从开放列表中删除 */
export const removeClosePointFromOpenList = (arr: PolyPoint[], item: PolyPoint): void => {
  const index = arr.indexOf(item);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

/* 通过向量判断线段之间是否是相交的 */
export const isSegmentsIntersected = (
  p0: PolyPoint,
  p1: PolyPoint,
  p2: PolyPoint,
  p3: PolyPoint,
): boolean => {
  const s1x = p1.x - p0.x;
  const s1y = p1.y - p0.y;
  const s2x = p3.x - p2.x;
  const s2y = p3.y - p2.y;

  const s = (-s1y * (p0.x - p2.x) + s1x * (p0.y - p2.y)) / (-s2x * s1y + s1x * s2y);
  const t = (s2x * (p0.y - p2.y) - s2y * (p0.x - p2.x)) / (-s2x * s1y + s1x * s2y);

  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
};

/* 判断线段与bbox是否是相交的，保证节点之间的边不会穿过节点自身 */
export const isSegmentCrossingBBox = (p1: PolyPoint, p2: PolyPoint, bbox: PBBox): boolean => {
  if (bbox.width === 0 && bbox.height === 0) {
    return false;
  }
  const [pa, pb, pc, pd] = getPointsFromBBox(bbox);
  return (
    isSegmentsIntersected(p1, p2, pa, pb)
    || isSegmentsIntersected(p1, p2, pa, pd)
    || isSegmentsIntersected(p1, p2, pb, pc)
    || isSegmentsIntersected(p1, p2, pc, pd)
  );
};

/* 获取下一个相邻的点 */
export const getNextNeighborPoints = (
  points: PolyPoint[],
  point: PolyPoint,
  bbox1: PBBox,
  bbox2: PBBox,
): PolyPoint[] => {
  const neighbors: Point[] = [];
  points.forEach(p => {
    if (p !== point) {
      if (p.x === point.x || p.y === point.y) {
        if (!isSegmentCrossingBBox(p, point, bbox1) && !isSegmentCrossingBBox(p, point, bbox2)) {
          neighbors.push(p);
        }
      }
    }
  });
  return filterRepeatPoints(neighbors);
};

/* 路径查找,Astart查找+曼哈顿距离
* 算法wiki:https://zh.wikipedia.org/wiki/A*%E6%90%9C%E5%B0%8B%E6%BC%94%E7%AE%97%E6%B3%95
* 方法无法复用，且调用了很多polyline相关的方法，暂不抽离到src/algorithm中
*/
export const pathFinder = (
  points: PolyPoint[],
  start: PolyPoint,
  goal: PolyPoint,
  sBBox: PBBox,
  tBBox: PBBox,
  os: PolyPoint,
  ot: PolyPoint,
): PolyPoint[] => {
  // 定义已经遍历过的点
  const closedSet: PolyPoint[] = [];
  // 定义需要遍历的店
  const openSet = [start];
  // 定义节点的上一个节点
  const cameFrom: PolyPointLink = {};

  const gScore: {
    [key: string]: number;
  } = {};

  const fScore: {
    [key: string]: number;
  } = {};

  gScore[start.id] = 0;
  fScore[start.id] = heuristicCostEstimate(start, goal, start);

  const pointById: PolyPointMap = {};

  points.forEach(p => {
    pointById[p.id] = p;
  });

  while (openSet.length) {
    let current: PolyPoint;
    let lowestFScore = Infinity;
    openSet.forEach((p: PolyPoint) => {
      if (fScore[p.id] < lowestFScore) {
        lowestFScore = fScore[p.id];
        current = p;
      }
    });

    if (current === goal) {
      const pathPoints: PolyPoint[] = [];
      rebuildPath(pathPoints, pointById, cameFrom, goal.id);
      return pathPoints;
    }

    removeClosePointFromOpenList(openSet, current);
    closedSet.push(current);

    getNextNeighborPoints(points, current, sBBox, tBBox).forEach(neighbor => {
      if (closedSet.indexOf(neighbor) !== -1) {
        return;
      }

      if (openSet.indexOf(neighbor) === -1) {
        openSet.push(neighbor);
      }

      const tentativeGScore = fScore[current.id] + estimateDistance(current, neighbor);
      if (
        gScore[neighbor.id]
        && tentativeGScore >= gScore[neighbor.id]
      ) {
        return;
      }

      cameFrom[neighbor.id] = current.id;
      gScore[neighbor.id] = tentativeGScore;
      fScore[neighbor.id] = gScore[neighbor.id]
        + heuristicCostEstimate(neighbor, goal, start, os, ot);
    });
  }
  return [start, goal];
};

export const getBoxByOriginNode = (node: BaseNode): PBBox => {
  const bbox = getNodeBBox(node);
  return bbox;
};
/* 保证一条直线上只有2个节点： 删除x/y相同的中间节点 */
export const pointFilter = (points: PolyPoint[]): PolyPoint[] => {
  const allPoints = points;
  let i = 1;
  while (i < allPoints.length - 1) {
    const pre = allPoints[i - 1];
    const current = allPoints[i];
    const next = allPoints[i + 1];
    if ((pre.x === current.x && current.x === next.x)
      || (pre.y === current.y && current.y === next.y)) {
      allPoints.splice(i, 1);
    } else {
      i++;
    }
  }
  return allPoints;
};

/**
 * 计算折线点
 * @param start 连线的开始点坐标
 * @param end 连线的结束点坐标
 * @param sNode 连线连接的开始节点
 * @param tNode 连线连接的结束节点
 * @param offset 连线箭头距离
 */
export const getPolylinePoints = (
  start: PolyPoint,
  end: PolyPoint,
  sNode: BaseNode,
  tNode: BaseNode,
  offset: number,
): PolyPoint[] => {
  // 开始节点的范围
  const sBBox = getBoxByOriginNode(sNode);
  // 结束节点的范围
  const tBBox = getBoxByOriginNode(tNode);
  // 开始节点+连线箭头距离扩大后的范围
  const sxBBox = getExpandedBBox(sBBox, offset);
  // 结束节点+连线箭头距离扩大后的范围
  const txBBox = getExpandedBBox(tBBox, offset);
  // 点所在接节点的方向
  const sDirection = pointDirection(start, sNode);
  // 在扩大后的矩形区域中获取一个新的连线开始点
  const sPoint = getExpandedBBoxPoint(sxBBox, start, sDirection);
  // 点所在接节点的方向
  const tDirection = pointDirection(end, tNode);
  // 在扩大后的矩形区域中获取一个新的连线结束点
  const tPoint = getExpandedBBoxPoint(txBBox, end, tDirection);
  // 当加上offset后的bbox有重合，直接简单计算节点
  if (isBboxOverLapping(sxBBox, txBBox)) {
    const points = getSimplePoints(start, end, sPoint, tPoint);
    return [start, sPoint, ...points, tPoint, end];
  }
  const lineBBox = getBBoxOfPoints([sPoint, tPoint]);
  const sMixBBox = mergeBBox(sxBBox, lineBBox);
  const tMixBBox = mergeBBox(txBBox, lineBBox);
  let connectPoints: PolyPoint[] = [];
  connectPoints = connectPoints.concat(
    getPointsFromBBox(sMixBBox),
  );
  connectPoints = connectPoints.concat(
    getPointsFromBBox(tMixBBox),
  );
  // 中心点
  const centerPoint = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
  // 获取中心点与其他box的交点
  [lineBBox, sMixBBox, tMixBBox].forEach((bbox: PBBox) => {
    connectPoints = connectPoints.concat(
      getBBoxCrossPointsByPoint(bbox, centerPoint).filter(
        p => isPointOutsideBBox(p, sxBBox) && isPointOutsideBBox(p, txBBox),
      ),
    );
  });
  // 与起止终点相邻的两的，在x，y方向上的交点，这四个点组成了矩形 。。。解释图中在不中这两个点，
  [
    {
      x: sPoint.x,
      y: tPoint.y,
    },
    {
      x: tPoint.x,
      y: sPoint.y,
    },
  ].forEach(p => {
    if (
      isPointOutsideBBox(p, sxBBox)
      && isPointOutsideBBox(p, txBBox)
    ) {
      connectPoints.push(p);
    }
  });
  connectPoints.unshift(sPoint);
  connectPoints.push(tPoint);
  connectPoints = filterRepeatPoints(connectPoints);
  // 路径查找-最关键的步骤
  let pathPoints = pathFinder(connectPoints, sPoint, tPoint, sBBox, tBBox, start, end);
  pathPoints.unshift(start);
  pathPoints.push(end);
  // 删除一条直线上的多余节点
  if (pathPoints.length > 2) {
    pathPoints = pointFilter(pathPoints);
  }
  return filterRepeatPoints(pathPoints);
};

/**
 * 获取折线中最长的一个线
 * @param pointsList 多个点组成的数组
 */
export const getLongestEdge = (pointsList: PolyPoint[]): [PolyPoint, PolyPoint] => {
  let points;
  if (pointsList.length === 1) {
    points = [pointsList[0], pointsList[0]];
  } else if (pointsList.length >= 2) {
    let point1 = pointsList[0];
    let point2 = pointsList[1];
    let edgeLength = distance(point1.x, point1.y, point2.x, point2.y);
    for (let i = 1; i < pointsList.length - 1; i++) {
      const newPoint1 = pointsList[i];
      const newPoint2 = pointsList[i + 1];
      const newEdgeLength = distance(newPoint1.x, newPoint1.y, newPoint2.x, newPoint2.y);
      if (newEdgeLength > edgeLength) {
        edgeLength = newEdgeLength;
        point1 = newPoint1;
        point2 = newPoint2;
      }
    }
    points = [point1, point2];
  }
  return points;
};

/* 线段是否在节点内部， 被包含了 */
export const isSegmentsInNode = (start: Point, end: Point, node: BaseNode): boolean => {
  const startInNode = isInNode(start, node);
  const endInNode = isInNode(end, node);
  return startInNode && endInNode;
};

/* 线段是否与节点相交 */
export const isSegmentsCrossNode = (start: Point, end: Point, node: BaseNode): boolean => {
  const startInNode = isInNode(start, node);
  const endInNode = isInNode(end, node);
  // bothInNode，线段两个端点都在节点内
  const bothInNode = startInNode && endInNode;
  // cross，线段有端点在节点内
  const inNode = startInNode || endInNode;
  // 有且只有一个点在节点内部
  return !bothInNode && inNode;
};

/* 获取线段在矩形内部的交点
*/
export const getCrossPointInRect = (start: Point, end: Point, node: BaseNode): Point => {
  let point;
  let crossSegments;
  const nodeBox = getNodeBBox(node);
  const points = getPointsFromBBox(nodeBox);
  for (let i = 0; i < points.length; i++) {
    const isCross = isSegmentsIntersected(start, end, points[i], points[(i + 1) % points.length]);
    if (isCross) {
      crossSegments = [points[i], points[(i + 1) % points.length]];
    }
  }
  if (crossSegments) {
    point = getCrossPointOfLine(start, end, crossSegments[0], crossSegments[1]);
  }
  return point;
};
/* 判断线段的方向 */
export const segmentDirection = (start: Point, end: Point): Direction => {
  let direction;
  if (start.x === end.x) {
    direction = SegmentDirection.VERTICAL;
  } else if (start.y === end.y) {
    direction = SegmentDirection.HORIZONTAL;
  }
  return direction;
};

export const points2PointsList = (points: string): PolyPoint[] => {
  const currentPositionList = points.split(' ');
  const pointsList = [];
  currentPositionList && currentPositionList.forEach(item => {
    const [x, y] = item.split(',');
    pointsList.push({ x: Number(x), y: Number(y) });
  });
  return pointsList;
};

export const getSimplePoints = (start, end, sPoint, tPoint): Point[] => {
  const points = [];
  // start,sPoint的方向，水平或者垂直，即路径第一条线段的方向
  const startDirection = segmentDirection(start, sPoint);
  // end,tPoint的方向，水平或者垂直，即路径最后一条条线段的方向
  const endDirection = segmentDirection(end, tPoint);
  // 根据两条线段的方向作了计算，调整线段经验所得，非严格最优计算，能保证不出现折线
  // 方向相同，添加两个点，两条平行线垂直距离一半的两个端点
  if (startDirection === endDirection) {
    if (start.y === sPoint.y) {
      points.push({ x: sPoint.x, y: (sPoint.y + tPoint.y) / 2 });
      points.push({ x: tPoint.x, y: (sPoint.y + tPoint.y) / 2 });
    } else {
      points.push({ x: (sPoint.x + tPoint.x) / 2, y: sPoint.y });
      points.push({ x: (sPoint.x + tPoint.x) / 2, y: tPoint.y });
    }
  } else {
    // 方向不同，添加一个点，保证不在当前线段上(会出现重合)，且不能有折线
    let point = {
      x: sPoint.x,
      y: tPoint.y,
    };
    const inStart = isInSegment(point, start, sPoint);
    const inEnd = isInSegment(point, end, tPoint);
    if (inStart || inEnd) {
      point = {
        x: tPoint.x,
        y: sPoint.y,
      };
    } else {
      const onStart = isOnLine(point, start, sPoint);
      const onEnd = isOnLine(point, end, tPoint);
      if (onStart && onEnd) {
        point = {
          x: tPoint.x,
          y: sPoint.y,
        };
      }
    }
    points.push(point);
  }
  return points;
};

const isOnLine = (point, start, end) => (point.x === start.x && point.x === end.x)
  || (point.y === start.y && point.y === end.y);

/* 求字符串的字节长度 */
export const getBytesLength = (word: string): number => {
  if (!word) {
    return 0;
  }
  let totalLength = 0;
  for (let i = 0; i < word.length; i++) {
    const c = word.charCodeAt(i);
    if ((word.match(/[A-Z]/))) {
      totalLength += 1.5;
    } else if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
      totalLength += 1;
    } else {
      totalLength += 2;
    }
  }
  return totalLength;
};

/**
 * Uses canvas.measureText to compute
 * and return the width of the given text of given font in pixels.
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor
 * that text is to be rendered with (e.g. "bold 14px verdana").
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
let canvas = null;
export const getTextWidth = (text, font) => {
  if (!canvas) {
    canvas = document.createElement('canvas');
  }
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
};

type AppendAttributesType = {
  d: string,
  fill: string,
  stroke: string,
  strokeWidth: number,
  strokeDasharray: string,
};
// 扩大边可点区域，获取边append的信息
export const getAppendAttributes = (appendInfo) : AppendAttributesType => {
  const { start, end } = appendInfo;
  let d;
  if (start.x === end.x && start.y === end.y) {
    // 拖拽过程中会出现起终点重合的情况，这时候append无法计算
    d = '';
  } else {
    const config = {
      start,
      end,
      offset: 10,
      verticalLength: 5,
    };
    const startPosition = getVerticalPointOfLine({ ...config, type: 'start' });
    const endPosition = getVerticalPointOfLine({ ...config, type: 'end' });
    d = `M${startPosition.leftX} ${startPosition.leftY} 
    L${startPosition.rightX} ${startPosition.rightY} 
    L${endPosition.rightX} ${endPosition.rightY}
    L${endPosition.leftX} ${endPosition.leftY} z`;
  }
  return {
    d,
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 1,
    strokeDasharray: '4, 4',
  };
};
export type IBezierControls = {
  sNext: Point,
  ePre: Point
};
// bezier曲线
export const getBezierControlPoints = ({
  start,
  end,
  sourceNode,
  targetNode,
  offset,
}): IBezierControls => {
  const nodeDistance = Math.max(
    Math.abs(sourceNode.x - targetNode.x), Math.abs(sourceNode.y - targetNode.y),
  );
  offset = offset || nodeDistance / 4;
  const sBBox = getNodeBBox(sourceNode);
  const tBBox = getNodeBBox(targetNode);
  const sExpendBBox = getExpandedBBox(sBBox, offset);
  const tExpendBBox = getExpandedBBox(tBBox, offset);
  const sDirection = pointDirection(start, sourceNode);
  const tDirection = pointDirection(end, targetNode);
  // 1. 避免两个节点连出的多个连线重合。
  // 2. 避免开始节点和结束节点方向相同时成为一个穿过节点的直线。
  const sNext = getExpandedBBoxPoint(sExpendBBox, start, sDirection);
  const ePre = getExpandedBBoxPoint(tExpendBBox, end, tDirection);
  // 计算起点的调整点是否需要偏移
  // 如果起点的调整点方向和连线方向相反，则添加偏移量
  // 如果终点的调整点方向与连线方向
  const randomNumberX = Math.ceil((Math.random() + 0.5) * offset);
  const randomNumberY = Math.ceil((Math.random() + 0.5) * offset);
  // 如果是调整点在节点水平方向，那么调整的点Y需要向着另一个节点的方向进行一定随机量的偏移。
  // 如果是调整点在节点垂直方向，那么调整的点X需要向着另一个节点的方向进行一定随机量的偏移。
  if (sDirection === SegmentDirection.HORIZONTAL) {
    sNext.y += (sourceNode.y >= targetNode.y ? randomNumberY : -randomNumberY);
  }
  if (sDirection === SegmentDirection.VERTICAL) {
    sNext.x += (sourceNode.x >= targetNode.x ? randomNumberX : -randomNumberX);
  }
  if (tDirection === SegmentDirection.HORIZONTAL) {
    ePre.y += (sourceNode.y > targetNode.y ? randomNumberY : -randomNumberY);
  }
  if (tDirection === SegmentDirection.VERTICAL) {
    ePre.x += (sourceNode.x > targetNode.x ? randomNumberX : -randomNumberX);
  }
  return { sNext, ePre };
};

export type IBezierPoints = {
  start: Point,
  sNext: Point,
  ePre: Point,
  end: Point,
};
// 根据bezier曲线path求出Points
export const getBezierPoints = (path: string): Point[] => {
  const list = path.replace(/M/g, '').replace(/C/g, ',').split(',');
  const start = getBezierPoint(list[0]);
  const sNext = getBezierPoint(list[1]);
  const ePre = getBezierPoint(list[2]);
  const end = getBezierPoint(list[3]);
  return [start, sNext, ePre, end];
};
// 根据bezier曲线path求出Point坐标
const getBezierPoint = (positionStr: string): Point => {
  const [x, y] = positionStr.replace(/(^\s*)/g, '').split(' ');
  return {
    x: +x,
    y: +y,
  };
};
// 根据bezier曲线path求出结束切线的两点坐标
export const getEndTangent = (path: string): Point[] => {
  const bezierPoints = getBezierPoints(path);
  return [bezierPoints[2], bezierPoints[3]];
};

/**
 * 获取移动边后，文本位置距离边上的最近的一点
 * @param point 边上文本的位置
 * @param points 边的各个拐点
 */
export const getClosestPointOfPolyline = (point: Point, points: string): Point => {
  const { x, y } = point;
  const pointsPosition = points2PointsList(points);
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
    // 若线段垂直，则crossPoint的横坐标与线段一致
    if (start.x === end.x) {
      const pointXY = {
        x: start.x,
        y,
      };
      const inSegment = isInSegment(pointXY, start, end);
      if (inSegment) {
        const currentDistance = Math.abs(start.x - x);
        if (currentDistance < minDistance) {
          minDistance = currentDistance;
          crossPoint = pointXY;
        }
      }
    } else if (start.y === end.y) {
      const pointXY = {
        x,
        y: start.y,
      };
      const inSegment = isInSegment(pointXY, start, end);
      if (inSegment) {
        const currentDistance = Math.abs(start.y - y);
        if (currentDistance < minDistance) {
          minDistance = currentDistance;
          crossPoint = pointXY;
        }
      }
    }
  });
  // 边界：只有一条线段时，沿线段移动节点，当文本超出边后，文本没有可供参考的线段
  if (!crossPoint) {
    const { start, end } = segments[0];
    crossPoint = {
      x: start.x + (end.x - start.x) / 2,
      y: start.y + (end.y - start.y) / 2,
    };
  }
  return crossPoint;
};

// 规范边初始化数据
export const pickEdgeConfig = (data): EdgeConfig => pick(data, [
  'id',
  'type',
  'sourceNodeId',
  'sourceAnchorId',
  'targetNodeId',
  'targetAnchorId',
  'pointsList',
  'startPoint',
  'endPoint',
  'properties',
]);

type Position = {
  x: number;
  y: number;
};

// eslint-disable-next-line arrow-body-style
export const twoPointDistance = (source: Position, target: Position) => {
  // fix: 修复坐标存在负值时计算错误的问题。
  // const source = {
  //   x: p1.x,
  //   y: Math.abs(p1.y),
  // };
  // const target = {
  //   x: Math.abs(p2.x),
  //   y: Math.abs(p2.y),
  // };
  return Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2);
};
