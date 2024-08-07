import LogicFlow from '@logicflow/core'
import Hierarchy from '@antv/hierarchy'
import MarkEntity from './markEntity'
import FakerRoot from './fakerRoot'
import MarkRoot from './markRoot'
import MarkContent from './markContent'
import MarkContentOption from './markContentOption'
import { theme } from './theme'

import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig

export const ROOT_NODE = 'mark:root'
export const FAKER_NODE = 'faker:root'
const FIRST_ROOT_X = 10
const FIRST_ROOT_Y = 10

class MindMap {
  static pluginName = 'MindMap'
  lf: any

  constructor({ lf }) {
    this.lf = lf
    lf.adapterIn = this.adapterIn
    lf.adapterOut = this.adapterOut

    lf.setTheme(theme)
    lf.register(FakerRoot)
    lf.register(MarkRoot)
    lf.register(MarkContent)
    lf.register(MarkContentOption)
    lf.register(MarkEntity)
    lf.setDefaultEdgeType('bezier')
    lf.updateEditConfig({
      hideAnchors: true,
      adjustNodePosition: false,
      edgeTextEdit: false,
      adjustEdge: false,
    })
    lf.graphModel.transformModel.translate(200, 200)
    this.setContextMenu()
    /**
     * 删除树上的某一个点和这个点后面所有的点
     */
    lf.removeTreeNode = (nodeId) => {
      const { nodesMap } = this.getGraphTreeData()
      const node = nodesMap.get(nodeId)
      if (node.type === ROOT_NODE) {
        return
      }
      this.removeNode(node)
      this.renderTree()
    }
    /**
     * 重新排布树
     */
    lf.renderTree = () => {
      this.renderTree()
    }
    /**
     * 监听删除
     */
    this.lf.keyboard.on('backspace', () => {
      const { nodes } = this.lf.getSelectElements(true)
      if (nodes.length > 0) {
        this.lf.clearSelectElements()
        nodes.forEach((node) => {
          this.lf.removeTreeNode(node.id)
        })
      }
    })
  }

  setContextMenu() {
    const menuItem = [
      {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAA5NJREFUWEfNmOtRFEEQgHsiACIQIkAiADOQCMAI7I0AjOCaCMQIxAg4IlAjQCIQIhjrW3uuZvf2bmf2Vov+d3Xz+LbfPUFeuYS5+JqmOU1nxRhfzOzHHGdPAlTVwxDCaYzxvYicicj+BphnEbkLISxjjN/MjN9VUgWoqsB8FBHAkJ8ishSRXyLS11gCZ+0bX38rIp/MjPVFUgSoqmhoISKXIvIiIiYit6UXqepb/6grp7oWkZsSjY4Cuta+ighrAbOSg4fUg2uICHAXrvEPY766FVBV0dhnN+Xl2GFFNhMR/+g7EYki8m7buRsBM7gHzFOiNVXF357NDL/cKq5NIPHPjZCDgO4z92jOzHD2IlHVFqx0j/s2e4A8GfLpNUDf9N2D4axEc4m+FpB9rgwgH83spK+JIUBSQZvfan1uCqBDch+BSAoiiFbSAXS/eBxaWGLjqYAOiRaPReQot1ofMGnvsMa0u5g420uuxLU6WlwBuu/9nqq9TAvFQdK3iqqioFMzO0r/5YAp5xFNkwr9Lib2D1xjyAGhJzDI9pNkBkBKKlZsKFdA5ID88cXMdBLd35RRlQeH7umfkQNSdtbCvAZ2JkAseZxyYguYpZdzM6P8TJKZAMmDV2bWsiVAyhmljZq4qqNeW+n/SoVUsal5HTqDBrZTh1W1CjD1caWARCGCmUql074NArqZ8UH6s5rDOxD/zMQZ4GsIEmJgP3VEeRQzJyzNLJmp1ESrdTNpkHL3ZGbt3JMDkhgvzOygmsw37AqYZZOVq+WAqeXpRHIN7AyAFAmGMzqadvLrdzPtHDvVzDMAkuoOzIzs0UofsM1B+Rf8Lw1mM1Ankww1rHQy92Z2XgPnmWByLVZVGuXQb1aGWv6kxeqc6CZmqksvD0XfmJJzv5KtmTid5hfRfm+dWfu3+z5SVWeu2EaZmZZOai3FbRo76QkxNdWlMyOMXIaJiwGz8fbJe9G1x6VtgzuRxIWj03+mefZg4tHHIdccKWUj3EYT9y4Eci+EoIvF4qbIqUYWqSqZAjfgdWzr7F3yeET7RH3kgRJY6vXo08YQY9M0FzFGwHAhPvZ6bHocBcy0iQNTDvcADSHcxhgfxsyJn/ljJ1UCMEzKQ1TRRxYDep5Dm6QQLiPKEYIJ584vZB3+CFAawjAnvV9VO1cFmJvNCzudOMAAAZJeUtESgdJ2SF4+q59/R4NkjoDY9YzJGtz14tL9fwB50PM48Yfe+AAAAABJRU5ErkJggg==',
        className: 'lf-mindmap_addIcon',
        callback: (data) => {
          this.addChild(data)
        },
      },
    ]
    this.lf.setContextMenuByType(ROOT_NODE, menuItem)
    this.lf.setContextMenuByType('mark:entity', menuItem)
    this.lf.setContextMenuByType('mark:content', menuItem)
    this.lf.setContextMenuByType('mark:content-option', menuItem)
  }

