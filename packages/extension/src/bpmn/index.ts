import LogicFlow from '@logicflow/core'
import { theme } from './constant'
import {
  StartEvent,
  StartEventView,
  StartEventModel,
  EndEvent,
  EndEventView,
  EndEventModel,
} from './events'
import { SequenceFlow, SequenceFlowView, SequenceFlowModel } from './flow'
import {
  ExclusiveGateway,
  ExclusiveGatewayView,
  ExclusiveGatewayModel,
} from './gateways'
import {
  UserTask,
  UserTaskView,
  UserTaskModel,
  ServiceTask,
  ServiceTaskView,
  ServiceTaskModel,
} from './tasks'

import ExtensionDefinition = LogicFlow.ExtensionDefinition

const BpmnElement: ExtensionDefinition = {
  pluginName: 'bpmnElement',

  install(lf) {
    lf.setTheme(theme)
    lf.register(StartEvent)
    lf.register(EndEvent)
    lf.register(ExclusiveGateway)
    lf.register(UserTask)
    lf.register(ServiceTask)
    // 支持自定义bpmn元素的边
    if (!lf.options.customBpmnEdge) {
      lf.register(SequenceFlow)
      lf.setDefaultEdgeType('bpmn:sequenceFlow')
    }
  },
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
}
