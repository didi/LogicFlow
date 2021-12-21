import { h } from 'preact';
import Line from '../basic-shape/Line';
import Path from '../basic-shape/Path';
import BaseEdge from './BaseEdge';
import { getAppendAttibutes } from '../../util/edge';

export default class LineEdge extends BaseEdge {
  getEdge() {
    const { model } = this.props;
    const { startPoint, endPoint } = model;
    const style = model.getEdgeStyle();
    return (
      <Line
        {
          ...style
        }
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
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
  getAppendWidth() {
    const { model } = this.props;
    const { startPoint, endPoint } = model;
    const appendInfo = {
      start: startPoint,
      end: endPoint,
    };
    const {
      d, strokeWidth, fill, strokeDasharray, stroke,
    } = getAppendAttibutes(appendInfo);
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
