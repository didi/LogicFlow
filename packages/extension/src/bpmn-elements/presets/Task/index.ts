import LogicFlow from '@logicflow/core'
import { serviceTaskIcon, userTaskIcon } from '../icons'
import { TaskNodeFactory } from './task'
import { SubProcessFactory } from './subProcess'

function boundaryEvent(lf: any) {
  lf.on('node:drag,node:dnd-drag', checkAppendBoundaryEvent)
  lf.on('node:drop,node:dnd-add', appendBoundaryEvent)
  lf.graphModel.addNodeMoveRules(
    (
      model: { isTaskNode: any; boundaryEvents: any },
      deltaX: any,
      deltaY: any,
    ) => {
      if (model.isTaskNode) {
        // 如果移动的是分组，那么分组的子节点也跟着移动。
        const nodeIds = model.boundaryEvents
        lf.graphModel.moveNodes(nodeIds, deltaX, deltaY, true)
        return true
      }
      return true
    },
  )

  function appendBoundaryEvent(this: any, { data }: any) {
    const { type, id } = data
    if (type !== 'bpmn:boundaryEvent') {
      return
    }
    const { nodes } = lf.graphModel
    for (const node of nodes) {
      if (node.isTaskNode) {
        let nodeId = null
        if ((nodeId = isBoundaryEventCloseToTask(node, data)) !== null) {
          const eventModel = lf.graphModel.getNodeModelById(id)
          const nodeModel = lf.graphModel.getNodeModelById(nodeId)
          const { attachedToRef } = eventModel.properties
          if (attachedToRef && attachedToRef !== nodeId) {
            lf.graphModel
              .getNodeModelById(attachedToRef)
              .deleteBoundaryEvent(id)
          }
          nodeModel.addBoundaryEvent(id)
          return
        }
      }
    }
  }

  // 判断此节点是否在某个节点的边界上
  // 如果在，且这个节点model存在属性isTaskNode，则调用这个方法
  function checkAppendBoundaryEvent(this: any, { data }: any) {
    const { type } = data
    if (type !== 'bpmn:boundaryEvent') {
      return
    }
    const { nodes } = lf.graphModel
    for (const node of nodes) {
      if (node.isTaskNode) {
        if (isBoundaryEventCloseToTask(node, data)) {
          // 同时只允许在一个节点的边界上
          node.setTouching(true)
        } else {
          node.setTouching(false)
        }
      }
    }
  }

  function isBoundaryEventCloseToTask(task: any, event: any) {
    const offset = 5
    const { x: tx, y: ty, width: twidth, height: theight, id } = task
    const bbox = {
      minX: tx - twidth / 2,
      maxX: tx + twidth / 2,
      minY: ty - theight / 2,
      maxY: ty + theight / 2,
    }
    const { x: bx, y: by } = event
    const outerBBox = {
      minX: bbox.minX - offset,
      maxX: bbox.maxX + offset,
      minY: bbox.minY - offset,
      maxY: bbox.maxY + offset,
    }
    const innerBBox = {
      minX: bbox.minX + offset,
      maxX: bbox.maxX - offset,
      minY: bbox.minY + offset,
      maxY: bbox.maxY - offset,
    }
    if (
      bx > outerBBox.minX &&
      bx < outerBBox.maxX &&
      by > outerBBox.minY &&
      by < outerBBox.maxY
    ) {
      if (
        !(
          bx > innerBBox.minX &&
          bx < innerBBox.maxX &&
          by > innerBBox.minY &&
          by < innerBBox.maxY
        )
      ) {
        return id
      }
    }
    return null
  }
}

export function registerTaskNodes(lf: LogicFlow) {
  const ServiceTask = TaskNodeFactory('bpmn:serviceTask', serviceTaskIcon)
  const UserTask = TaskNodeFactory('bpmn:userTask', userTaskIcon)

  lf.register(ServiceTask)
  lf.register(UserTask)
  lf.register(SubProcessFactory())

  boundaryEvent(lf)
}
