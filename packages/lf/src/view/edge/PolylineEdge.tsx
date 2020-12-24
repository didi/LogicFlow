import { h } from 'preact';
import Polyline from '../basic-shape/Polyline';
import BaseEdge from './BaseEdge';
import { SegmentDirection } from '../../constant/constant';
import { AppendInfo, ArrowInfo, IEdgeState } from '../../type/index';
import { poins2PointsList } from '../../util/edge';
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
  isDraging: boolean;
  appendInfo: AppendInfo;
  dragHandler: (ev: MouseEvent) => void;
  constructor() {
    super();
    this.drag = createDrag({
      onDragStart: this.onDragStart,
      onDraging: this.onDraging,
      onDragEnd: this.onDragEnd,
    });
  }
  onDragStart = () => {
    const polylineModel = this.props.model as PolylineEdgeModel;
    polylineModel.dragAppendStart();
  };

  onDraging = ({ deltaX, deltaY }) => {
    const { model, graphModel } = this.props;
    this.isDraging = true;
    const { transformMatrix } = graphModel;
    const [curDeltaX, curDeltaY] = transformMatrix.fixDeltaXY(deltaX, deltaY);
    const polylineModel = model as PolylineEdgeModel;
    // 更新当前拖拽的线段信息
    this.appendInfo = polylineModel.dragAppend(this.appendInfo, { x: curDeltaX, y: curDeltaY });
  };
  onDragEnd = () => {
    const polylineModel = this.props.model as PolylineEdgeModel;
    polylineModel.dragAppendEnd();
    this.isDraging = false;
    // 情况当前拖拽的线段信息
    this.appendInfo = undefined;
  };
  beforeDragStart(e, appendInfo) {
    this.dragHandler(e);
    // 记录当前拖拽的线段信息
    this.appendInfo = appendInfo;
  }
  getAttributes() {
    const attr = super.getAttributes();
    const {
      model: {
        points,
      },
    } = this.props;
    return {
      ...attr,
      points,
    };
  }
  getEdge() {
    const {
      points,
      strokeWidth,
      stroke,
    } = this.getAttributes();
    return (
      <Polyline
        points={points}
        strokeWidth={strokeWidth}
        stroke={stroke}
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
    const currentPositionList = poins2PointsList(points);
    // 两点重合时不计算起终点
    if (currentPositionList.length >= 2) {
      arrowInfo.start = currentPositionList[currentPositionList.length - 2];
      arrowInfo.end = currentPositionList[currentPositionList.length - 1];
    }
    return arrowInfo;
  }
  getAppendAttibutes(appendInfo: AppendInfo): AppendAttributesType {
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
    } = this.getAppendAttibutes(appendInfo);
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
    const { pointsList } = model;
    const LineAppendList = [];
    for (let i = 0; i < pointsList.length - 1; i++) {
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
      };
      let append = (
        <g
          className={className}
        >
          {this.getAppendShape(appendInfo)}
        </g>
      );
      const { editConfig } = graphModel;
      if (!editConfig.adjustEdge) {
        this.dragHandler = () => { };
      } else {
        this.dragHandler = this.drag;
        if (appendInfo.start.x === appendInfo.end.x) {
          // 水平
          className += '-ew-resize';
          appendInfo.direction = SegmentDirection.VERTICAL;
        } else if (appendInfo.start.y === appendInfo.end.y) {
          // 垂直
          className += '-ns-resize';
          appendInfo.direction = SegmentDirection.HORIZONTAL;
        }
        append = (
          <g
            className={this.isDraging ? 'lf-dragging' : 'lf-drag-able'}
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
