import { observable, action, computed } from 'mobx';
import { assign } from 'lodash-es';
import { ModelType, SegmentDirection } from '../../constant/constant';
import { Point } from '../../type';
import { defaultTheme } from '../../constant/DefaultTheme';
import {
  isInNode,
  distance,
  getClosestRadiusCenter,
  inStraightLineOfRect,
  getCrossPointWithCircle,
  getCrossPointWithEllipse,
  getCrossPointWithPolyone,
} from '../../util/node';
import {
  getPolylinePoints,
  getLongestEdge,
  getCrossPointInRect,
  isSegmentsInNode,
  isSegmentsCrossNode,
  segmentDirection,
  poins2PointsList,
  pointFilter,
  pickEdgeConfig,
} from '../../util/edge';
import RectNodeModel from '../node/RectNodeModel';
import BaseEdgeModel from './BaseEdgeModel';
import GraphModel from '../GraphModel';

export { PolylineEdgeModel };
export default class PolylineEdgeModel extends BaseEdgeModel {
  modelType = ModelType.POLYLINE_EDGE;
  offset = defaultTheme.polyline.offset;
  draginngPointList;
  @observable points = '';
  @observable pointsList: Point[] = [];
  @observable dbClickPosition: Point;
  constructor(data, graphModel: GraphModel) {
    super(data, graphModel);
    this.setStyleFromTheme('polyline', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickEdgeConfig(data), attrs);
    this.setAnchors();
    this.initPoints();
    this.formatText(data);
  }
  @computed get textPosition(): Point {
    // 在文案为空的情况下，文案位置为双击位置
    const textValue = this.text?.value;
    if (this.dbClickPosition && !textValue) {
      const { x, y } = this.dbClickPosition;
      return {
        x, y,
      };
    }
    const currentPositionList = poins2PointsList(this.points);
    const [p1, p2] = getLongestEdge(currentPositionList);
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }
  // 获取下一个锚点
  getAfterAnchor(direction, position, anchorList) {
    let anchor;
    let minDistance;
    anchorList.forEach(item => {
      let distanceX;
      if (direction === SegmentDirection.HORIZONTAL) {
        distanceX = Math.abs(position.y - item.y);
      } else if (direction === SegmentDirection.VERTICAL) {
        distanceX = Math.abs(position.x - item.x);
      }
      if (!minDistance || minDistance > distanceX) {
        minDistance = distanceX;
        anchor = item;
      }
    });
    return anchor;
  }

  /* 获取拖拽过程中产生的交点 */
  getCorssPoint(direction, start, end) {
    let position;
    if (direction === SegmentDirection.HORIZONTAL) {
      position = {
        x: end.x,
        y: start.y,
      };
    } else if (direction === SegmentDirection.VERTICAL) {
      position = {
        x: start.x,
        y: end.y,
      };
    }
    return position;
  }

  // 删除在图形内的过个交点
  removeCrossPoints(startIndex, endIndex, pointList) {
    const list = [...pointList];
    if (startIndex === 1) {
      const start = list[startIndex];
      const end = list[endIndex];
      const pre = list[startIndex - 1];
      const isInStartNode = isSegmentsInNode(pre, start, this.sourceNode);
      if (isInStartNode) {
        const isSegmentsCrossStartNode = isSegmentsCrossNode(start, end, this.sourceNode);
        if (isSegmentsCrossStartNode) {
          const point = getCrossPointInRect(start, end, this.sourceNode);
          if (point) {
            list[startIndex] = point;
            list.splice(startIndex - 1, 1);
            startIndex--;
            endIndex--;
          }
        }
      } else {
        const anchorList = this.sourceNode.anchors;
        anchorList.forEach(item => {
          if ((item.x === pre.x && item.x === start.x)
            || (item.y === pre.y && item.y === start.y)) {
            const distance1 = distance(item.x, item.y, start.x, start.y);
            const distance2 = distance(pre.x, pre.y, start.x, start.y);
            if (distance1 < distance2) {
              list[startIndex - 1] = item;
            }
          }
        });
      }
    }
    if (endIndex === pointList.length - 2) {
      const start = list[startIndex];
      const end = list[endIndex];
      const next = list[endIndex + 1];
      const isInEndNode = isSegmentsInNode(end, next, this.targetNode);
      if (isInEndNode) {
        const isSegmentsCrossStartNode = isSegmentsCrossNode(start, end, this.targetNode);
        if (isSegmentsCrossStartNode) {
          const point = getCrossPointInRect(start, end, this.targetNode);
          if (point) {
            list[endIndex] = point;
            list.splice(endIndex + 1, 1);
          }
        }
      } else {
        const anchorList = this.targetNode.anchors;
        anchorList.forEach(item => {
          if ((item.x === next.x && item.x === end.x)
            || (item.y === next.y && item.y === end.y)) {
            const distance1 = distance(item.x, item.y, end.x, end.y);
            const distance2 = distance(next.x, next.y, end.x, end.y);
            if (distance1 < distance2) {
              list[endIndex + 1] = item;
            }
          }
        });
      }
    }
    return list;
  }

