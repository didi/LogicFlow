import { h } from '@logicflow/core';
import { RectResize } from '../../NodeResize';

class GroupNodeModel extends RectResize.model {
  readonly isGroup = true;
  children: Set<string>;
  isRestrict: boolean; // 其子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
  resizable: boolean; // 分组节点是否允许调整大小。
  initNodeData(data): void {
    super.initNodeData(data);
    let children = [];
    if (Array.isArray(data.children)) {
      children = data.children;
    }
    // 初始化组的子节点
    this.children = new Set(children);
    this.width = 500;
    this.height = 200;
    // todo: 参考bpmn.js, 分组和未加入分组的节点重合时，未加入分组的节点在分组之下。方便标识。
    this.zIndex = -1;
    this.radius = 0;
    this.text.editable = false;
    this.text.draggable = false;
    this.isRestrict = false;
    this.resizable = false;
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
    return data;
  }
}
class GroupNode extends RectResize.view {
  /**
   * 重新toFront，阻止其置顶
   */
  toFront() {}
  getControlGroup() {
    return this.props.model.resizable ? super.getControlGroup() : null;
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
  getResizeShape() {
    return h('g', {}, [
      this.getAddedableShape(),
      super.getResizeShape(),
    ]);
  }
}

export default {
  type: 'group',
  view: GroupNode,
  model: GroupNodeModel,
};
