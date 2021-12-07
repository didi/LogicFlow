import _ from 'lodash-es';
import { h, PolygonNode, PolygonNodeModel } from '@logicflow/core';

class NodeSelectionView extends PolygonNode {
  d = 10;
  getShapeStyle() {
    // 设置边框为虚线
    const style = super.getShapeStyle();
    // @ts-ignore
    style.strokeDashArray = '10 5';

    return style;
  }

  getLabelShape() {
    const attributes = super.getAttributes();
    const {
      x, // 元素中心点
      y, // 元素中心点
      width,
      height,
      stroke,
      id,
      properties: {
        label_text: labelText,
      },
    } = attributes;

    return h(
      'svg',
      {
        x: x - width / 2,
        y: y - height / 2,
        style: 'z-index: 0; background: none; overflow: auto;',
      },
      labelText ? h('text', {
        x: 0,
        y: -5,
        width: 50,
        height: 24,
        fontSize: '16px',
        fill: stroke,
      }, '方案') : '',
      labelText ? h('text', {
        x: 50,
        y: -5,
        width: 50,
        height: 24,
        fontSize: '24px',
        cursor: 'pointer',
        fill: stroke,
        onclick: this.handleCustomDeleteIconClick.bind(this, id),
      }, 'x') : '',
    );
  }

  getShape() {
    const attributes = super.getAttributes();
    const {
      x, // 元素中心点
      y, // 元素中心点
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      strokeDashArray,
      id,
    } = attributes;

    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        fill,
        stroke,
        strokeWidth,
        width,
        height,
        strokeDashArray,
        id,
      }),
      this.getLabelShape(),
    ]);
  }
  toFront() { }

  /**
   * 点击删除
   * @param id
   */
  handleCustomDeleteIconClick(id) {
    const { graphModel } = this.props;
    graphModel.deleteNode(id);
  }
}

class NodeSelectionModel extends PolygonNodeModel {
  d = 10;

  setAttributes() {
    // 默认不显示
    this.points = [];

    this.text = {
      value: '',
      x: 0,
      y: 0,
      draggable: false,
      editable: false,
    };
    this.stroke = this.properties.active_color || '#008000';
    this.zIndex = 0;
    this.draggable = false;
    this.anchorsOffset = [[0, 0]];

    if (this.properties.node_selection_ids.length > 1) {
      setTimeout(() => {
        this.updatePointsByNodes(this.properties.node_selection_ids);
      });
    }
  }

  getAnchorsByOffset() {
    return [];
  }

  /**
   * 更新points
   * @param points
   */
  updatePoints(points) {
    this.points = points;
  }

  /**
   * 更新x y
   */
  updateCoordinate({ x, y }) {
    this.x = x;
    this.y = y;
  }

  /**
   * 更新points
   */
  updatePointsByNodes(nodesIds) {
    // TODO: 临时方案矩形
    const points = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodesIds.forEach((id) => {
      const model = this.graphModel.getNodeModel(id);
      if (!model) return;
      const { width, height, x, y } = model;
      minX = Math.min(minX, x - width / 2 - this.d);
      minY = Math.min(minY, y - height / 2 - this.d);
      maxX = Math.max(maxX, x + width / 2 + this.d);
      maxY = Math.max(maxY, y + height / 2 + this.d);
    });
    points.push([minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]);

    if ([minX, minY, maxX, maxY].some(n => Math.abs(n) === Infinity)) return;

    this.updatePoints(points);
    this.updateCoordinate({ x: ((maxX + minX) / 2), y: (maxY + minY) / 2 });
  }
}

class NodeSelection {
  static pluginName = 'node-selection';
  lf = null; // lf 实例
  selectNodes = []; // 选择的nodes
  currentClickNode = null; // 当前点击的节点，选中的节点是无序的
  d = 10;

  constructor({ lf }) {
    lf.register({
      type: 'node-selection',
      view: NodeSelectionView,
      model: NodeSelectionModel,
    });
  }

  /**
   * 获取所选node的id数组
   */
  get selectNodesIds() {
    return this.selectNodes.map(node => node.id);
  }

  /**
   * 新建node-selection节点
   */
  addNodeSelection() {
    this.lf.addNode({
      type: 'node-selection',
      text: '',
      properties: {
        node_selection_ids: this.selectNodesIds,
      },
    });

    this.lf.getNodeModel(id).updatePointsByNodes(this.selectNodesIds);
  }

  /**
   * 删除node-selection节点
   */
  deleteNodeSelection() {
    const nodeSelection = this.getNodeSelection();
    if (!nodeSelection) return;
    this.lf.deleteNode(nodeSelection.id);
  }

  /**
   * 更新node-selection节点
   */
  updateNodeSelection() {
    const nodeSelection = this.getNodeSelection();
    if (!nodeSelection) return;
    this.lf.setProperties(nodeSelection.id, {
      node_selection_ids: this.selectNodesIds,
    });

    this.lf.getNodeModel(nodeSelection.id).updatePointsByNodes(this.selectNodesIds);
  }

  /**
   * 获取所属的node-selection
   */
  getNodeSelection() {
    const ids = this.selectNodesIds;
    const rawData = this.lf.getGraphRawData();

    const oldIds = ids.filter(id => id !== this.currentClickNode.id);
    return rawData.nodes.find(node => {
      if (node.type === 'node-selection') {
        const nodeSelectionIds = _.get(node, 'properties.node_selection_ids', []);
        return oldIds.every((id) => nodeSelectionIds.includes(id));
      }
      return false;
    });
  }

  render(lf) {
    this.lf = lf;

    lf.on('node:click', (val) => {
      if (!val.e.shiftKey) return;
      this.currentClickNode = val.data;
      // 如果selectNodesIds中已存在此节点，则取消选中次节点
      let isUnSelected = false;
      if (this.selectNodesIds.includes(val.data.id)) {
        this.lf.getNodeModel(val.data.id).setSelected(false);
        isUnSelected = true;
      }

      // 获取所有被选中的节点，获取到的数组是无序的
      const { nodes } = lf.getSelectElements(true);
      this.selectNodes = nodes;

      if (this.selectNodes.length === 1) {
        if (isUnSelected) this.deleteNodeSelection();
      } else {
        if (!isUnSelected && this.selectNodes.length === 2) {
          this.addNodeSelection();
          return;
        }
        this.updateNodeSelection();
      }
    });
  }
}

export default NodeSelection;

export {
  NodeSelection,
};