  private addChild(data) {
    let type = 'mark:content-option'
    switch (data.type) {
      case ROOT_NODE:
        type = 'mark:entity'
        break
      case 'mark:entity':
        type = 'mark:content'
        break
      default:
        break
    }
    const nodeModel = this.lf.addNode({
      type,
      x: data.x,
      y: data.y,
    })
    this.lf.addEdge({
      sourceNodeId: data.id,
      targetNodeId: nodeModel.id,
    })
    this.renderTree()
  }

  private removeNode(node) {
    if (node.children && node.children.length > 0) {
      node.children.forEach((subNode) => {
        this.removeNode(subNode)
      })
    }
    this.lf.deleteNode(node.id)
  }

  private getGraphTreeData() {
    const graphData = this.lf.getGraphRawData()
    const nodesMap = new Map()
    const rootNodes: string[] = []
    let root: any = null
    graphData.nodes.forEach((node) => {
      const treeNode = {
        id: node.id,
        type: node.type,
        properties: node.properties,
        x: node.x,
        y: node.y,
        children: [],
      }
      nodesMap.set(node.id, treeNode)
      if (node.type === ROOT_NODE) {
        rootNodes.push(node.id)
      }
      if (node.type === FAKER_NODE) {
        root = treeNode
      }
    })

    graphData.edges.forEach((edge) => {
      const node = nodesMap.get(edge.sourceNodeId)
      node.children.push(nodesMap.get(edge.targetNodeId))
    })
    rootNodes.forEach((nodeId) => {
      root.children.push(nodesMap.get(nodeId))
    })
    return {
      root,
      nodesMap,
    }
  }

  private renderTree() {
    let graphData = this.lf.getGraphRawData()
    let tree = this.graphToTree(graphData)
    tree = this.layoutTree(tree)
    graphData = this.treeToGraph(tree)
    this.lf.graphModel.graphDataToModel(graphData)
  }

  private graphToTree(graphData) {
    let tree: any = null
    const nodesMap = new Map()
    const roots: any = []
    graphData.nodes.forEach((node) => {
      const treeNode = {
        id: node.id,
        type: node.type,
        properties: node.proerties,
        text: node.text,
        children: [],
      }
      nodesMap.set(node.id, treeNode)
      if (node.type === 'mark:root') {
        roots.push(node)
      }
      if (node.type === FAKER_NODE) {
        tree = treeNode
      }
    })
    graphData.edges.forEach((edge) => {
      const node = nodesMap.get(edge.sourceNodeId)
      node.children.push(nodesMap.get(edge.targetNodeId))
    })
    if (tree && tree.children) {
      tree.children = roots.map((root: any) => nodesMap.get(root.id))
    }
    return tree
  }

