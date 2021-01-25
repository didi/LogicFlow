import LogicFlow from '../LogicFlow';
import GraphModel from '../model/GraphModel';
import { ElementType } from '../constant/constant';

let selected = null;

export function initShortcut(lf: LogicFlow, graph: GraphModel) {
  const { keyboard } = lf;
  const { options: { keyboard: keyboardOptions } } = keyboard;

  // 复制
  keyboard.on(['cmd + c', 'ctrl + c'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    const element = graph.selectElement;
    if (element.BaseType === ElementType.NODE) {
      selected = element;
    }
    return false;
  });
  // 粘贴
  keyboard.on(['cmd + v', 'ctrl + v'], () => {
    if (!keyboardOptions.enabled) return;
    if (graph.textEditElement) return;
    if (selected) {
      const cloned = lf.cloneNode(selected.id);
      selected = cloned || selected;
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
    const element = graph.selectElement;
    if (element.BaseType === ElementType.NODE) {
      lf.deleteNode(element.id);
    }
    if (element.BaseType === ElementType.EDGE) {
      lf.deleteEdge(element.id);
    }
    return false;
  });
}
