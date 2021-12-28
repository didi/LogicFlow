import { CircleNode, CircleNodeModel, h } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class EndEventModel extends CircleNodeModel {
  static extendKey = 'EndEventModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Event_${getBpmnId()}`;
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
  }
  setAttributes(): void {
    this.r = 18;
  }
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules();
    const notAsSource = {
      message: '结束节点不能作为边的起点',
      validate: () => false,
    };
    rules.push(notAsSource);
    return rules;
  }
}

class EndEventView extends CircleNode {
  static extendKey = 'EndEventView';
  getAnchorStyle() {
    return {
      visibility: 'hidden',
    };
  }
  getShape() {
    const { model } = this.props;
    const style = model.getNodeStyle();
    const { x, y, r } = model;
    const outCircle = super.getShape();
    return h(
      'g',
      {},
      outCircle,
      h('circle', {
        ...style,
        cx: x,
        cy: y,
        r: r - 5,
      }),
    );
  }
}

const EndEvent = {
  type: 'bpmn:endEvent',
  view: EndEventView,
  model: EndEventModel,
};

export { EndEventView, EndEventModel };
export default EndEvent;
