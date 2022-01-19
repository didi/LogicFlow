// import LogicFlow from '@logicflow/core';
import StartEvent, { StartEventModel, StartEventView } from './events/StartEvent';
import EndEvent, { EndEventView, EndEventModel } from './events/EndEvent';
import ExclusiveGateway, { ExclusiveGatewayView, ExclusiveGatewayModel } from './gateways/ExclusiveGateway';
import UserTask, { UserTaskView, UserTaskModel } from './tasks/UserTask';
import ServiceTask, { ServiceTaskView, ServiceTaskModel } from './tasks/ServiceTask';
import SequenceFlow, { SequenceFlowView, SequenceFlowModel } from './flow/SequenceFlow';
import { theme } from './constant';

// todo: name
class BpmnElement {
  static pluginName = 'bpmnElement';
  constructor({ lf }) {
    lf.setTheme(theme);
    lf.register(StartEvent);
    lf.register(EndEvent);
    lf.register(ExclusiveGateway);
    lf.register(UserTask);
    lf.register(ServiceTask);
    // 支持自定义bpmn元素的边
    if (!lf.options.customBpmnEdge) {
      lf.register(SequenceFlow);
      lf.setDefaultEdgeType('bpmn:sequenceFlow');
    }
  }
}

export {
  BpmnElement,
  StartEventModel,
  StartEventView,
  EndEventView,
  EndEventModel,
  ExclusiveGatewayView,
  ExclusiveGatewayModel,
  UserTaskView,
  UserTaskModel,
  ServiceTaskView,
  ServiceTaskModel,
  SequenceFlowView,
  SequenceFlowModel,
};
