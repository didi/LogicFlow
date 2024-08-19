import type { IExtension, INode, IEdge } from './types.d'
// import { v4 as uuidv4 } from 'uuid'
import { size, gap } from './confg'

interface IMiddleStartYMap {
  [key: string]: number
}

interface IMiddleTargetNodes {
  [curNodeId: string]: {
    sourceX: number
  }
}

export default class Graph {
  static pluginName = 'graph'

  lf

  constructor({ lf }: IExtension) {
    this.lf = lf
  }

  init() {
    const nodes = this.lf.graphModel.graphData.nodes
    const edges = this.lf.graphModel.graphData.edges
    const firstNodes = nodes.filter((node: INode) => node.properties.type === 'first')
    const middleNodes = nodes.filter((node: INode) => node.properties.type === 'middle')
    const landingNodes = nodes.filter((node: INode) => node.properties.type === 'landing')
    const nodesData: INode[] = []
    const startX = gap.margin + gap.padding
    const firstStartY = gap.margin + gap.padding
    let firstGroupHeight = 0
    const middleStartYMap: IMiddleStartYMap = {}

    const middleNodeIds = middleNodes.map((node: INode) => node.id)
    const middleTargetNodes: IMiddleTargetNodes = {}

    // 首跳节点
    for (let i = 0; i < firstNodes.length; i++) {
      const node = firstNodes[i]
      const nodeHeight = this.getNodeHeight(node.type)

      node.x = startX + (size.defaultNodeWidth + gap.nodeGap) * i + size.defaultNodeWidth * 0.5
      node.y = firstStartY + nodeHeight * 0.5
      nodesData.push(node)
      firstGroupHeight = Math.max(firstGroupHeight, gap.padding * 2 + nodeHeight)

      // 首跳的下一个中间跳节点
      const targetNodeId = edges.find((edge: IEdge) => edge.sourceNodeId === node.id).targetNodeId
      if (middleNodeIds.includes(targetNodeId)) {
        if (!middleTargetNodes[targetNodeId]) {
          middleTargetNodes[targetNodeId] = {
            sourceX: node.x
          }
        }
      }
    }

    // 中间跳节点
    middleStartYMap[0] = gap.margin * 2 + gap.padding + firstGroupHeight

    const createMddleNodes = (middleTargetNodes: IMiddleTargetNodes, yIndex: number) => {
      const nextMiddleTargetNodes: IMiddleTargetNodes = {}
      const nodeIds = Object.keys(middleTargetNodes)
      const nodeHeights: number[] = []
      for (const curNodeId in middleTargetNodes) {
        const curNodeValue = middleTargetNodes[curNodeId]
        const curNode = middleNodes.find((node: INode) => node.id === curNodeId)
        if (curNode) {
          const curNodeHeight = this.getNodeHeight(curNode.type)
          curNode.x = curNodeValue.sourceX
          curNode.y = middleStartYMap[yIndex] + curNodeHeight * 0.5
          nodesData.push(curNode)
          nodeHeights.push(curNodeHeight)

          const targetNodeId = edges.find(
            (edge: IEdge) => edge.sourceNodeId === curNode.id
          ).targetNodeId
          if (middleNodeIds.includes(targetNodeId)) {
            if (
              !nextMiddleTargetNodes[targetNodeId] &&
              nodesData.findIndex((node) => node.id === targetNodeId) < 0 &&
              !nodeIds.includes(targetNodeId)
            ) {
              nextMiddleTargetNodes[targetNodeId] = {
                sourceX: curNode.x
              }
            }
          }
        }
      }
      if (Object.keys(nextMiddleTargetNodes).length) {
        yIndex++
        middleStartYMap[yIndex] =
          middleStartYMap[yIndex - 1] + Math.max(...nodeHeights) + gap.padding
        createMddleNodes(nextMiddleTargetNodes, yIndex)
      }
    }

    createMddleNodes(middleTargetNodes, 0)

    this.lf.render({
      nodes: nodesData,
      edges: []
    })
  }

  getNodeHeight(type: string) {
    return type === 'analysisNode' ? size.analysisNodeHeight : size.defaultNodeHeight
  }

  sortByGroup(nodes: INode[]) {
    const sortObj = {
      first: 0,
      middle: 1,
      landing: 2
    }
    nodes.sort((a, b) => {
      const index1 = sortObj[a.properties!.type as keyof typeof sortObj]
      const index2 = sortObj[b.properties!.type as keyof typeof sortObj]
      return index1 - index2
    })
  }

  layout() {
    // console.log(this.lf.graphModel)
  }
}
