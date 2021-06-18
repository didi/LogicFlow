import LogicFlow from '@logicflow/core';

type ShapeItem = {
  type?: string;
  text?: string;
  icon?: string;
  className?: string;
  properties?: Record<string, any>;
  callback?: string;
};

class DndPanel {
  lf: LogicFlow;
  shapeList: ShapeItem[];
  panelEl: HTMLDivElement;
  static pluginName = 'DndPanel';
  constructor({ lf }) {
    this.lf = lf;
    this.lf.setPatternItems = (shapeList) => {
      this.shapeList = shapeList;
    };
  }
  render(lf, domContainer) {
    if (this.panelEl) {
      domContainer.removeChild(this.panelEl);
    }
    if (!this.shapeList || this.shapeList.length === 0) return;
    this.panelEl = document.createElement('div');
    this.panelEl.className = 'lf-dndpanel';
    this.shapeList.forEach(shapeItem => {
      this.panelEl.appendChild(this.createDndItem(shapeItem));
    });
    domContainer.appendChild(this.panelEl);
  }
  private createDndItem(shapeItem): HTMLElement {
    const el = document.createElement('div');
    el.className = shapeItem.className ? `lf-dnd-item ${shapeItem.className}` : 'lf-dnd-item';
    const shape = document.createElement('div');
    shape.className = 'lf-dnd-shape';
    if (shapeItem.icon) {
      shape.style.backgroundImage = `url(${shapeItem.icon})`;
    }
    el.appendChild(shape);
    if (shapeItem.text) {
      const text = document.createElement('div');
      text.innerText = shapeItem.text;
      text.className = 'lf-dnd-text';
      el.appendChild(text);
    }
    el.onmousedown = () => {
      if (shapeItem.type) {
        this.lf.dnd.startDrag({
          type: shapeItem.type,
          properties: shapeItem.properties,
        });
      }
      if (shapeItem.callback) {
        shapeItem.callback();
      }
    };
    return el;
  }
}

export {
  DndPanel,
};