  // 获取在拖拽过程中可能产生的点
  getDragingPoints(direction, positioType, position, anchorList, draginngPointList) {
    const pointList = [...draginngPointList];
    const anchor = this.getAfterAnchor(direction, position, anchorList);
    const crossPoint = this.getCorssPoint(direction, position, anchor);
    if (positioType === 'start') {
      pointList.unshift(crossPoint);
      pointList.unshift(anchor);
    } else {
      pointList.push(crossPoint);
      pointList.push(anchor);
    }
    return pointList;
  }

  // 更新相交点[起点，终点]，更加贴近图形, 未修改observable不作为action
  updateCrossPoints(pointList) {
    const list = [...pointList];
    const start = pointList[0];
    const next = pointList[1];
    const pre = pointList[list.length - 2];
    const end = pointList[list.length - 1];
    const { sourceNode, targetNode } = this;
    const sourceModelType = sourceNode.modelType;
    const targetModelType = targetNode.modelType;
    const startPointDirection = segmentDirection(start, next);
    let startCrossPoint = list[0];
    switch (sourceModelType) {
      case ModelType.RECT_NODE:
        if ((sourceNode as RectNodeModel).radius !== 0) {
          const inInnerNode = inStraightLineOfRect(start, sourceNode);
          if (!inInnerNode) {
            startCrossPoint = getClosestRadiusCenter(start, startPointDirection, sourceNode);
          }
        }
        break;
      case ModelType.CIRCLE_NODE:
        startCrossPoint = getCrossPointWithCircle(start, startPointDirection, sourceNode);
        break;
      case ModelType.ELLIPSE_NODE:
        startCrossPoint = getCrossPointWithEllipse(start, startPointDirection, sourceNode);
        break;
      case ModelType.DIAMOND_NODE:
        startCrossPoint = getCrossPointWithPolyone(start, startPointDirection, sourceNode);
        break;
      case ModelType.POLYGON_NODE:
        startCrossPoint = getCrossPointWithPolyone(start, startPointDirection, sourceNode);
        break;
      default:
        break;
    }
    list[0] = startCrossPoint;
    const endPointDirection = segmentDirection(pre, end);
    let endCrossPoint = list[list.length - 1];
    switch (targetModelType) {
      case ModelType.RECT_NODE:
        if ((targetNode as RectNodeModel).radius !== 0) {
          const inInnerNode = inStraightLineOfRect(end, targetNode);
          if (!inInnerNode) {
            endCrossPoint = getClosestRadiusCenter(end, endPointDirection, targetNode);
          }
        }
        break;
      case ModelType.CIRCLE_NODE:
        endCrossPoint = getCrossPointWithCircle(end, endPointDirection, targetNode);
        break;
      case ModelType.ELLIPSE_NODE:
        endCrossPoint = getCrossPointWithEllipse(end, endPointDirection, targetNode);
        break;
      case ModelType.DIAMOND_NODE:
        endCrossPoint = getCrossPointWithPolyone(end, endPointDirection, targetNode);
        break;
      case ModelType.POLYGON_NODE:
        endCrossPoint = getCrossPointWithPolyone(end, endPointDirection, targetNode);
        break;
      default:
        break;
    }
    list[list.length - 1] = endCrossPoint;
    return list;
  }

  getData() {
    const data = super.getData();
    const pointsList = this.pointsList.map(({ x, y }) => ({ x, y }));
    return {
      ...data,
      pointsList,
    };
  }

  @action
  initPoints() {
    if (this.pointsList.length > 0) {
      this.points = this.pointsList.map(point => `${point.x},${point.y}`).join(' ');
    } else {
      this.updatePoints();
    }
  }

  @action
  updatePoints() {
    const pointsList = getPolylinePoints(
      { x: this.startPoint.x, y: this.startPoint.y },
      { x: this.endPoint.x, y: this.endPoint.y },
      this.sourceNode,
      this.targetNode,
      this.offset || 0,
    );
    this.pointsList = pointsList;
    this.points = pointsList.map(point => `${point.x},${point.y}`).join(' ');
  }

  @action
  updateStartPoint(anchor) {
    this.startPoint = anchor;
    this.updatePoints();
  }

  @action
  updateEndPoint(anchor) {
    this.endPoint = anchor;
    this.updatePoints();
  }

  @action
  dragAppendStart() {
    this.draginngPointList = [...this.pointsList];
  }

