import LogicFlow from '@logicflow/core';
import StartEvent from './events/StartEvent';
import EndEvent from './events/EndEvent';
import ExclusiveGateway from './gateways/ExclusiveGateway';
import UserTask from './tasks/UserTask';
import ServiceTask from './tasks/ServiceTask';
import SequenceFlow from './flow/SequenceFlow';
import { theme } from './constant';

const BpmnElement = {
  name: 'bpmn-element',
  install(lf: LogicFlow) {
    lf.setTheme(theme);
    lf.registerElement('bpmn:startEvent', StartEvent, false);
    lf.registerElement('bpmn:endEvent', EndEvent, false);
    lf.registerElement('bpmn:exclusiveGateway', ExclusiveGateway, false);
    lf.registerElement('bpmn:userTask', UserTask, false);
    lf.registerElement('bpmn:serviceTask', ServiceTask, false);
    lf.registerElement('bpmn:sequenceFlow', SequenceFlow, false);
    lf.setDefaultEdgeType('bpmn:sequenceFlow');
  },
};

export { BpmnElement };

export default BpmnElement;
