import { getBpmnId } from '../getBpmnId';
// import { CircleNodeModel } from 'logic-flow';
import {
  CircleNodeModelContractor,
  CircleNodeViewContractor,
  // EventEventModel,
} from '../../type/index';

export const getEndEventModel = (
  CircleNodeModel: CircleNodeModelContractor,
): CircleNodeModelContractor => {
  class EndEventModel extends CircleNodeModel {
    static extendKey = 'EndEventModel';
    constructor(data, graphModel) {
      if (!data.id) {
        data.id = `Event_${getBpmnId()}`;
      }
      if (!data.text) {
        data.text = {
          value: '',
          x: data.x,
          y: data.y,
        };
      }
      if (data.text && typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y,
        };
      }
      data.text.y += 40;
      super(data, graphModel);
    }
    getConnectedSourceRules() {
      const rules = super.getConnectedSourceRules();
      const notAsSource = {
        message: '结束节点不能作为连线的起点',
        validate: () => false,
      };
      rules.push(notAsSource);
      return rules;
    }
  }
  return EndEventModel;
};

export const getEndEventView = (
  CircleNode: CircleNodeViewContractor, h,
): CircleNodeViewContractor => {
  class EndEventNode extends CircleNode {
    getShape() {
      const {
        x, y, fill, stroke, strokeWidth, r,
      } = this.getAttributes();
      const outCircle = super.getShape();
      return h(
        'g',
        {},
        outCircle,
        h('circle', {
          cx: x,
          cy: y,
          fill,
          stroke,
          strokeWidth,
          r: r - 5,
        }),
      );
    }
  }
  return EndEventNode;
};
