import { v4 as uuidV4 } from 'uuid'
import LogicFlow from '../LogicFlow'

import GraphConfigData = LogicFlow.GraphConfigData

export const createUuid = (): string => uuidV4()

/**
 * 重新刷新流程图的所有id
 */
export const refreshGraphId = (
  graphData: GraphConfigData,
  prefix = '',
): GraphConfigData => {
  const nodeIdMap = graphData.nodes.reduce((nMap, node) => {
    nMap[node.id] = prefix + uuidV4()
    node.id = nMap[node.id]
    return nMap
  }, {})
  graphData.edges.forEach((edge) => {
    edge.id = prefix + uuidV4()
    edge.sourceNodeId = nodeIdMap[edge.sourceNodeId]
    edge.targetNodeId = nodeIdMap[edge.targetNodeId]
  })
  return graphData
}
