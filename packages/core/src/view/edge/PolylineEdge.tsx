import { h } from 'preact';
import Polyline from '../basic-shape/Polyline';
import BaseEdge from './BaseEdge';
import { EventType, SegmentDirection } from '../../constant/constant';
import { AppendInfo, ArrowInfo, IEdgeState } from '../../type/index';
import { points2PointsList } from '../../util/edge';
import { getVerticalPointOfLine } from '../../algorithm';
import Path from '../basic-shape/Path';
import { StepDrag } from '../../util/drag';
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
  isShowAdjustPointTemp: boolean;
  appendInfo: AppendInfo;
  constructor() {
    super();
    this.drag = new StepDrag({
      onDragStart: this.onDragStart,
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      isStopPropagation: false,
    });
  }
  /**
   * 不支持重写
   */
  onDragStart = () => {
    const polylineModel = this.props.model as PolylineEdgeModel;
    polylineModel.dragAppendStart();
    this.isShowAdjustPointTemp = polylineModel.isShowAdjustPoint;
    polylineModel.isShowAdjustPoint = false;
  };
  /**
   * 不支持重写
   */
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
  /**
   * 不支持重写
   */
  onDragEnd = () => {
    const { model, graphModel: { eventCenter } } = this.props;
    const polylineModel = model as PolylineEdgeModel;
    polylineModel.dragAppendEnd();
    this.isDragging = false;
    polylineModel.isShowAdjustPoint = this.isShowAdjustPointTemp;
    // 情况当前拖拽的线段信息
    this.appendInfo = undefined;
    // 向外抛出事件
    eventCenter.emit(
      EventType.EDGE_ADJUST,
      { data: polylineModel.getData() },
    );
  };
  /**
   * 不支持重写
   */
  beforeDragStart = (e, appendInfo) => {
    // 如果允许拖拽调整触发事件处理
    if (appendInfo.dragAble) {
      this.drag.handleMouseDown(e);
    }
    // 记录当前拖拽的线段信息
    this.appendInfo = appendInfo;
  };
  /**
   * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
   * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
   */
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
  /**
   * @deprecated
   */
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
  private getAppendAttributes(appendInfo: AppendInfo): AppendAttributesType {
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
  private getAppendShape(appendInfo: AppendInfo) {
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
  /**
   * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
   */
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
      if (adjustEdge && draggable) {
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
