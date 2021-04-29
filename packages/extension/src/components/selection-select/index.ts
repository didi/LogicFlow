import { Extension } from '@logicflow/core';

interface SelectionSelectPlugin extends Extension {
  open: () => void;
  close: () => void;
  [x: string]: any;
}

const SelectionSelect: SelectionSelectPlugin = {
  name: 'selection-select',
  __domContainer: null,
  wrapper: null,
  lf: null,
  startPoint: {
    x: 0,
    y: 0,
  },
  endPoint: {
    x: 0,
    y: 0,
  },
  __disabled: false,
  install() {},
  render(lf, domContainer) {
    SelectionSelect.__domContainer = domContainer;
    SelectionSelect.lf = lf;
    lf.on('blank:mousedown', ({ e }) => {
      const config = lf.getEditConfig();
      // 鼠标控制滚动移动画布的时候，不能选区。
      if (!config.stopMoveGraph || SelectionSelect.__disabled) {
        return;
      }
      const {
        domOverlayPosition: { x, y },
      } = lf.getPointByClient(e.clientX, e.clientY);
      SelectionSelect.startPoint = { x, y };
      SelectionSelect.endPoint = { x, y };
      const wrapper = document.createElement('div');
      wrapper.className = 'lf-selection-select';
      wrapper.style.top = `${SelectionSelect.startPoint.y}px`;
      wrapper.style.left = `${SelectionSelect.startPoint.x}px`;
      domContainer.appendChild(wrapper);
      SelectionSelect.wrapper = wrapper;
      document.addEventListener('mousemove', SelectionSelect.__draw);
      document.addEventListener('mouseup', SelectionSelect.__drawOff);
    });
  },
  __draw(ev) {
    const {
      domOverlayPosition: { x: x1, y: y1 },
    } = SelectionSelect.lf.getPointByClient(ev.clientX, ev.clientY);
    SelectionSelect.endPoint = { x: x1, y: y1 };
    const { x, y } = SelectionSelect.startPoint;
    const { style } = SelectionSelect.wrapper;
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
  },
  __drawOff() {
    document.removeEventListener('mousemove', SelectionSelect.__draw);
    document.removeEventListener('mouseup', SelectionSelect.__drawOff);
    SelectionSelect.__domContainer.removeChild(SelectionSelect.wrapper);
    const { x, y } = SelectionSelect.startPoint;
    const { x: x1, y: y1 } = SelectionSelect.endPoint;
    const lt = [Math.min(x, x1), Math.min(y, y1)];
    const rt = [Math.max(x, x1), Math.max(y, y1)];
    const elements = SelectionSelect.lf.getAreaElement(lt, rt);
    elements.forEach((element) => {
      SelectionSelect.lf.select(element.id, true);
    });
    SelectionSelect.lf.emit('selection:selected', elements);
  },
  open() {
    SelectionSelect.__disabled = false;
  },
  close() {
    SelectionSelect.__disabled = true;
  },
};

export { SelectionSelect };
