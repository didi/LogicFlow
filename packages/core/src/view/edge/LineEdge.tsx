import { h } from 'preact';
import Line from '../basic-shape/Line';
import Path from '../basic-shape/Path';
import BaseEdge from './BaseEdge';
import { getAppendAttributes } from '../../util/edge';

export default class LineEdge extends BaseEdge {
  getEdge() {
    const { model } = this.props;
    const { startPoint, endPoint, isAnimation } = model;
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
      <Line
        {
          ...style
        }
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
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
        { this.getEdge() }
      </g>
    );
  }
  getAnimation() {
    const { model } = this.props;
    const { stroke, className, strokeDasharray } = model.getAnimation();
    const { startPoint, endPoint } = model;
    const style = model.getEdgeStyle();
    return (
      <g>
        <Line
          {
            ...style
          }
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          className={className}
          strokeDasharray={strokeDasharray}
          stroke={stroke}
        />
      </g>
    );
  }
  getAppendWidth() {
    const { model } = this.props;
    const { startPoint, endPoint } = model;
    const appendInfo = {
      start: startPoint,
      end: endPoint,
    };
    const {
      d, strokeWidth, fill, strokeDasharray, stroke,
    } = getAppendAttributes(appendInfo);
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
}
