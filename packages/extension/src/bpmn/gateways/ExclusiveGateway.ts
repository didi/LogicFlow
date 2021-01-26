import { getBpmnId } from '../getBpmnId';
import {
  PolygonNodeModelContractor,
  PolygonNodeViewContractor,
  ExclusiveGatewayAttribute,
} from '../../type.d';

export const getExclusiveGateway = (
  PolygonNodeModel: PolygonNodeModelContractor,
): PolygonNodeModelContractor => {
  class ExclusiveGatewayModel extends PolygonNodeModel {
    static extendKey = 'ExclusiveGatewayModel';
    constructor(data, graphModel) {
      if (!data.id) {
        data.id = `Gateway_${getBpmnId()}`;
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
  return ExclusiveGatewayModel;
};

export const getExclusiveGatewayView = (
  PolygonNode: PolygonNodeViewContractor, h,
): PolygonNodeViewContractor => {
  class ExclusiveGatewayNode extends PolygonNode {
    static extendKey = 'ExclusiveGatewayNode';
    getShape() {
      const attributes = super.getAttributes() as ExclusiveGatewayAttribute;
      const {
        x, y, fill, stroke, strokeWidth, width, height, points,
      } = attributes;
      return h(
        'g',
        {
          transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
        },
        h(
          'polygon',
          {
            fill,
            x,
            y,
            stroke,
            strokeWidth,
            points,
          },
        ),
        h('path', {
          fill,
          stroke,
          strokeWidth,
          d: 'm 16,15 7.42857142857143,9.714285714285715 -7.42857142857143,9.714285714285715 3.428571428571429,0 5.714285714285715,-7.464228571428572 5.714285714285715,7.464228571428572 3.428571428571429,0 -7.42857142857143,-9.714285714285715 7.42857142857143,-9.714285714285715 -3.428571428571429,0 -5.714285714285715,7.464228571428572 -5.714285714285715,-7.464228571428572 -3.428571428571429,0 z',
        }),
      );
    }
  }
  return ExclusiveGatewayNode;
};
