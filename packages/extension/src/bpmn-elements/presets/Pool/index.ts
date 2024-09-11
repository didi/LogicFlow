import LogicFlow from '@logicflow/core'
import PoolNode from './Pool'
import LaneNode from './Lane'

export function laneToJSON(data: any) {
  return `<bpmn:participant id="${data.id}" name="${data.name}" processRef="${data.properties.processRef}"/>`
}

export function poolToJSON(data: any) {
  return `<bpmn:collaboration id="${data.id}">
  ${data.children.map((child: any) => child.toJSON(child)).join('\t\n')}
</bpmn:collaboration>`
}

function poolEvent(lf: any) {
  const selectAll = () => {
    const { nodes = [], edges = [] } = lf.getGraphData()
    nodes.forEach((node: any) => {
      const { id } = node
      if (id) {
        lf.selectElementById(id)
      }
    })
    edges.forEach((edge: any) => {
      const { id } = edge
      if (id) {
        lf.selectElementById(id)
      }
    })
    return false
  }

  lf.keyboard.on('cmd + a', selectAll)
  lf.keyboard.on('ctrl + a', selectAll)
  lf.on('node:dnd-add, edge:add', ({ data }: any) => {
    const { x, y, type, id } = data
    if (type === 'pool') {
      lf.setProperties(data.id, {})
      const poolModel = lf.getNodeModelById(id)
      const { width, height } = poolModel
      const { id: laneId } = lf.addNode({
        type: 'lane',
        properties: {
          nodeSize: {
            width: width - 30,
            height,
          },
        },
        x: x + 15,
        y,
      })
      poolModel.addChild(laneId)
    }
  })
  lf.on('node:resize', ({ preData, data }: any) => {
    const { id, type } = preData
    const deltaHeight = data.height - preData.height
    // const resizeDir = data.y - preData.y > 0 ? 'below': 'above'
    // 节点高度变高，y下移， 方向为below
    // 节点高度变高， y上移， 方向为above
    // 节点高度变小， y下移， 方向为above
    // 节点高度变小， y上移，方向为below
    let resizeDir = 'below'
    if (deltaHeight > 0 && data.y - preData.y < 0) {
      resizeDir = 'above'
    } else if (deltaHeight < 0 && data.y - preData.y > 0) {
      resizeDir = 'above'
    }
    if (type === 'pool') {
      // 泳池缩放，泳道一起调整
      lf.getNodeModelById(id).resizeChildren({
        resizeDir,
        deltaHeight,
      })
    } else if (type === 'lane') {
      // 泳道缩放， 调整泳池
      const groupId = lf.extension.group.nodeGroupMap.get(id)
      if (groupId) {
        lf.getNodeModelById(groupId).resize(id, data)
      }
    }
  })
}

export const registerPoolNodes = (lf: LogicFlow) => {
  lf.register(PoolNode)
  lf.register(LaneNode)
  poolEvent(lf)
}