  @action
  dragAppend(appendInfo, dragInfo) {
    const {
      start,
      end,
      startIndex,
      endIndex,
      direction,
    } = appendInfo;
    const { pointsList } = this;
    if (direction === SegmentDirection.HORIZONTAL) {
      // 水平，仅调整y坐标
      // step1: 拿到当前线段两个端点移动后的坐标
      pointsList[startIndex] = { x: start.x, y: start.y + dragInfo.y };
      pointsList[endIndex] = { x: end.x, y: end.y + dragInfo.y };
      // step2: 计算拖拽后,两个端点与节点外框的交点
      // 定义一个拖住中节点list
      let draginngPointList = [...this.pointsList];
      if (startIndex !== 0 && endIndex !== this.pointsList.length - 1) {
        // 2.1)如果线段没有连接起终点，过滤会穿插在图形内部的线段，取整个图形离线段最近的点
        draginngPointList = this.removeCrossPoints(startIndex, endIndex, draginngPointList);
      }
      if (startIndex === 0) {
        // 2.2)如果线段连接了起点, 判断起点是否在节点内部
        const startPosition = {
          x: start.x, y: start.y + dragInfo.y,
        };
        const inNode = isInNode(startPosition, this.sourceNode);
        if (!inNode) {
          // 如果不在节点内部，更换起点为线段与节点的交点
          const anchorList = this.sourceNode.anchors;
          draginngPointList = this.getDragingPoints(direction, 'start', startPosition, anchorList, draginngPointList);
        }
      }
      if (endIndex === this.pointsList.length - 1) {
        // 2.2)如果线段连接了终点, 判断起点是否在节点内部
        const endPosition = {
          x: end.x, y: end.y + dragInfo.y,
        };
        const inNode = isInNode(endPosition, this.targetNode);
        if (!inNode) {
          // 如果不在节点内部，更换终点为线段与节点的交点
          const anchorList = this.targetNode.anchors;
          draginngPointList = this.getDragingPoints(direction, 'end', endPosition, anchorList, draginngPointList);
        }
      }
      draginngPointList = pointFilter(draginngPointList);
      this.updatePointsAfterDrage(draginngPointList);
      // step3: 调整到对应外框的位置后，执行updatePointsAfterDrage，找到当前线段和图形的准确交点
      this.draginngPointList = draginngPointList;
    } else if (direction === SegmentDirection.VERTICAL) {
      // 垂直，仅调整x坐标， 与水平调整同理
      pointsList[startIndex] = { x: start.x + dragInfo.x, y: start.y };
      pointsList[endIndex] = { x: end.x + dragInfo.x, y: end.y };
      let draginngPointList = [...this.pointsList];
      if (startIndex !== 0 && endIndex !== this.pointsList.length - 1) {
        draginngPointList = this.removeCrossPoints(startIndex, endIndex, draginngPointList);
      }
      if (startIndex === 0) {
        const startPosition = {
          x: start.x + dragInfo.x, y: start.y,
        };
        const inNode = isInNode(startPosition, this.sourceNode);
        if (!inNode) {
          const anchorList = this.sourceNode.anchors;
          draginngPointList = this.getDragingPoints(direction, 'start', startPosition, anchorList, draginngPointList);
        }
      }
      if (endIndex === this.pointsList.length - 1) {
        const endPosition = {
          x: end.x + dragInfo.x, y: end.y,
        };
        const inNode = isInNode(endPosition, this.targetNode);
        if (!inNode) {
          const anchorList = this.targetNode.anchors;
          draginngPointList = this.getDragingPoints(direction, 'end', endPosition, anchorList, draginngPointList);
        }
      }
      draginngPointList = pointFilter(draginngPointList);
      this.updatePointsAfterDrage(draginngPointList);
      this.draginngPointList = draginngPointList;
    }
    this.setText({ ...this.text, ...this.textPosition });
    return {
      start: pointsList[startIndex],
      end: pointsList[endIndex],
      startIndex,
      endIndex,
      direction,
    };
  }

  @action
  dragAppendEnd() {
    if (this.draginngPointList) {
      const pointsList = poins2PointsList(this.points);
      // 更新pointsList，重新渲染appendWidth
      this.pointsList = [...pointsList];
      // draginngPointList清空
      this.draginngPointList = [];
      // 更新起终点
      const startPoint = pointsList[0];
      this.startPoint = { ...startPoint };
      const endPoint = pointsList[pointsList.length - 1];
      this.endPoint = { ...endPoint };
    }
  }

  /* 拖拽之后个更新points，仅更新连线，不更新pointsList，
     appendWidth会依赖pointsList,更新pointsList会重新渲染appendWidth，从而导致不能继续拖拽
     在拖拽结束后再进行pointsList的更新
  */
  @action
  updatePointsAfterDrage(pointsList) {
    // 找到准确的连接点后,更新points, 更新连线，同时更新依赖points的箭头
    const list = this.updateCrossPoints(pointsList);
    this.points = list.map(point => `${point.x},${point.y}`).join(' ');
  }
}
