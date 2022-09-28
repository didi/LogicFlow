import { h } from '@logicflow/core';
import { RectResize } from '../../NodeResize';

const defaultWidth = 500;
const defaultHeight = 300;

class GroupNodeModel extends RectResize.model {
  readonly isGroup = true;
  /**
   * 此分组的子节点Id
   */
  children: Set<string>;
  /**
   * 其子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
   */
  isRestrict: boolean;
  /**
   * 分组节点是否允许调整大小。
   */
  resizable: boolean;
  /**
   * 分组节点是否允许折叠
   */
  foldable: boolean;
  /**
   * 折叠后的宽度
   */
  foldedWidth: number;
  /**
   * 折叠后的高度
   */
  foldedHeight: number;
  /**
   * 分组折叠状态
   */
  isFolded: boolean;
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
    // 是否可以被嵌套
    this.nestable = false;
    if (this.properties.isFolded === undefined) {
      this.properties.isFolded = false;
    }
    this.isFolded = this.properties.isFolded;
    // fixme: 虽然默认保存的分组不会收起，但是如果重写保存数据分组了，
    // 此处代码会导致多一个history记录
    setTimeout(() => {
      this.isFolded && this.foldGroup(this.isFolded);
    });
    // this.foldGroup(this.isFolded);
  }
  getResizeOutlineStyle() {
    const style = super.getResizeOutlineStyle();
    style.stroke = 'none';
    return style;
  }
  /**
   * 折叠分组
   * 1. 折叠分组的宽高
   * 2. 处理分组子节点
   * 3. 处理连线
   */
  foldGroup(isFolded) {
    this.setProperty('isFolded', isFolded);
    this.isFolded = isFolded;
    // step 1
    this.foldRect(isFolded);
    // step 2
    const allEdges = this.foldChildren(isFolded);
    // step 3
    console.log({ allEdges });
    this.foldEdge(isFolded, allEdges);
  }
  getAnchorStyle(anchorInfo) {
    const style = super.getAnchorStyle(anchorInfo);
    style.stroke = 'transparent';
    style.fill = 'transparent';
    style.hover.fill = 'transparent';
    style.hover.stroke = 'transparent';
    return style;
  }
  foldRect(isFolded) {
    if (isFolded) {
      this.unfoldedWidth = this.width;
      this.unfoldedHight = this.height;
      this.updateAttributes({
        x: this.x - this.width / 2 + this.foldedWidth / 2,
        y: this.y - this.height / 2 + this.foldedHeight / 2,
        width: this.foldedWidth,
        height: this.foldedHeight,
      });
    } else {
      this.updateAttributes({
        width: this.unfoldedWidth,
        height: this.unfoldedHight,
        x: this.x + this.unfoldedWidth / 2 - this.foldedWidth / 2,
        y: this.y + this.unfoldedHight / 2 - this.foldedHeight / 2,
      });
    }
  }
  foldChildren(isFolded) {
    let allEdges = this.incoming.edges.concat(this.outgoing.edges);
    this.children.forEach((elementId) => {
      const nodeModel = this.graphModel.getElement(elementId);
      if (nodeModel.isGroup) {
        const childEdges = nodeModel.foldChildren(isFolded || nodeModel.isFolded);
        allEdges = allEdges.concat(childEdges);
        nodeModel.foldEdge(isFolded, childEdges);
      }
      allEdges = allEdges.concat(nodeModel.incoming.edges.concat(nodeModel.outgoing.edges));
      nodeModel.updateAttributes({
        visible: !isFolded,
      });
    });
    return allEdges;
  }
  /**
   * 折叠分组的时候，处理分组自身的连线和分组内部子节点上的连线
   * 边的分类：
   *   - 虚拟边：分组被收起时，表示分组本身与外部节点关系的边。
   *   - 真实边：分组本身或者分组内部节点与外部节点节点（非收起分组）关系的边。
   * 如果一个分组，本身与外部节点有M条连线，且内部N个子节点与外部节点有连线，那么这个分组收起时会生成M+N条连线。
   * 折叠分组时：
   *   - 原有的虚拟边删除；
   *   - 创建一个虚拟边；
   *   - 真实边则隐藏；
   * 展开分组是：
   *   - 原有的虚拟边删除；
   *   - 如果目外部点是收起的分组，则创建虚拟边；
   *   - 如果外部节点是普通节点，则显示真实边；
   */
  private foldEdge(isFolded, allEdges) {
    allEdges.forEach((edgeModel, index) => {
      const {
        id,
        sourceNodeId,
        targetNodeId,
        startPoint,
        endPoint,
        type,
        properties,
        text,
      } = edgeModel;
      const data = {
        id: `${id}__${index}`,
        sourceNodeId,
        targetNodeId,
        startPoint,
        endPoint,
        type,
        properties,
        text: text?.value,
      };
      if (edgeModel.virtual) {
        this.graphModel.deleteEdgeById(edgeModel.id);
      }
      let targetNodeIdGroup = this.graphModel.group.getNodeGroup(targetNodeId);
      // 考虑目标节点本来就是分组的情况
      if (!targetNodeIdGroup) {
        targetNodeIdGroup = this.graphModel.getNodeModelById(targetNodeId);
      }
      let sourceNodeIdGroup = this.graphModel.group.getNodeGroup(sourceNodeId);
      if (!sourceNodeIdGroup) {
        sourceNodeIdGroup = this.graphModel.getNodeModelById(sourceNodeId);
      }
      // 折叠时，处理未被隐藏的边的逻辑
      if (isFolded && edgeModel.visible !== false) {
        // 需要确认此分组节点是新连线的起点还是终点
        // 创建一个虚拟边，虚拟边相对真实边，起点或者终点从一起分组内部的节点成为了分组，
        // 如果需要被隐藏的边的起点在需要折叠的分组中，那么设置虚拟边的开始节点为此分组
        if (this.children.has(sourceNodeId) || this.id === sourceNodeId) {
          data.startPoint = undefined;
          data.sourceNodeId = this.id;
        } else {
          data.endPoint = undefined;
          data.targetNodeId = this.id;
        }
        // 如果边的起点和终点都在分组内部，则不创建新的虚拟边
        if (targetNodeIdGroup.id !== this.id || sourceNodeIdGroup.id !== this.id) {
          this.createVirtualEdge(data);
        }
        edgeModel.updateAttributes({
          visible: false,
        });
      }
      // 展开时，处理被隐藏的边的逻辑
      if (!isFolded && edgeModel.visible === false) {
        // 展开分组时：判断真实边的起点和终点是否有任一节点在已折叠分组中，如果不是，则显示真实边。如果是，这修改这个边的对应目标节点id来创建虚拟边。
        if (targetNodeIdGroup && targetNodeIdGroup.isGroup && targetNodeIdGroup.isFolded) {
          data.targetNodeId = targetNodeIdGroup.id;
          data.endPoint = undefined;
          this.createVirtualEdge(data);
        } else if (sourceNodeIdGroup && sourceNodeIdGroup.isGroup && sourceNodeIdGroup.isFolded) {
          data.sourceNodeId = sourceNodeIdGroup.id;
          data.startPoint = undefined;
          this.createVirtualEdge(data);
        } else {
          edgeModel.updateAttributes({
            visible: true,
          });
        }
      }
    });
  }
  createVirtualEdge(edgeData) {
    edgeData.pointsList = undefined;
    const model = this.graphModel.addEdge(edgeData);
    model.virtual = true;
    // 强制不保存group连线数据
    // model.getData = () => null;
    model.text.editable = false;
    model.isFoldedEdge = true;
  }
  isInRange({ x1, y1, x2, y2 }) {
    return x1 >= (this.x - this.width / 2)
      && x2 <= (this.x + this.width / 2)
      && y1 >= (this.y - this.height / 2)
      && y2 <= (this.y + this.height / 2);
  }
  isAllowMoveTo({ x1, y1, x2, y2 }) {
    return {
      x: x1 >= (this.x - this.width / 2) && x2 <= (this.x + this.width / 2),
      y: y1 >= (this.y - this.height / 2) && y2 <= (this.y + this.height / 2),
    };
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
  /**
   * 获得包含嵌套组的所有子节点
   */
  getChildren() {
    return [...this.children].flatMap(child => {
      const model = this.graphModel.getElement(child);
      if (model.isGroup) {
        return [child, ...model.getChildren()];
      }
      return child;
    });
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
  getHistoryData() {
    const data = super.getData();
    data.children = [...this.children];
    const { properties } = data;
    delete properties.groupAddable;
    if (properties.isFolded) { // 如果分组被折叠
      data.x = data.x + this.unfoldedWidth / 2 - this.foldedWidth / 2;
      data.y = data.y + this.unfoldedHight / 2 - this.foldedHeight / 2;
    }
    return data;
  }
  /**
   * 是否允许此节点添加到此分组中
   */
  isAllowAppendIn(nodeData) {
    return true;
  }
}
class GroupNode extends RectResize.view {
  getControlGroup() {
    const { resizable, properties } = this.props.model;
    return resizable && !properties.isFolded ? super.getControlGroup() : null;
  }
  getAddAbleShape() {
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
      this.getAddAbleShape(),
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
