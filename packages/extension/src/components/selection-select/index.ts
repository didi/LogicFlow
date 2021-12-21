import LogicFlow, { PointTuple } from '@logicflow/core';

class SelectionSelect {
  __domContainer: HTMLElement;
  wrapper: HTMLElement;
  lf: LogicFlow;
  startPoint: {
    x: number,
    y: number,
  };
  endPoint: {
    x: number,
    y: number,
  };
  __disabled = false;
  isDefalutStopMoveGraph = false;
  static pluginName = 'selection-select';
  constructor({ lf }) {
    this.lf = lf;
    // 初始化isDefalutStopMoveGraph取值
    const { stopMoveGraph } = lf.getEditConfig();
    this.isDefalutStopMoveGraph = stopMoveGraph;
    lf.openSelectionSelect = () => {
      if (!stopMoveGraph) {
        this.isDefalutStopMoveGraph = false;
        lf.updateEditConfig({
          stopMoveGraph: true,
        });
      }
      this.open();
    };
    lf.closeSelectionSelect = () => {
      if (!this.isDefalutStopMoveGraph) {
        lf.updateEditConfig({
          stopMoveGraph: false,
        });
      }
      this.close();
    };
  }
  render(lf, domContainer) {
    this.__domContainer = domContainer;
    lf.on('blank:mousedown', ({ e }) => {
      const config = lf.getEditConfig();
      // 鼠标控制滚动移动画布的时候，不能选区。
      if (!config.stopMoveGraph || this.__disabled) {
        return;
      }
      const {
        domOverlayPosition: { x, y },
      } = lf.getPointByClient(e.clientX, e.clientY);
      this.startPoint = { x, y };
      this.endPoint = { x, y };
      const wrapper = document.createElement('div');
      wrapper.className = 'lf-selection-select';
      wrapper.style.top = `${this.startPoint.y}px`;
      wrapper.style.left = `${this.startPoint.x}px`;
      domContainer.appendChild(wrapper);
      this.wrapper = wrapper;
      document.addEventListener('mousemove', this.__draw);
      document.addEventListener('mouseup', this.__drawOff);
    });
  }
  __draw = (ev) => {
    const {
      domOverlayPosition: { x: x1, y: y1 },
    } = this.lf.getPointByClient(ev.clientX, ev.clientY);
    this.endPoint = { x: x1, y: y1 };
    const { x, y } = this.startPoint;
    const { style } = this.wrapper;
    let left = x;
    let top = y;
    let width = x1 - x;
    let height = y1 - y;
    if (x1 < x) {
      left = x1;
      width = x - x1;
    }
    if (y1 < y) {
      top = y1;
      height = y - y1;
    }
    style.left = `${left}px`;
    style.top = `${top}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
  };
  __drawOff = () => {
    document.removeEventListener('mousemove', this.__draw);
    document.removeEventListener('mouseup', this.__drawOff);
    this.__domContainer.removeChild(this.wrapper);
    const { x, y } = this.startPoint;
    const { x: x1, y: y1 } = this.endPoint;
    const lt: PointTuple = [Math.min(x, x1), Math.min(y, y1)];
    const rt: PointTuple = [Math.max(x, x1), Math.max(y, y1)];
    const elements = this.lf.getAreaElement(lt, rt);
    elements.forEach((element) => {
      this.lf.selectElementById(element.id, true);
    });
    this.lf.emit('selection:selected', elements);
  };
  open() {
    this.__disabled = false;
  }
  close() {
    this.__disabled = true;
  }
}

export { SelectionSelect };
