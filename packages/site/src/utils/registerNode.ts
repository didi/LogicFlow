import LogicFlow from '@logicflow/core';
import { Rect } from '../element/rect';

class CustomNode {
  lf: LogicFlow;

  constructor(lf: LogicFlow) {
    this.lf = lf;
  }

  // 注册所有的自定义节点
  registerAll() {
    this.registerRect();
    // ...
  }

  registerRect() {
    this.lf.registerElement('rect', Rect);
  }
}

export default CustomNode;
