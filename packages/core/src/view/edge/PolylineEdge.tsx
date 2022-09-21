import { h } from 'preact';
import Polyline from '../basic-shape/Polyline';
import BaseEdge from './BaseEdge';
import { EventType, SegmentDirection } from '../../constant/constant';
import { AppendInfo, ArrowInfo, IEdgeState } from '../../type/index';
import { points2PointsList } from '../../util/edge';
import { getVerticalPointOfLine } from '../../algorithm';
import Path from '../basic-shape/Path';
import { createDrag } from '../../util/drag';
import PolylineEdgeModel from '../../model/edge/PolylineEdgeModel';

type AppendAttributesType = {
  d: string,
  fill: string,
  stroke: string,
  strokeWidth: number,
  strokeDasharray: string,
};

export default class PolylineEdge extends BaseEdge {
  drag;
  isDragging: boolean;
  appendInfo: AppendInfo;
  dragHandler: (ev: MouseEvent) => void;
  constructor() {
    super();
    this.drag = createDrag({
      onDragStart: this.onDragStart,
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      isStopPropagation: false,
    });
  }
  onDragStart = () => {
    const polylineModel = this.props.model as PolylineEdgeModel;
    polylineModel.dragAppendStart();
  };

  onDragging = ({ deltaX, deltaY }) => {
    const { model, graphModel } = this.props;
    this.isDragging = true;
    const { transformModel, editConfigModel } = graphModel;
    const [curDeltaX, curDeltaY] = transformModel.fixDeltaXY(deltaX, deltaY);
    const polylineModel = model as PolylineEdgeModel;
    // 更新当前拖拽的线段信息
    // 1、如果只允许调整中间线段调用dragAppendSimple
    // 2、如果允许调整所有线段调用dragAppend
    const { adjustEdgeMiddle } = editConfigModel;
    if (adjustEdgeMiddle) {
      this.appendInfo = polylineModel.dragAppendSimple(
        this.appendInfo,
        { x: curDeltaX, y: curDeltaY },
      );
    } else {
      this.appendInfo = polylineModel.dragAppend(this.appendInfo, { x: curDeltaX, y: curDeltaY });
    }
  };
  onDragEnd = () => {
    const { model, graphModel: { eventCenter } } = this.props;
    const polylineModel = model as PolylineEdgeModel;
    polylineModel.dragAppendEnd();
    this.isDragging = false;
    // 情况当前拖拽的线段信息
    this.appendInfo = undefined;
    // 向外抛出事件
    eventCenter.emit(
      EventType.EDGE_ADJUST,
      { data: polylineModel.getData() },
    );
  };
  beforeDragStart = (e, appendInfo) => {
    // 如果允许拖拽调整触发事件处理
    if (appendInfo.dragAble) {
      this.dragHandler(e);
    }
    // 记录当前拖拽的线段信息
    this.appendInfo = appendInfo;
  };
  // 是否正在拖拽，在折线调整时，不展示起终点的调整点
  getIsDragging = () => this.isDragging;
  getEdge() {
    const { model } = this.props;
    const { points, isAnimation, arrowConfig } = model;
    const style = model.getEdgeStyle();
    const animationStyle = model.getEdgeAnimationStyle();
    const {
      strokeDasharray,
      stroke,
      strokeDashoffset,
      animationName,
      animationDuration,
      animationIterationCount,
      animationTimingFunction,
      animationDirection,
    } = animationStyle;
    return (
      <Polyline
        points={points}
        {
          ...style
        }
        {...arrowConfig}
        {
          ...isAnimation ? {
            strokeDasharray,
            stroke,
            style: {
              strokeDashoffset,
              animationName,
              animationDuration,
              animationIterationCount,
              animationTimingFunction,
              animationDirection,
            },
          } : {}
        }
      />
    );
  }
  getShape() {
    return (
      <g>
        {this.getEdge()}
      </g>
    );
  }
  getAnimation() {
    const { model } = this.props;
    const { stroke, className, strokeDasharray } = model.getAnimation();
    const style = model.getEdgeStyle();
    return (
      <g>
        <Polyline
          points={model.points}
          {
            ...style
          }
          className={className}
          strokeDasharray={strokeDasharray}
          stroke={stroke}
        />
      </g>
    );
  }
  getArrowInfo(): ArrowInfo {
    const { model } = this.props;
    const { points, isSelected } = model;
    const { hover } = this.state as IEdgeState;
    const arrowInfo = {
      start: null,
      end: null,
      hover,
      isSelected,
    };
    const currentPositionList = points2PointsList(points);
    // 两点重合时不计算起终点
    if (currentPositionList.length >= 2) {
      arrowInfo.start = currentPositionList[currentPositionList.length - 2];
      arrowInfo.end = currentPositionList[currentPositionList.length - 1];
    }
    return arrowInfo;
  }
  getAppendAttributes(appendInfo: AppendInfo): AppendAttributesType {
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
  }
  getAppendShape(appendInfo: AppendInfo) {
    const {
      d, strokeWidth, fill, strokeDasharray, stroke,
    } = this.getAppendAttributes(appendInfo);
    return (
      <Path
        d={d}
        fill={fill}
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
      />
    );
  }
  getAppendWidth() {
    const { model, graphModel } = this.props;
    const { pointsList, draggable } = model;
    const LineAppendList = [];
    const pointsLen = pointsList.length;
    for (let i = 0; i < pointsLen - 1; i++) {
      let className = 'lf-polyline-append';
      const appendInfo = {
        start: {
          x: pointsList[i].x,
          y: pointsList[i].y,
        },
        end: {
          x: pointsList[i + 1].x,
          y: pointsList[i + 1].y,
        },
        startIndex: i,
        endIndex: i + 1,
        direction: '',
        dragAble: true,
      };
      let append = (
        <g
          className={className}
        >
          {this.getAppendShape(appendInfo)}
        </g>
      );
      const { editConfigModel } = graphModel;
      const { adjustEdge, adjustEdgeMiddle } = editConfigModel;
      if (!adjustEdge || !draggable) {
        this.dragHandler = () => { };
      } else {
        this.dragHandler = this.drag;
        const { startIndex, endIndex } = appendInfo;
        // 如果不允许调整起点和终点相连的线段，设置该线段appendInfo的dragAble为false
        const dragDisable = adjustEdgeMiddle && (startIndex === 0 || endIndex === pointsLen - 1);
        appendInfo.dragAble = !dragDisable;
        if (appendInfo.start.x === appendInfo.end.x) {
          // 水平
          if (appendInfo.dragAble) {
            className += '-ew-resize';
          }
          appendInfo.direction = SegmentDirection.VERTICAL;
        } else if (appendInfo.start.y === appendInfo.end.y) {
          // 垂直
          if (appendInfo.dragAble) {
            className += '-ns-resize';
          }
          appendInfo.direction = SegmentDirection.HORIZONTAL;
        }
        append = (
          <g
            className={this.isDragging ? 'lf-dragging' : 'lf-drag-able'}
            onMouseDown={(e) => this.beforeDragStart(e, appendInfo)}
          >
            <g
              className={className}
            >
              {this.getAppendShape(appendInfo)}
            </g>
          </g>
        );
      }
      LineAppendList.push(append);
    }
    return <g>{LineAppendList}</g>;
  }
}
