import LogicFlow from '@logicflow/core';
import { serviceTaskIcon, userTaskIcon } from '../icons';
import { TaskNodeFactory } from './task';
import { SubProcessFactory } from './subProcess';

function boundaryEvent(lf: any) {
  const nodeBoundaryMap: any = new Map<any, any>();

  lf.on('node:drag,node:dnd-drag', checkAppendBoundaryEvent);
  lf.on('node:drop,node:dnd-add', appendBoundaryEvent);
  lf.graphModel.addNodeMoveRules(
    (
      model: { isTaskNode: any; boundaryEvents: any },
      deltaX: any,
      deltaY: any,
    ) => {
      if (model.isTaskNode) {
        // 如果移动的是分组，那么分组的子节点也跟着移动。
        const nodeIds = model.boundaryEvents;
        lf.graphModel.moveNodes(nodeIds, deltaX, deltaY, true);
        return true;
      }
      return true;
    },
  );
  function appendBoundaryEvent(this: any, { data }: any) {
    const preBoundaryNodeId = nodeBoundaryMap.get(data.id);
    const closeNodeId = checkAppendBoundaryEvent({ data });
    if (closeNodeId) {
      const taskNodeModel = lf.graphModel.getNodeModelById(closeNodeId);
      taskNodeModel.setIsCloseToBoundary(false);
      taskNodeModel.addBoundaryEvent(data.id);
      const boundaryNodeModel = lf.graphModel.getNodeModelById(data.id);
      boundaryNodeModel.setProperties({
        attachedToRef: closeNodeId,
      });
      nodeBoundaryMap.set(data.id, closeNodeId);
    }
    if (preBoundaryNodeId !== closeNodeId) {
      const preNodeModel = lf.graphModel.getNodeModelById(preBoundaryNodeId);
      if (preNodeModel) {
        preNodeModel.deleteBoundaryEvent(data.id);
      }
    }
  }
  // 判断此节点是否在某个节点的边界上
  // 如果在，且这个节点model存在属性isTaskNode，则调用这个方法
  function checkAppendBoundaryEvent(this: any, { data }: any) {
    const { x, y, id, type } = data;
    if (type !== 'bpmn:boundaryEvent') {
      return;
    }
    const { nodes } = lf.graphModel;
    let closeNodeId = '';
    for (let i = 0; i < nodes.length; i++) {
      const nodeModel = nodes[i];
      if (nodeModel.isTaskNode && nodeModel.id !== id) {
        if (isCloseNodeEdge(nodeModel, x, y) && !closeNodeId) {
          // 同时只允许在一个节点的边界上
          nodeModel.setIsCloseToBoundary(true);
          closeNodeId = nodeModel.id;
        } else {
          nodeModel.setIsCloseToBoundary(false);
        }
      }
    }
    return closeNodeId;
  }
  function isCloseNodeEdge(
    nodeModel: { x: number; width: number; y: number; height: number },
    x: number,
    y: number,
  ) {
    if (
      Math.abs(Math.abs(nodeModel.x - x) - nodeModel.width / 2) < 10
      && y >= nodeModel.y - nodeModel.height / 2 - 10
      && y <= nodeModel.y + nodeModel.height / 2 + 10
    ) {
      return true;
    }
    if (
      Math.abs(Math.abs(nodeModel.y - y) - nodeModel.height / 2) < 10
      && x >= nodeModel.x - nodeModel.width / 2 - 10
      && x <= nodeModel.x + nodeModel.width / 2 + 10
    ) {
      return true;
    }
    return false;
  }
}

export function registerTaskNodes(lf: LogicFlow) {
  const ServiceTask = TaskNodeFactory('bpmn:serviceTask', serviceTaskIcon);
  const UserTask = TaskNodeFactory('bpmn:userTask', userTaskIcon);

  lf.register(ServiceTask);
  lf.register(UserTask);
  lf.register(SubProcessFactory());

  boundaryEvent(lf);
}
