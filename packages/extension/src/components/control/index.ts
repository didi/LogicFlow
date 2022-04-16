import LogicFlow from '@logicflow/core';

type ControlItem = {
  key: string;
  iconClass: string;
  title: string;
  text: string;
  onClick?: Function;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
};

class Control {
  private lf: LogicFlow;
  private LogicFlow: any;
  static pluginName = 'control';
  private controlItems: ControlItem[];
  private domContainer: HTMLElement;
  private toolEl: HTMLElement;
  constructor(args) {
    this.lf = args.lf;
    this.LogicFlow = args.LogicFlow;
    this.controlItems = [
      {
        key: 'zoom-out',
        iconClass: 'lf-control-zoomOut',
        title: this.LogicFlow.t('缩小流程图'),
        text: this.LogicFlow.t('缩小'),
        onClick: () => {
          this.lf.zoom(false);
        },
      },
      {
        key: 'zoom-in',
        iconClass: 'lf-control-zoomIn',
        title: this.LogicFlow.t('放大流程图'),
        text: this.LogicFlow.t('放大'),
        onClick: () => {
          this.lf.zoom(true);
        },
      },
      {
        key: 'reset',
        iconClass: 'lf-control-fit',
        title: this.LogicFlow.t('恢复流程原有尺寸'),
        text: this.LogicFlow.t('适应'),
        onClick: () => {
          this.lf.resetZoom();
        },
      },
      {
        key: 'undo',
        iconClass: 'lf-control-undo',
        title: this.LogicFlow.t('回到上一步'),
        text: this.LogicFlow.t('上一步'),
        onClick: () => {
          this.lf.undo();
        },
      },
      {
        key: 'redo',
        iconClass: 'lf-control-redo',
        title: this.LogicFlow.t('移到下一步'),
        text: this.LogicFlow.t('下一步'),
        onClick: () => {
          this.lf.redo();
        },
      },
    ];
  }
  render(lf, domContainer) {
    this.destroy();
    const toolEl = this.getControlTool();
    this.toolEl = toolEl;
    domContainer.appendChild(toolEl);
    this.domContainer = domContainer;
  }
  destroy() {
    if (this.domContainer && this.toolEl && this.domContainer.contains(this.toolEl)) {
      this.domContainer.removeChild(this.toolEl);
    }
  }
  addItem(item) {
    this.controlItems.push(item);
  }
  removeItem(key) {
    const index = this.controlItems.findIndex((item) => item.key === key);
    return this.controlItems.splice(index, 1)[0];
  }
  private getControlTool(): HTMLElement {
    const NORMAL = 'lf-control-item';
    const DISABLED = 'lf-control-item disabled';
    const controlTool = document.createElement('div');
    const controlElements = [];
    controlTool.className = 'lf-control';
    this.controlItems.forEach((item) => {
      const itemContainer = document.createElement('div');
      const icon = document.createElement('i');
      const text = document.createElement('span');
      itemContainer.className = DISABLED;
      item.onClick && (itemContainer.onclick = item.onClick.bind(null, this.lf));
      item.onMouseEnter && (itemContainer.onmouseenter = item.onMouseEnter.bind(null, this.lf));
      item.onMouseLeave && (itemContainer.onmouseleave = item.onMouseLeave.bind(null, this.lf));
      icon.className = item.iconClass;
      text.className = 'lf-control-text';
      text.title = item.title;
      text.innerText = item.text;
      itemContainer.append(icon, text);
      switch (item.text) {
        case '上一步':
          this.lf.on('history:change', ({ data: { undoAble } }) => {
            itemContainer.className = undoAble ? NORMAL : DISABLED;
          });
          break;
        case '下一步':
          this.lf.on('history:change', ({ data: { redoAble } }) => {
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
  }
}

export default Control;

export { Control };
