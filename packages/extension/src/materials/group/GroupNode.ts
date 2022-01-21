import { RectNode, RectNodeModel } from '@logicflow/core';

class GroupNodeModel extends RectNodeModel {
  readonly isGroup = true;
  children: Set<string>;
  isRestrict: boolean; // 其子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
  initNodeData(data): void {
    super.initNodeData(data);
    let children = [];
    if (Array.isArray(data.children)) {
      children = data.children;
    }
    // 初始化组的子节点
    this.children = new Set(children);
    this.isRestrict = false;
  }
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
  /**
   * 添加分组子节点
   * @param id 节点id
   */
  addChild(id) {
    this.beforeAddChild(() => {
      this.children.add(id);
    });
  }
  /**
   * 删除分组子节点
   * @param id 节点id
   */
  removeChild(id) {
    this.beforeRemoveChild(() => {
      this.children.delete(id);
    });
  }
  getData() {
    const data = super.getData();
    data.children = [...this.children];
    return data;
  }
  beforeAddChild(next) {
    next();
  }
  beforeRemoveChild(next) {
    next();
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
