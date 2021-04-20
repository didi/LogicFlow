import { getStartEventView, getStartEventModel } from './events/StartEvent';
import { getEndEventModel, getEndEventView } from './events/EndEvent';
import { getExclusiveGateway, getExclusiveGatewayView } from './gateways/ExclusiveGateway';
import { getUserTaskView, getUserTaskModel } from './tasks/UserTask';
import { getServiceTaskModel, getServiceTaskView } from './tasks/ServiceTask';
import { getSequenceFlowView, getSequenceFlowModel } from './flow/SequenceFlow';
import { theme } from './constant';

const BpmnElement = {
  name: 'bpmn-element',
  install(lf) {
    lf.setTheme(theme);
    lf.register('bpmn:startEvent', this.registerStartEvent, false);
    lf.register('bpmn:endEvent', this.registerEndEvent, false);
    lf.register('bpmn:exclusiveGateway', this.registerExclusiveGateway, false);
    lf.register('bpmn:userTask', this.registerUserTask, false);
    lf.register('bpmn:serviceTask', this.registerServiceTask, false);
    lf.register('bpmn:sequenceFlow', this.registerSequenceFlow, false);
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
