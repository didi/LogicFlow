import { v4 as uuidv4 } from 'uuid';
import { GraphConfigData } from '..';

export const createUuid = (): string => {
  const uuid = uuidv4();
  return uuid;
};
/**
 * 重新刷新流程图的所有id
 */
export const refreshGraphId = (graphData: GraphConfigData, prefix = ''): GraphConfigData => {
  const nodeIdMap = graphData.nodes.reduce((nMap, node) => {
    nMap[node.id] = prefix + uuidv4();
    node.id = nMap[node.id];
    return nMap;
  }, {});
  graphData.edges.forEach((edge) => {
    edge.id = prefix + uuidv4();
    edge.sourceNodeId = nodeIdMap[edge.sourceNodeId];
    edge.targetNodeId = nodeIdMap[edge.targetNodeId];
  });
  return graphData;
};
