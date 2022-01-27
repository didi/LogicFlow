import { h } from '@logicflow/core';
import { RectResize } from '../../NodeResize';

const defaultWidth = 500;
const defaultHeight = 300;

class GroupNodeModel extends RectResize.model {
  readonly isGroup = true;
  children: Set<string>;
  isRestrict: boolean; // 其子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
  resizable: boolean; // 分组节点是否允许调整大小。
  foldable: boolean; // 分组节点是否允许调整大小。
  foldedWidth: number;
  foldedHeight: number;
  unfoldedWidth = defaultWidth;
  unfoldedHight = defaultHeight;
  initNodeData(data): void {
    super.initNodeData(data);
    let children = [];
    if (Array.isArray(data.children)) {
      children = data.children;
    }
    // 初始化组的子节点
    this.children = new Set(children);
    this.width = defaultWidth;
    this.height = defaultHeight;
    this.foldedWidth = 80;
    this.foldedHeight = 60;
    // todo: 参考bpmn.js, 分组和未加入分组的节点重合时，未加入分组的节点在分组之下。方便标识。
    this.zIndex = -1;
    this.radius = 0;
    this.text.editable = false;
    this.text.draggable = false;
    this.isRestrict = false;
    this.resizable = false;
    this.autoToFront = false;
    this.foldable = false;
    this.properties.isFolded = false;
  }
  getResizeOutlineStyle() {
    const style = super.getResizeOutlineStyle();
    style.stroke = 'none';
    return style;
  }
  foldGroup(isFolded) {
    this.setProperty('isFolded', isFolded);
    if (isFolded) {
      this.x = this.x - this.width / 2 + this.foldedWidth / 2;
      this.y = this.y - this.height / 2 + this.foldedHeight / 2;
      this.unfoldedWidth = this.width;
      this.unfoldedHight = this.height;
      this.width = this.foldedWidth;
      this.height = this.foldedHeight;
    } else {
      this.width = this.unfoldedWidth;
      this.height = this.unfoldedHight;
      this.x = this.x + this.width / 2 - this.foldedWidth / 2;
      this.y = this.y + this.height / 2 - this.foldedHeight / 2;
    }
    // 移动分组上的连线
    const inCommingEdges = this.graphModel.getNodeIncomingEdge(this.id);
    const outgoingEdges = this.graphModel.getNodeOutgoingEdge(this.id);
    inCommingEdges.concat(outgoingEdges).forEach((edgeModel) => {
      this.graphModel.deleteEdgeById(edgeModel.id);
      if (!edgeModel.isFoldedEdge) {
        const isCommingEdge = edgeModel.targetNodeId === this.id;
        const data = edgeModel.getData();
        if (isCommingEdge) {
          data.endPoint = undefined;
        } else {
          data.startPoint = undefined;
        }
        data.pointsList = undefined;
        this.graphModel.addEdge(data);
      }
    });
    this.children.forEach((elementId) => {
      const nodeModel = this.graphModel.getElement(elementId);
      nodeModel.visible = !isFolded;
      this.foldEdge(elementId, isFolded);
    });
  }
  /**
   * 折叠分组的时候，处理分组内部子节点上的连线
   * 1. 为了保证校验规则不被打乱，所以只隐藏子节点上面的连线。
   * 2. 重新创建一个属性一样的边。
   * 3. 这个边拥有virtual=true的属性，表示不支持直接修改此边内容。
   */
  private foldEdge(nodeId, isFolded) {
    const inCommingEdges = this.graphModel.getNodeIncomingEdge(nodeId);
    const outgoingEdges = this.graphModel.getNodeOutgoingEdge(nodeId);
    inCommingEdges.concat(outgoingEdges).forEach((edgeModel, index) => {
      edgeModel.visible = !isFolded;
      if (isFolded
        && (
          !this.children.has(edgeModel.targetNodeId)
          || !this.children.has(edgeModel.sourceNodeId)
        )
      ) {
        const isCommingEdge = edgeModel.targetNodeId === nodeId;
        if (isFolded) {
          const data = edgeModel.getData();
          data.id = `${data.id}__${index}`;
          if (isCommingEdge) {
            data.endPoint = undefined;
            data.targetNodeId = this.id;
          } else {
            data.startPoint = undefined;
            data.sourceNodeId = this.id;
          }
          data.text = data.text?.value;
          data.pointsList = undefined;
          const model = this.graphModel.addEdge(data);
          model.virtual = true;
          // 强制不保存group连线数据
          model.getData = () => null;
          model.text.editable = false;
          model.isFoldedEdge = true;
        }
      }
    });
  }
  isInRange({ x1, y1, x2, y2 }) {
    return x1 >= (this.x - this.width / 2)
    && x2 <= (this.x + this.width / 2)
    && y1 >= (this.y - this.height / 2)
    && y2 <= (this.y + this.height / 2);
  }
  setAllowAppendChild(isAllow) {
    this.setProperty('groupAddable', isAllow);
  }
  /**
   * 添加分组子节点
   * @param id 节点id
   */
  addChild(id) {
    this.children.add(id);
  }
  /**
   * 删除分组子节点
   * @param id 节点id
   */
  removeChild(id) {
    this.children.delete(id);
  }
  getAddableOutlineStyle() {
    return {
      stroke: '#FEB663',
      strokeWidth: 2,
      strokeDasharray: '4 4',
      fill: 'transparent',
    };
  }
  getData() {
    const data = super.getData();
    data.children = [...this.children];
    const { properties } = data;
    delete properties.groupAddable;
    delete properties.isFolded;
    return data;
  }
}
class GroupNode extends RectResize.view {
  getControlGroup() {
    const { resizable, properties } = this.props.model;
    return resizable && !properties.isFolded ? super.getControlGroup() : null;
  }
  getAddedableShape() {
    const { width, height, x, y, radius, properties } = this.props.model;
    if (!properties.groupAddable) return null;
    const { strokeWidth } = this.props.model.getNodeStyle();
    const style: Record<string, any> = this.props.model.getAddableOutlineStyle();
    const newWidth = width + strokeWidth + 8;
    const newHeight = height + strokeWidth + 8;
    return h('rect', {
      ...style,
      width: newWidth,
      height: newHeight,
      x: x - newWidth / 2,
      y: y - newHeight / 2,
      rx: radius,
      ry: radius,
    });
  }
  getFoldIcon() {
    const { model } = this.props;
    const foldX = model.x - model.width / 2 + 5;
    const foldY = model.y - model.height / 2 + 5;
    if (!model.foldable) return null;
    const iconIcon = h('path', {
      fill: 'none',
      stroke: '#818281',
      strokeWidth: 2,
      'pointer-events': 'none',
      d: model.properties.isFolded
        ? `M ${foldX + 3},${foldY + 6} ${foldX + 11},${foldY + 6} M${foldX + 7},${foldY + 2} ${foldX + 7},${foldY + 10}`
        : `M ${foldX + 3},${foldY + 6} ${foldX + 11},${foldY + 6} `,
    });
    return h('g',
      {},
      [
        h('rect', {
          height: 12,
          width: 14,
          rx: 2,
          ry: 2,
          strokeWidth: 1,
          fill: '#F4F5F6',
          stroke: '#CECECE',
          cursor: 'pointer',
          x: model.x - model.width / 2 + 5,
          y: model.y - model.height / 2 + 5,
          onClick: () => {
            model.foldGroup(!model.properties.isFolded);
          },
        }),
        iconIcon,
      ]);
  }
  getResizeShape() {
    return h('g', {}, [
      this.getAddedableShape(),
      super.getResizeShape(),
      this.getFoldIcon(),
    ]);
  }
}

export default {
  type: 'group',
  view: GroupNode,
  model: GroupNodeModel,
};
