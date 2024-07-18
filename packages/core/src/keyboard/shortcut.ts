import { isEmpty } from 'lodash-es'
import LogicFlow from '../LogicFlow'
import GraphModel from '../model/GraphModel'
import { ElementType, EventType } from '../constant'

import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData

let selected: LogicFlow.GraphData | null = null

function translationNodeData(
  nodeData: NodeData,
  distance: number,
  graph: GraphModel,
) {
  nodeData.x += distance
  nodeData.y += distance
  if (!isEmpty(nodeData.text)) {
    nodeData.text.x += distance
    nodeData.text.y += distance
  }

  // TODO: feature/label-text
  // 1. 如果 translationNodeData 外部调用了该方法，是否也应该触发该事件
  // 2. LABEL_SHOULD_UPDATE 事件，是否抛出 NODE_UPDATE 事件就可以
  graph.eventCenter.emit(EventType.LABEL_SHOULD_UPDATE, {
    model: {
      relateId: nodeData.id,
      deltaX: distance,
      deltaY: distance,
      BaseType: ElementType.NODE,
    },
  })
  return nodeData
}

function translationEdgeData(
  edgeData: EdgeData,
  distance: number,
  graph: GraphModel,
) {
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
  if (graph.useLabelText(edgeData)) {
    graph.eventCenter.emit(EventType.LABEL_SHOULD_UPDATE, {
      model: {
        relateId: edgeData.id,
        deltaX: distance,
        deltaY: distance,
        BaseType: ElementType.EDGE,
      },
    })
  } else if (!isEmpty(edgeData.text)) {
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
      translationNodeData(node, TRANSLATION_DISTANCE, graph),
    )
    selected.edges.forEach((edge) =>
      translationEdgeData(edge, TRANSLATION_DISTANCE, graph),
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
        translationNodeData(node, TRANSLATION_DISTANCE, graph),
      )
      selected.edges.forEach((edge) =>
        translationEdgeData(edge, TRANSLATION_DISTANCE, graph),
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
