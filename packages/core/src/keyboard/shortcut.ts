import { isEmpty } from 'lodash-es'
import LogicFlow from '../LogicFlow'
import { map } from 'lodash-es'
import GraphModel from '../model/GraphModel'

import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig

let selected: LogicFlow.GraphData | null = null

export function translateNodeData(nodeData: NodeData, distance: number) {
  nodeData.x += distance
  nodeData.y += distance

  if (!isEmpty(nodeData.text)) {
    nodeData.text.x += distance
    nodeData.text.y += distance
  }

  return nodeData
}

export function translateEdgeData(edgeData: EdgeData, distance: number) {
  if (edgeData.startPoint) {
    edgeData.startPoint.x += distance
    edgeData.startPoint.y += distance
  }
  if (edgeData.endPoint) {
    edgeData.endPoint.x += distance
    edgeData.endPoint.y += distance
  }
  if (edgeData.pointsList && edgeData.pointsList.length > 0) {
    edgeData.pointsList.forEach((point) => {
      point.x += distance
      point.y += distance
    })
  }

  if (!isEmpty(edgeData.text)) {
    edgeData.text.x += distance
    edgeData.text.y += distance
  }
  return edgeData
}

export function transformNodeData(
  nodeData: NodeData,
  distance: number,
): NodeConfig {
  const { x, y, text } = nodeData
  // 重新计算 text 的位置，保证粘贴后 text 位置和复制的原节点相对位置一致
  const nextText = text
    ? {
        x: text.x + distance,
        y: text.y + distance,
        value: text.value,
      }
    : undefined

  return {
    ...nodeData,
    id: '',
    x: x + distance,
    y: y + distance,
    text: nextText,
  }
}

export function transformEdgeData(
  edgeData: EdgeData,
  distance: number,
): EdgeConfig {
  const { startPoint, endPoint, pointsList, text, ...edgeConfig } = edgeData
  // 清除原始边的 id
  edgeConfig.id = ''

  // 重新计算边的位置，包括 startPoint、endPoint、pointsList 以及 text
  // TODO: 看这个是否可以提出一个通用方法，用于重新计算边的位置
  const nextStartPoint = {
    x: startPoint.x + distance,
    y: startPoint.y + distance,
  }
  const nextEndPoint = {
    x: endPoint.x + distance,
    y: endPoint.y + distance,
  }
  const newPointsList: LogicFlow.Point[] = map(pointsList, (point) => {
    return {
      x: point.x + distance,
      y: point.y + distance,
    }
  })
  const nextText = text
    ? {
        ...text,
        x: text.x + distance,
        y: text.y + distance,
      }
    : undefined

  return {
    ...edgeConfig,
    startPoint: nextStartPoint,
    endPoint: nextEndPoint,
    pointsList: newPointsList,
    text: nextText,
  }
}

const TRANSLATION_DISTANCE = 40
let CHILDREN_TRANSLATION_DISTANCE = 40

export function initDefaultShortcut(lf: LogicFlow, graph: GraphModel) {
  const { keyboard } = lf
  const {
    options: { keyboard: keyboardOptions },
  } = keyboard

  // 复制
  keyboard.on(['cmd + c', 'ctrl + c'], () => {
    CHILDREN_TRANSLATION_DISTANCE = TRANSLATION_DISTANCE
    if (!keyboardOptions?.enabled) return true
    if (graph.textEditElement) return true
    const { guards } = lf.options
    const elements = graph.getSelectElements(false)
    const enabledClone =
      guards && guards.beforeClone ? guards.beforeClone(elements) : true
    if (
      !enabledClone ||
      (elements.nodes.length === 0 && elements.edges.length === 0)
    ) {
      selected = null
      return true
    }
    selected = elements
    selected.nodes.forEach((node) =>
      translateNodeData(node, TRANSLATION_DISTANCE),
    )
    selected.edges.forEach((edge) =>
      translateEdgeData(edge, TRANSLATION_DISTANCE),
    )
    return false
  })
  // 粘贴
  keyboard.on(['cmd + v', 'ctrl + v'], () => {
    if (!keyboardOptions?.enabled) return true
    if (graph.textEditElement) return true
    if (selected && (selected.nodes || selected.edges)) {
      lf.clearSelectElements()
      const addElements = lf.addElements(
        selected,
        CHILDREN_TRANSLATION_DISTANCE,
      )
      if (!addElements) return true
      addElements.nodes.forEach((node) => lf.selectElementById(node.id, true))
      addElements.edges.forEach((edge) => lf.selectElementById(edge.id, true))
      selected.nodes.forEach((node) =>
        translateNodeData(node, TRANSLATION_DISTANCE),
      )
      selected.edges.forEach((edge) =>
        translateEdgeData(edge, TRANSLATION_DISTANCE),
      )
      CHILDREN_TRANSLATION_DISTANCE =
        CHILDREN_TRANSLATION_DISTANCE + TRANSLATION_DISTANCE
    }
    return false
  })
  // undo
  keyboard.on(['cmd + z', 'ctrl + z'], () => {
    if (!keyboardOptions?.enabled) return true
    if (graph.textEditElement) return true
    lf.undo()
    return false
  })
  // redo
  keyboard.on(['cmd + y', 'ctrl + y'], () => {
    if (!keyboardOptions?.enabled) return true
    if (graph.textEditElement) return true
    lf.redo()
    return false
  })
  // delete
  keyboard.on(['backspace'], () => {
    if (!keyboardOptions?.enabled) return true
    if (graph.textEditElement) return true
    const elements = graph.getSelectElements(true)
    lf.clearSelectElements()
    elements.edges.forEach((edge) => edge.id && lf.deleteEdge(edge.id))
    elements.nodes.forEach((node) => node.id && lf.deleteNode(node.id))
    return false
  })
}
