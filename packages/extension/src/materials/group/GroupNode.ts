import { RectNode, RectNodeModel } from '@logicflow/core';

class GroupNodeModel extends RectNodeModel {
  readonly isGroup = true;
  children = new Set();
  isRestrict = true; // 其子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
  setAttributes() {
    this.width = 500;
    this.height = 200;
    this.strokeWidth = 1;
    this.zIndex = 0;
    this.radius = 0;
  }
  /**
   * 设置是否允许子节点被拖动移除分组
   */
  setIsRestrict(isRestrict) {
    this.isRestrict = isRestrict;
  }
  isInRange({ x1, y1, x2, y2 }) {
    return x1 >= (this.x - this.width / 2)
    && x2 <= (this.x + this.width / 2)
    && y1 >= (this.y - this.height / 2)
    && y2 <= (this.y + this.height / 2);
  }
  // todo: 更好的方式定义分组的样式
  setAllowAppendChild(isAllow) {
    if (isAllow) {
      this.stroke = 'red';
    } else {
      this.stroke = 'rgb(24, 125, 255)';
    }
  }
  addChild(id) {
    this.children.add(id);
  }
  removeChild(id) {
    this.children.delete(id);
  }
  getData() {
    const data = super.getData();
    data.children = [...this.children];
    return data;
  }
}
class GroupNode extends RectNode {
  /**
   * 重新toFront，阻止其置顶
   */
  toFront() {}
}

export default {
  type: 'group',
  view: GroupNode,
  model: GroupNodeModel,
};
