import { h } from '@logicflow/core';
import { DiamondResize } from '@logicflow/extension';
import { BaseNodeModel } from '@logicflow/core';

type PointTuple = [number, number];

export type ExclusiveGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[] & string;
};
const ICONSIZE = 25

class ExclusiveGatewayModel extends DiamondResize.model {
  // @ts-ignore
  constructor(data, graphModel) {
    data.text = {
      value: (data.text && data.text.value) || '',
      x: data.x,
      y: data.y + 40
    }
    super(data, graphModel)
  }
  setAttributes() {
    this.rx = ICONSIZE;
    this.ry = ICONSIZE;
  }
}

class ExclusiveGatewayView extends DiamondResize.view {
  getResizeShape() {
    const { x, y, points } = this.props.model;
    const style = this.props.model.getNodeStyle();
    const pointsPath = points.map((point: PointTuple) => point.join(',')).join(' ');
    return h(
      'g',
      {},
      h('polygon', {
        ...style,
        points: pointsPath,
      }),
      h('path', {
        ...style,
        transform: `matrix(1 0 0 1 ${x - ICONSIZE} ${y - ICONSIZE})`,
        d:
          'm 16,15 7.42857142857143,9.714285714285715 -7.42857142857143,9.714285714285715 3.428571428571429,0 5.714285714285715,-7.464228571428572 5.714285714285715,7.464228571428572 3.428571428571429,0 -7.42857142857143,-9.714285714285715 7.42857142857143,-9.714285714285715 -3.428571428571429,0 -5.714285714285715,7.464228571428572 -5.714285714285715,-7.464228571428572 -3.428571428571429,0 z',
      }),
    );
  }
}

const ExclusiveGateway = {
  type: 'bpmn:exclusiveGateway',
  view: ExclusiveGatewayView,
  model: ExclusiveGatewayModel,
};

export { ExclusiveGatewayView, ExclusiveGatewayModel };
export default ExclusiveGateway;
