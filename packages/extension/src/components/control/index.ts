import LogicFlow, { Extension } from "@logicflow/core";

type ControlItem = {
  key: string;
  iconClass: string;
  title: string;
  text: string;
  onClick?: Function;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
}

interface ControlPlugin extends Extension {
  name: string,
  __lf?: LogicFlow;
  __controlItems: ControlItem[];
  addItem: (item: ControlItem) => void;
  removeItem: (key: string) => ControlItem;
  install: (lf) => void;
  render: (lf, domContainer) => void;
  __getControlTool: () => HTMLElement;
};

const Control: ControlPlugin = {
  name: 'control',
  __lf: null,
  __controlItems: [
    {
      key: 'zoom-out',
      iconClass: 'lf-control-zoomOut',
      title: '缩小流程图',
      text: '缩小',
      onClick: () => { Control.__lf.zoom(false); },
    },
    {
      key: 'zoom-in',
      iconClass: 'lf-control-zoomIn',
      title: '放大流程图',
      text: '放大',
      onClick: () => { Control.__lf.zoom(true); },
    },
    {
      key: 'reset',
      iconClass: 'lf-control-fit',
      title: '恢复流程原有尺寸',
      text: '适应',
      onClick: () => { Control.__lf.resetZoom(); },
    },
    {
      key: 'undo',
      iconClass: 'lf-control-undo',
      title: '回到上一步',
      text: '上一步',
      onClick: () => { Control.__lf.undo(); },
    },
    {
      key: 'redo',
      iconClass: 'lf-control-redo',
      title: '移到下一步',
      text: '下一步',
      onClick: () => { Control.__lf.redo(); },
    },
  ],
  addItem(item) {
    Control.__controlItems.push(item);
  },
  removeItem(key) {
    const index = Control.__controlItems.findIndex(item => item.key === key);
    return Control.__controlItems.splice(index, 1)[0];
  },
  install() { },
  render(lf, domContainer) {
    Control.__lf = lf;
    this.__domContainer = domContainer;
    this.__tool = this.__getControlTool();
    domContainer.appendChild(this.__tool);
  },
  destroy() {
    this.__domContainer.removeChild(this.__tool);
  },
  __getControlTool(): HTMLElement {
    const NORMAL = 'lf-control-item';
    const DISABLED = 'lf-control-item disabled';
    const controlTool = document.createElement('div');
    const controlElements = [];
    controlTool.className = 'lf-control';
    Control.__controlItems.forEach((item) => {
      const itemContainer = document.createElement('div');
      const icon = document.createElement('i');
      const text = document.createElement('span');
      itemContainer.className = DISABLED;
      item.onClick && (itemContainer.onclick = item.onClick.bind(null, Control.__lf));
      item.onMouseEnter && (itemContainer.onmouseenter = item.onMouseEnter.bind(null, Control.__lf));
      item.onMouseLeave && (itemContainer.onmouseleave = item.onMouseLeave.bind(null, Control.__lf));
      icon.className = item.iconClass;
      text.className = 'lf-control-text';
      text.title = item.title;
      text.innerText = item.text;
      itemContainer.append(icon, text);
      switch (item.text) {
        case '上一步':
          Control.__lf.on('history:change', ({ data: { undoAble } }) => {
            itemContainer.className = undoAble ? NORMAL : DISABLED;
          });
          break;
        case '下一步':
          Control.__lf.on('history:change', ({ data: { redoAble } }) => {
            itemContainer.className = redoAble ? NORMAL : DISABLED;
          });
          break;
        default:
          itemContainer.className = NORMAL;
          break;
      }
      controlElements.push(itemContainer);
    });
    controlTool.append(...controlElements);
    return controlTool;
  },
};

export default Control;

export {
  Control,
};
