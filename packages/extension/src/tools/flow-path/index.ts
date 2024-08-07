/**
 * 路径插件，此插件支持获取绘制的图中所有的路径。
 * 需要指定开始节点类型。
 */

import LogicFlow from '@logicflow/core'
import { getBpmnId } from '../../bpmn/getBpmnId'

type Path = {
  routeId: string
  name: string
  elements: string[]
  type: number
}

type RawPath = Path & {
  similarElement: RawPath
  weight: number
}

type PathNodeData = {
  id: string
  data: any
  nextNodes: string[]
}

export class FlowPath {
  lf: LogicFlow
  paths: RawPath[]
  startNodeType?: string
  static pluginName = 'flowPath'

  constructor({ lf }) {
    this.lf = lf
    this.paths = []
    // 给lf添加方法
    lf.getPathes = () => {
      if (!this.startNodeType) {
        throw new Error('需要预先指定开始节点类型')
      }
      return this.getPathes()
    }

    lf.setRawPaths = (paths: Path[]) => {
      this.setPathes(paths)
    }

    lf.getRawPathes = () => this.paths

    lf.setStartNodeType = (type: string) => {
      this.startNodeType = type
    }
  }

  setPathes(paths) {
    this.paths = paths.map(({ routeId, name, elements, type }) => ({
      routeId,
      name,
      elements,
      type,
      similarElement: null,
      weight: 0,
    }))
  }

  getPathes() {
    const graphData = this.lf.getGraphRawData()
    const nodesMap: Map<string, PathNodeData> = new Map()
    const startNodeIds: string[] = []
    graphData.nodes.forEach((node) => {
      nodesMap.set(node.id, {
        id: node.id,
        data: node,
        nextNodes: [],
      })
      if (node.type === this.startNodeType) {
        startNodeIds.push(node.id)
      }
    })
    graphData.edges.forEach((edge) => {
      const node = nodesMap.get(edge.sourceNodeId)
      node?.nextNodes.push(edge.targetNodeId)
    })
    let pathElements: string[][] = []
    startNodeIds.forEach((id) => {
      const node = nodesMap.get(id)
      if (node) {
        pathElements = pathElements.concat(
          this.findPathElements(node, nodesMap, []),
        )
      }
    })
    return this.getNewPathes(pathElements)
  }

  private findPathElements(
    node: PathNodeData,
    nodesMap: Map<string, PathNodeData>,
    elements: string[] = [],
  ) {
    const newPaths: string[] = [...elements]
    newPaths.push(node.id)
    if (node.nextNodes.length === 0) {
      return [newPaths]
    }
    let subPath = []
    for (let i = 0; i < node.nextNodes.length; i++) {
      const n = nodesMap.get(node.nextNodes[i])
      let p
      // 循环路径
      if (n) {
        const idx = newPaths.indexOf(n.id)
        if (idx !== -1) {
          p = [[...newPaths.slice(idx), n.id]]
        } else {
          p = this.findPathElements(n, nodesMap, [...newPaths])
        }
        subPath = subPath.concat(p)
      }
    }
    return subPath
  }

  /**
   * 设置路径id
   * 如果存在原始路径Id, 则需要比较新路径是否在原始路径中存在相似路径
   * 如果有，则尽量使用原始路径。
   * 相似路径
   * 1. 如果所有的节点都相同，则必定为同一路径。(包括顺序不同)
   * 2. 如果新路径比原来路径少了或者多了部分节点，则记录为相似路径。基于不同的差异，标记不同的权重。
   * 3. 基于新路径在旧路径占用权限，设置新路径Id.
   * 4. 如果某一条旧路径被多条新路径标记为相同的权重，则这两条新路径都使用新Id.
   */
  private getNewPathes(pathElements) {
    const paths: any = []
    // 由于循环路径不包括开始，所以存在重复的情况，此处去重。
    const LoopSet = new Set()
    pathElements.forEach((elements) => {
      const routeId = this.getNewId('path')
      const name = this.getNewId('路径')
      const isLoop = this.isLoopPath(elements)
      const elementStr = elements.join(',')
      if (!LoopSet.has(elementStr)) {
        LoopSet.add(elementStr)
        paths.push({
          routeId,
          name,
          elements,
          type: isLoop,
          weight: 0,
          similarElement: '',
        })
      }
    })
    const oldPaths = JSON.parse(JSON.stringify(this.paths))
    // 1) 找到所有路径最相似的路径, 给旧路径标记其最接近的路径
    paths.forEach((newPath) => {
      for (let i = 0; i < oldPaths.length; i++) {
        const oldPath = oldPaths[i]
        const weight = this.similar2Path(
          [...newPath.elements],
          [...oldPath.elements],
        )
        if (weight > newPath.weight && oldPath.weight <= weight) {
          newPath.weight = weight
          newPath.similarElement = oldPath
          if (weight === oldPath.weight && oldPath.similarElement) {
            // 特殊处理，如果两个路径都与同一条旧路径有相似的权重，则这两个路径的相似路径都置空
            oldPath.similarElement.similarElement = null
            oldPath.similarElement.weight = 0
            oldPath.similarElement = null
            oldPath.weight = 0
          } else {
            oldPath.similarElement = newPath
            oldPath.weight = weight
          }
        }
      }
    })
    // 2) 再次遍历所有路径，如果该路径的相似路径对应的相似路径是自己，那么就设置该路径id和name为其相似路径。
    paths.forEach((newPath) => {
      if (
        newPath.similarElement &&
        newPath.similarElement.similarElement === newPath
      ) {
        newPath.routeId = newPath.similarElement.routeId
        newPath.name = newPath.similarElement.name
      }
      delete newPath.similarElement
      delete newPath.weight
    })

    this.setPathes(paths)
    return paths
  }

  private similar2Path(x, y) {
    let z = 0
    const s = x.length + y.length

    x.sort()
    y.sort()
    let a = x.shift()
    let b = y.shift()

    while (a !== undefined && b !== undefined) {
      if (a === b) {
        z++
        a = x.shift()
        b = y.shift()
      } else if (a < b) {
        a = x.shift()
      } else if (a > b) {
        b = y.shift()
      }
    }
    return (z / s) * 200
  }

  private getNewId(prefix) {
    return `${prefix}_${getBpmnId()}`
  }

  /**
   * 判断是否为循环路径
   * 由于前面进行了特殊处理，将循环部分单独提出来作为路径
   * 所有循环路径必定开始节点等于结束节点。
   */
  private isLoopPath(elements) {
    const { length } = elements
    return elements.indexOf(elements[length - 1]) !== length - 1 ? 1 : 0
  }
}
