import { EllipseResize } from '@logicflow/extension';
class StartEventModel extends EllipseResize.model {
  // @ts-ignore
  constructor(data, graphModel) {
    data.text = {
      value: (data.text && data.text.value) || '',
      x: data.x,
      y: data.y + 35,
    }
    super(data, graphModel)
  }
  setAttributes(){
    this.rx = 20;
    this.ry = 20;
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

class StartEventView extends EllipseResize.view {
}

const StartEvent = {
  type: 'bpmn:startEvent',
  view: StartEventView,
  model: StartEventModel,
};

export { StartEventModel, StartEventView };
export default StartEvent;
