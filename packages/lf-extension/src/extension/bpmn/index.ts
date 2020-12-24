import { getStartEventView, getStartEventModel } from './events/StartEvent';
import { getEndEventModel, getEndEventView } from './events/EndEvent';
import { getExclusiveGateway, getExclusiveGatewayView } from './gateways/ExclusiveGateway';
import { getUserTaskView, getUserTaskModel } from './tasks/UserTask';
import { getServiceTaskModel, getServiceTaskView } from './tasks/ServiceTask';
import { getSequenceFlowView, getSequenceFlowModel } from './flow/SequenceFlow';
import { theme } from './constant';

const BpmnElement = {
  install(lf) {
    lf.setTheme(theme);
    lf.register('bpmn:startEvent', this.registerStartEvent);
    lf.register('bpmn:endEvent', this.registerEndEvent);
    lf.register('bpmn:exclusiveGateway', this.registerExclusiveGateway);
    lf.register('bpmn:userTask', this.registerUserTask);
    lf.register('bpmn:serviceTask', this.registerServiceTask);
    lf.register('bpmn:sequenceFlow', this.registerSequenceFlow);
    lf.setDefaultEdgeType('bpmn:sequenceFlow');
  },
  registerStartEvent({ CircleNode, CircleNodeModel }) {
    return {
      model: getStartEventModel(CircleNodeModel),
      view: getStartEventView(CircleNode),
    };
  },
  registerEndEvent({ CircleNode, CircleNodeModel, h }) {
    return {
      model: getEndEventModel(CircleNodeModel),
      view: getEndEventView(CircleNode, h),
    };
  },
  registerExclusiveGateway({ PolygonNodeModel, PolygonNode, h }) {
    return {
      model: getExclusiveGateway(PolygonNodeModel),
      view: getExclusiveGatewayView(PolygonNode, h),
    };
  },
  registerUserTask({ RectNode, RectNodeModel, h }) {
    return {
      model: getUserTaskModel(RectNodeModel),
      view: getUserTaskView(RectNode, h),
    };
  },
  registerServiceTask({ RectNode, RectNodeModel, h }) {
    return {
      model: getServiceTaskModel(RectNodeModel),
      view: getServiceTaskView(RectNode, h),
    };
  },
  registerSequenceFlow({ PolylineEdge, PolylineEdgeModel }) {
    return {
      model: getSequenceFlowModel(PolylineEdgeModel),
      view: getSequenceFlowView(PolylineEdge),
    };
  },
};

export {
  BpmnElement,
};

export default BpmnElement;
