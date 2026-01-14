// @ts-ignore
import LogicFlow from '@logicflow/core'
import { PoolNode } from './NewPool'
import { LaneNode } from './NewLane'
import CustomPoolNode from './Pool'
import CustomLaneNode from './Lane'

export function laneToJSON(data: any) {
  return `<bpmn:participant id="${data.id}" name="${data.name}" processRef="${data.properties.processRef}"/>`
}

export function poolToJSON(data: any) {
  return `<bpmn:collaboration id="${data.id}">
  ${data.children.map((child: any) => child.toJSON(child)).join('\t\n')}
</bpmn:collaboration>`
}

// function poolEvent(lf: any) {
//   const selectAll = () => {
//     const { nodes = [], edges = [] } = lf.getGraphData()
//     nodes.forEach((node: any) => {
//       const { id } = node
//       if (id) {
//         lf.selectElementById(id)
//       }
//     })
//     edges.forEach((edge: any) => {
//       const { id } = edge
//       if (id) {
//         lf.selectElementById(id)
//       }
//     })
//     return false
//   }

//   lf.keyboard.on('cmd + a', selectAll)
//   lf.keyboard.on('ctrl + a', selectAll)
//   lf.on('node:dnd-add, edge:add', ({ data }: any) => {
//     const { x, y, type, id } = data
//     if (type === 'pool') {
//       lf.setProperties(data.id, {})
//       const poolModel = lf.getNodeModelById(id)
//       const { width } = poolModel
//       const { id: laneId } = lf.addNode({
//         type: 'lane',
//         x: x + 15,
//         y,
//         width: width - 30,
//         height: 120,
//       })
//       poolModel.addChild(laneId)
//     }
//   })
//   lf.on('node:resize', ({ preData }: any) => {
//     const { id, type } = preData

//     if (type === 'lane') {
//       // 泳道缩放，通知泳池调整
//       // 安全地获取groupId，添加完整的空值检查
//       let groupId = null
//       try {
//         if (lf.extension?.group?.nodeGroupMap) {
//           groupId = lf.extension.group.nodeGroupMap.get(id)
//         }
//       } catch (error) {
//         console.error('Error getting group ID in node:resize event:', error)
//       }
//       if (groupId) {
//         const poolModel = lf.getNodeModelById(groupId)
//         if (poolModel) {
//           poolModel.resizeLanes()
//         }
//       }
//     }
//   })
// }

export const registerPoolNodes = (lf: LogicFlow) => {
  lf.register(PoolNode)
  lf.register(LaneNode)
  lf.register(CustomPoolNode)
  lf.register(CustomLaneNode)
  // poolEvent(lf)
}
