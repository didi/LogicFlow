import { v4 as uuidV4 } from 'uuid'
import { CommonTypes } from '../types/common'

export const createUuid = (): string => uuidV4()

/**
 * 重新刷新流程图的所有id
 */
export const refreshGraphId = (
  graphData: CommonTypes.GraphData,
  prefix = '',
): CommonTypes.GraphData => {
  const nodeIdMap =
    graphData.nodes?.reduce(
      (nMap, node) => {
        const newId = prefix + uuidV4()
        nMap[node.id!] = newId
        node.id = newId
        return nMap
      },
      {} as Record<string, string>,
    ) || {}

  graphData.edges?.forEach((edge) => {
    edge.id = prefix + uuidV4()
    if (edge.sourceNodeId) {
      edge.sourceNodeId = nodeIdMap[edge.sourceNodeId]
    }
    if (edge.targetNodeId) {
      edge.targetNodeId = nodeIdMap[edge.targetNodeId]
    }
  })
  return graphData
}
