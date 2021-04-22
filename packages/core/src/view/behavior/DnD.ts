import { get } from 'lodash-es';
import LogicFlow from '../../LogicFlow';
import { BaseNodeModel } from '../../model';
import { TextConfig } from '../../type';
import { snapToGrid } from '../../util/geometry';

export type DndOptions = {
  validate: () => boolean
};

export type NewNodeConfig = {
  type: string;
  text?: TextConfig | string;
  properties?: Record<string, unknown>;
};

export default class Dnd {
  nodeConfig: NewNodeConfig;
  lf: LogicFlow;
  options: DndOptions;
  fakerNode: BaseNodeModel;
  constructor(params) {
    const { options, lf } = params;
    this.lf = lf;
    this.options = options;
  }
  clientToLocalPoint({ x, y }) {
    const gridSize = get(this.lf.options, ['grid', 'size']);
    // 处理 container 的 offset 等
    const position = this.lf.graphModel.getPointByClient({ x, y });
    // 处理缩放和偏移
    const { x: x1, y: y1 } = position.canvasOverlayPosition;
    // x, y 对齐到网格的 size
    return { x: snapToGrid(x1, gridSize), y: snapToGrid(y1, gridSize) };
  }

  startDrag(nodeConfig: NewNodeConfig) {
    this.nodeConfig = nodeConfig;
    window.document.addEventListener('mouseup', this.stopDrag);
  }
  stopDrag = () => {
    this.nodeConfig = null;
    window.document.removeEventListener('mouseup', this.stopDrag);
  };
  dragEnter = (e) => {
    if (!this.nodeConfig) return;
    this.fakerNode = this.lf.createFakerNode({
      ...this.nodeConfig,
      ...this.clientToLocalPoint({ x: e.clientX, y: e.clientY }),
    });
  };
  onDragOver = (e) => {
    e.preventDefault();
    if (this.fakerNode) {
      const { x, y } = this.clientToLocalPoint({ x: e.clientX, y: e.clientY });
      this.fakerNode.moveTo(x, y);
      const nodeData = this.fakerNode.getData();
      this.lf.setNodeSnapLine(nodeData);
    }
    return false;
  };
  onDragLeave = () => {
    if (this.fakerNode) {
      this.lf.removeNodeSnapLine();
      this.lf.graphModel.removeFakerNode();
      this.fakerNode = null;
    }
  };
  onDrop = (e) => {
    if (!this.lf.graphModel || !e || !this.nodeConfig) {
      return;
    }
    this.lf.addNode({
      ...this.nodeConfig,
      ...this.clientToLocalPoint({ x: e.clientX, y: e.clientY }),
    });
    e.preventDefault();
    e.stopPropagation();
    this.nodeConfig = null;
    this.lf.removeNodeSnapLine();
    this.lf.graphModel.removeFakerNode();
    this.fakerNode = null;
  };

  eventMap() {
    return {
      onMouseEnter: this.dragEnter,
      onMouseMove: this.onDragOver,
      onMouseLeave: this.onDragLeave,
      onMouseUp: this.onDrop,
    };
  }
}
