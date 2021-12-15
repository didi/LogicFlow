import { h } from 'preact';
import BaseEdge from './BaseEdge';
import { ArrowInfo, IEdgeState } from '../../type/index';
import { getEndTangent } from '../../util/edge';
import Path from '../basic-shape/Path';
import BezierEdgeModel from '../../model/edge/BezierEdgeModel';

export default class BezierEdge extends BaseEdge {
  getAttributes() {
    const attr = super.getAttributes();
    const { path } = this.props.model as BezierEdgeModel;
    return {
      ...attr,
      path,
    };
  }
  getShapeStyle() {
    const {
      graphModel,
    } = this.props;
    const style = super.getShapeStyle();
    return {
      ...style,
      ...graphModel.theme.bezier,
    };
  }
  getEdge() {
    const {
      path,
    } = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <Path
        d={path}
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
  // 扩大bezier曲线可点击范围
  getAppendWidth() {
    const {
      path,
    } = this.getAttributes();
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
