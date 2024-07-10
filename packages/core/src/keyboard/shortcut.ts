import { isArray } from 'lodash-es'
import LogicFlow from '../LogicFlow'
import GraphModel from '../model/GraphModel'
import { TextMode } from '../constant'

import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData

let selected: LogicFlow.GraphData | null = null

function translationNodeData(nodeData: NodeData, distance: number) {
  nodeData.x += distance
  nodeData.y += distance
  if (nodeData.textMode === TextMode.LABEL && isArray(nodeData.label)) {
    nodeData.label.forEach((item) => {
      item.x += distance
      item.y += distance
    })
  }
  if (nodeData.textMode === TextMode.TEXT && nodeData.text) {
    nodeData.text.x += distance
    nodeData.text.y += distance
  }
  return nodeData
}

function translationEdgeData(edgeData: EdgeData, distance: number) {
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
  if (edgeData.textMode === TextMode.LABEL && edgeData.label) {
    edgeData.label.forEach((item) => {
      item.x += distance
      item.y += distance
    })
  }
  if (edgeData.textMode === TextMode.TEXT && edgeData.text) {
    edgeData.text.x += distance
    edgeData.text.y += distance
  }
  return edgeData
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
      translationNodeData(node, TRANSLATION_DISTANCE),
    )
    selected.edges.forEach((edge) =>
      translationEdgeData(edge, TRANSLATION_DISTANCE),
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
        translationNodeData(node, TRANSLATION_DISTANCE),
      )
      selected.edges.forEach((edge) =>
        translationEdgeData(edge, TRANSLATION_DISTANCE),
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
