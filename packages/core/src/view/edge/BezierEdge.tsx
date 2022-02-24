import { h } from 'preact';
import BaseEdge from './BaseEdge';
import { ArrowInfo, IEdgeState } from '../../type/index';
import { getEndTangent } from '../../util/edge';
import Path from '../basic-shape/Path';
import BezierEdgeModel from '../../model/edge/BezierEdgeModel';

export default class BezierEdge extends BaseEdge {
  getEdge() {
    const { model } = this.props;
    const style = model.getEdgeStyle();
    return (
      <Path
        d={model.path}
        {
          ...style
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
        <Path
          d={model.path}
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
  // 扩大bezier曲线可点击范围
  getAppendWidth() {
    const {
      path,
    } = this.props.model;
    return (
      <Path
        d={path}
        strokeWidth={10}
        stroke="transparent"
        fill="none"
      />
    );
  }
  getArrowInfo(): ArrowInfo {
    const { model } = this.props;
    const { hover } = this.state as IEdgeState;
    const { path, isSelected } = model as BezierEdgeModel;
    const [ePre, end] = getEndTangent(path);
    const arrowInfo = {
      start: ePre,
      end,
      hover,
      isSelected,
    };
    return arrowInfo;
  }
}
