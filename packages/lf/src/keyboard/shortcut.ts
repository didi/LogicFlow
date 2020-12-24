import LogicFlow from '../LogicFlow';
import GraphModel from '../model/GraphModel';

let selected = null;

export function initShortcut(lf: LogicFlow, graph: GraphModel) {
  const { keyboard } = lf;
  const { options: { keyboard: keyboardOptions } } = keyboard;

  // 复制
  keyboard.on(['cmd + c', 'ctrl + c'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    const node = graph.getSelected();
    selected = node;
    return false;
  });
  // 粘贴
  keyboard.on(['cmd + v', 'ctrl + v'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    if (selected) {
      selected = graph.cloneNode(selected.id);
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
    const node = graph.getSelected();
    if (node) {
      lf.deleteNode(node.id);
    }
    const edge = graph.getSelectedEdge();
    if (edge) {
      lf.removeEdge({ id: edge.id });
    }
    return false;
  });
}