  /**
   * 将树这种数据格式转换为图
   */
  private treeToGraph(rootNode) {
    const nodes: NodeConfig[] = []
    const edges: EdgeConfig[] = []

    function getNode(current, parent: any = null) {
      const node: NodeConfig = {
        id: current.id,
        x: current.x,
        y: current.y,
        type: current.type || current.data.type,
        properties: current.properties || {},
      }
      nodes.push(node)
      if (current.children) {
        current.children.forEach((subNode) => {
          getNode(subNode, node)
        })
      }
      if (parent && parent.type !== FAKER_NODE) {
        const edge: EdgeConfig = {
          sourceNodeId: parent.id,
          targetNodeId: node.id as string,
          type: 'bezier',
        }
        edges.push(edge)
      }
    }

    getNode(rootNode)
    return {
      nodes,
      edges,
    }
  }

  /**
   * 由于树这种数据格式本身是没有坐标的
   * 需要使用一些算法来将树转换为有坐标的树
   */
  layoutTree(tree) {
    if (!tree || !tree.children || tree.children.length === 0) return tree
    const NODE_SIZE = 40
    const PEM = 20
    tree.isRoot = true
    const rootNode = Hierarchy.compactBox(tree, {
      direction: 'LR',
      getId(d) {
        return d.id
      },
      getHeight(d) {
        if (d.type === ROOT_NODE) {
          return NODE_SIZE * 4
        }
        return NODE_SIZE
      },
      getWidth() {
        return 200 + PEM * 1.6
      },
      getHGap() {
        return PEM
      },
      getVGap() {
        return PEM
      },
      getSubTreeSep(d) {
        if (!d.children || !d.children.length) {
          return 0
        }
        return PEM
      },
    })
    // const { nodes, edges } = this.treeToGraph(rootNode);
    // 将根节点位置平移回原位置
    // 保证第一个根节点在画布位置不变
    // 为什么取第一个child呢，这里是因为一张图上存在多个树的情况下
    // 我们需要使用一个虚拟的节点(faker:root)作为所有树的根节点
    // 这样在使用树布局算法的时候方便统一处理。
    // 但是为了在视觉上保证图形不抖动，
    // 我们需要把第一个真实的根节点位置保持不动
    const x = tree.children[0].x || FIRST_ROOT_X
    const y = tree.children[0].y || FIRST_ROOT_Y
    const x1 = rootNode.children[0].x
    const y1 = rootNode.children[0].y
    const moveX = x - x1
    const moveY = y - y1
    const newTree = this.dfsTree(rootNode, (currentNode) => ({
      id: currentNode.id,
      x: currentNode.x + moveX,
      y: currentNode.y + moveY,
      type: currentNode.data.type,
    }))
    return newTree
  }

  /**
   * 遍历树的每一项，已传入的回调方法重新构建一个新的树
   */
  dfsTree(tree, callback) {
    const newTree = callback(tree)
    if (tree.children && tree.children.length > 0) {
      newTree.children = tree.children.map((treeNode) =>
        this.dfsTree(treeNode, callback),
      )
    }
    return newTree
  }

  /**
   * 将传入的数据转换为logicflow格式的数据
   */
  adapterIn = (trees) => {
    const tree = {
      id: 'faker:root',
      type: 'faker:root',
      x: 0,
      y: 0,
      children: trees,
    }
    const newtree = this.layoutTree(tree)
    const graphData = this.treeToGraph(newtree)
    return graphData
  }
  /**
   * 将logicflow格式的数据转换为mindmap需要的数据
   */
  adapterOut = (graphData) => this.graphToTree(graphData).children
}

export { MindMap }
