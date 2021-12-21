import { h, PolygonNode, PolygonNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';
import { ExclusiveGatewayAttribute } from '../../type/index';

class ExclusiveGatewayModel extends PolygonNodeModel {
  static extendKey = 'ExclusiveGatewayModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Gateway_${getBpmnId()}`;
    }
    if (!data.text) {
      data.text = '';
    }
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y + 40,
      };
    }
    super(data, graphModel);
    this.points = [
      [25, 0],
      [50, 25],
      [25, 50],
      [0, 25],
    ];
  }
}

class ExclusiveGatewayView extends PolygonNode {
  static extendKey = 'ExclusiveGatewayNode';
  getShape() {
    const { model } = this.props;
    const { x, y, width, height, points } = model;
    const style = model.getNodeStyle();
    return h(
      'g',
      {
        transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
      },
      h('polygon', {
        ...style,
        x,
        y,
        points,
      }),
      h('path', {
        d:
          'm 16,15 7.42857142857143,9.714285714285715 -7.42857142857143,9.714285714285715 3.428571428571429,0 5.714285714285715,-7.464228571428572 5.714285714285715,7.464228571428572 3.428571428571429,0 -7.42857142857143,-9.714285714285715 7.42857142857143,-9.714285714285715 -3.428571428571429,0 -5.714285714285715,7.464228571428572 -5.714285714285715,-7.464228571428572 -3.428571428571429,0 z',
        ...style,
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
