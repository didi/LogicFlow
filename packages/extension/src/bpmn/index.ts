// import LogicFlow from '@logicflow/core';
import StartEvent from './events/StartEvent';
import EndEvent from './events/EndEvent';
import ExclusiveGateway from './gateways/ExclusiveGateway';
import UserTask from './tasks/UserTask';
import ServiceTask from './tasks/ServiceTask';
import SequenceFlow from './flow/SequenceFlow';
import { theme } from './constant';

// todo: name
class BpmnElement {
  static pluginName = 'BpmnElement';
  constructor({ lf }) {
    lf.setTheme(theme);
    lf.register(StartEvent);
    lf.register(EndEvent);
    lf.register(ExclusiveGateway);
    lf.register(UserTask);
    lf.register(ServiceTask);
    lf.register(SequenceFlow);
    lf.setDefaultEdgeType('bpmn:sequenceFlow');
  }
}

export {
  BpmnElement,
};
