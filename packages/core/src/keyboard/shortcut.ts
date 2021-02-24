import LogicFlow from '../LogicFlow';
import GraphModel from '../model/GraphModel';
import { ElementType } from '../constant/constant';

let selected = null;

function translationNodeData(nodeData, distance) {
  nodeData.x += distance;
  nodeData.y += distance;
  if (nodeData.text) {
    nodeData.text.x += distance;
    nodeData.text.y += distance;
  }
  return nodeData;
}

function translationEdgeData(edgeData, distance) {
  if (edgeData.startPoint) {
    edgeData.startPoint.x += distance;
    edgeData.startPoint.y += distance;
  }
  if (edgeData.endPoint) {
    edgeData.endPoint.x += distance;
    edgeData.endPoint.y += distance;
  }
  if (edgeData.pointsList && edgeData.pointsList.length > 0) {
    edgeData.pointsList.forEach((point) => {
      point.x += distance;
      point.y += distance;
    });
  }
  if (edgeData.text) {
    edgeData.text.x += distance;
    edgeData.text.y += distance;
  }
  return edgeData;
}

/**
 * 获取选中的元素数据
 * @param selectElements 选中的元素实例
 * @param isIgnoreCheck 是否忽略检查连线必须存在对应的节点。
 */
function getSelectElements(selectElements, isIgnoreCheck = false) {
  const elements = selectElements;
  const graphData = {
    nodes: [],
    edges: [],
  };
  elements.forEach((element) => {
    if (element.BaseType === ElementType.NODE) {
      graphData.nodes.push(translationNodeData(element.getData(), TRANSLATION_DISTANCE));
    }
    if (element.BaseType === ElementType.EDGE) {
      const edgeData = element.getData();
      // 连线复制的时候，必须要求连线的起点和终点都在复制的内容中
      const isNodeSelected = elements.get(edgeData.sourceNodeId)
        && elements.get(edgeData.targetNodeId);

      if (isIgnoreCheck || isNodeSelected) {
        graphData.edges.push(translationEdgeData(edgeData, TRANSLATION_DISTANCE));
      }
    }
  });
  return graphData;
}

const TRANSLATION_DISTANCE = 40;

export function initShortcut(lf: LogicFlow, graph: GraphModel) {
  const { keyboard } = lf;
  const { options: { keyboard: keyboardOptions } } = keyboard;

  // 复制
  keyboard.on(['cmd + c', 'ctrl + c'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    selected = getSelectElements(graph.selectElements);
    return false;
  });
  // 粘贴
  keyboard.on(['cmd + v', 'ctrl + v'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    if (selected && (selected.nodes || selected.edges)) {
      lf.clearSelectElements();
      const addElements = lf.addElements(selected);
      addElements.nodes.forEach(node => lf.select(node.id, true));
      addElements.edges.forEach(edge => lf.select(edge.id, true));
      selected.nodes.forEach(node => translationNodeData(node, TRANSLATION_DISTANCE));
      selected.edges.forEach(edge => translationEdgeData(edge, TRANSLATION_DISTANCE));
    }
    return false;
  });
  // undo
  keyboard.on(['cmd + z', 'ctrl + z'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    lf.undo();
    return false;
  });
  // redo
  keyboard.on(['cmd + y', 'ctrl + y'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    lf.redo();
    return false;
  });
  // delete
  keyboard.on(['backspace'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    const elements = getSelectElements(graph.selectElements, true);
    lf.clearSelectElements();
    elements.edges.forEach(edge => lf.deleteEdge(edge.id));
    elements.nodes.forEach(node => lf.deleteNode(node.id));
    return false;
  });
}
