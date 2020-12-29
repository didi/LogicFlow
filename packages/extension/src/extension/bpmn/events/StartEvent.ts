import { getBpmnId } from '../getBpmnId';
import {
  CircleNodeModelContractor,
  CircleNodeViewContractor,
} from '../../../type.d';

export const getStartEventModel = (
  CircleNodeModel: CircleNodeModelContractor,
): CircleNodeModelContractor => {
  class StartEventModel extends CircleNodeModel {
    static extendKey = 'StartEventModel';
    constructor(data, graphModel) {
      if (!data.id) {
        data.id = `Event_${getBpmnId()}`;
      }
      if (data.text && typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y + 35,
        };
      }
      super(data, graphModel);
    }
    getConnectedTargetRules() {
      const rules = super.getConnectedTargetRules();
      const notAsTarget = {
        message: '起始节点不能作为连线的终点',
        validate: () => false,
      };
      rules.push(notAsTarget);
      return rules;
    }
  }
  return StartEventModel;
};

export const getStartEventView = (
  CircleNode: CircleNodeViewContractor,
): CircleNodeViewContractor => {
  class StartEventNode extends CircleNode {
    static extendKey = 'StartEventNode';
    getAttributes() {
      const attr = super.getAttributes();
      return {
        ...attr,
      };
    }
  }
  return StartEventNode;
};
