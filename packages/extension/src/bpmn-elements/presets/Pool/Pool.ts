/* eslint-disable no-case-declarations */
/**
 * 泳道节点
 */
import { h } from '@logicflow/core';
import { GroupNode } from '../../../materials/group/index';
import { poolToJSON } from '.';

const laneMinSize = {
  width: 312,
  height: 72,
};

class HorizontalLaneModel extends GroupNode.model {
  initNodeData(data: {
    width: number;
    height: number;
    properties: Record<string, any>;
  }) {
    super.initNodeData(data);
    this.height = 260;
    // this.foldable = true
    this.foldedWidth = 42;
    this.resizable = true;
    this.zIndex = 1;
    this.text.editable = true;
    this.toJSON = poolToJSON;
    // Fix:因为宽高保存在properties中，复现泳道时获取到的是基础宽高而不是properties的宽高，所以异步修改左侧标题的x轴坐标。
    setTimeout(() => {
      this.text.x = this.x - this.width / 2 + 11;
    }, 0);
  }

  setAttributes() {
    this.text = {
      ...this.text,
      value: this.text.value || '泳池示例',
      x: this.x - this.width / 2 + 11,
      y: this.y,
    };
  }

  getTextStyle() {
    const style = super.getTextStyle();
    style.textWidth = 16;
    return style;
  }

  foldGroup(isFolded: boolean) {
    this.setProperty('isFolded', isFolded);
    this.isFolded = isFolded;
    // step 1
    if (isFolded) {
      this.x = this.x - this.width / 2 + this.foldedWidth / 2;
      this.unfoldedWidth = this.width;
      this.unfoldedHight = this.height;
      this.width = this.foldedWidth;
    } else {
      this.width = this.unfoldedWidth;
      this.x = this.x + this.width / 2 - this.foldedWidth / 2;
    }
    // step 2
    let allEdges = this.incoming.edges.concat(this.outgoing.edges);
    this.children.forEach((elementId) => {
      const nodeModel: any = this.graphModel.getElement(elementId);
      nodeModel.visible = !isFolded;
      allEdges = allEdges.concat(
        nodeModel.incoming.edges.concat(nodeModel.outgoing.edges),
      );
    });
    // step 3
    // @ts-ignore
    this.foldEdge(isFolded, allEdges);
  }
  // 感应泳道变化，调整宽高
  resize(resizeId?: string, newNodeSize?: { x: number; width: number }) {
    if (!this.children.size) {
      return;
    }
    let minX: number | null = null;
    let maxX: number | null = null;
    let minY: number | null = null;
    let maxY: number | null = null;
    let hasMaxX = false;
    // 找到边界
    this.children.forEach((elementId) => {
      const nodeModel: any = this.graphModel.getElement(elementId);
      const { x, y, width, height, type, id } = nodeModel;
      if (type !== 'lane') {
        return;
      }
      if (id === resizeId && newNodeSize) {
        minX = newNodeSize.x - newNodeSize.width / 2;
        maxX = newNodeSize.x + newNodeSize.width / 2;
        hasMaxX = true;
      }
      if (!hasMaxX && (!minX || x - width / 2 < minX)) {
        minX = x - width / 2;
      }
      if (!hasMaxX && (!maxX || x + width / 2 > maxX)) {
        maxX = x + width / 2;
      }
      if (!minY || y - height / 2 < minY) {
        minY = y - height / 2;
      }
      if (!maxY || y + height / 2 > maxY) {
        maxY = y + height / 2;
      }
    });
    if (minX && maxX && minY && maxY) {
      this.width = maxX - minX + 30;
      this.height = maxY - minY;
      this.x = minX + (maxX - minX) / 2 - 15;
      this.y = minY + (maxY - minY) / 2;
      this.setAttributes();
      this.resizeChildren({});
    }
  }

  resizeChildren({ resizeDir = '', deltaHeight = 0 }) {
    const { x, y, width } = this;
    const laneChildren: any[] = [];
    this.children.forEach((elementId) => {
      const nodeModel: any = this.graphModel.getElement(elementId);
      const { type } = nodeModel;
      if (type === 'lane') {
        laneChildren.push(nodeModel);
      }
    });
    // 按照位置排序
    laneChildren.sort((a, b) => {
      if (a.y < b.y) {
        return -1;
      }
      return 1;

    });
    // 把泳池resize的高度加进来
    switch (resizeDir) {
      case 'below':
        // 高度加在最下面的泳道上
        const lastLane = laneChildren[laneChildren.length - 1];
        lastLane.height = lastLane.height + deltaHeight < laneMinSize.height
          ? laneMinSize.height
          : lastLane.height + deltaHeight;
        laneChildren[laneChildren.length - 1] = lastLane;
        break;
      case 'above':
        // 高度加在最上面的泳道上
        const firstLane = laneChildren[0];
        firstLane.height = firstLane.height + deltaHeight < laneMinSize.height
          ? laneMinSize.height
          : firstLane.height + deltaHeight;
        laneChildren[0] = firstLane;
        break;
      default:
        break;
    }
    const poolHeight = laneChildren.reduce((a, b) => a + b.height, 0);
    let aboveNodeHeights = 0;
    laneChildren.forEach((nodeModel, index) => {
      const { height } = nodeModel;
      nodeModel.changeAttribute({
        width: width - 30,
        height,
        x: x + 15,
        y: y - poolHeight / 2 + aboveNodeHeights + height / 2,
      });
      aboveNodeHeights += height;
    });
    this.height = poolHeight;
  }

  addChild(childId: any) {
    super.addChild(childId);
    this.graphModel.group.nodeGroupMap?.set(childId, this.id);
  }

  addChildAbove({ x, y, width, height }: any) {
    this.children.forEach((elementId) => {
      const nodeModel: any = this.graphModel.getElement(elementId);
      const { type, y: childY } = nodeModel;
      if (type !== 'lane') {
        return;
      }
      // 在被操作的泳道之上
      if (childY < y) {
        nodeModel.changeAttribute({ y: childY - 120 });
      }
    });
    const { id: laneId } = this.graphModel.addNode({
      type: 'lane',
      properties: {
        nodeSize: {
          width,
          height: 120,
        },
      },
      x,
      y: y - height / 2 - 60,
    });
    this.addChild(laneId);
    this.height = this.height + 120;
    this.y = this.y - 60;
  }

  addChildBelow({ x, y, width, height }: any) {
    this.children.forEach((elementId) => {
      const nodeModel: any = this.graphModel.getElement(elementId);
      const { type, y: childY } = nodeModel;
      if (type !== 'lane') {
        return;
      }
      // 在被操作的泳道之下
      if (childY > y) {
        nodeModel.changeAttribute({ y: childY + 120 });
      }
    });
    const { id: laneId } = this.graphModel.addNode({
      type: 'lane',
      properties: {
        nodeSize: {
          width,
          height: 120,
        },
      },
      x,
      y: y + height / 2 + 60,
    });
    this.addChild(laneId);
    this.height = this.height + 120;
    this.y = this.y + 60;
  }

  deleteChild(childId: any) {
    const laneChildren: any[] = [];
    this.children.forEach((elementId) => {
      const nodeModel: any = this.graphModel.getElement(elementId);
      const { type } = nodeModel;
      if (type === 'lane') {
        laneChildren.push(nodeModel);
      }
    });
    if (laneChildren.length <= 1) {
      return;
    }
    this.removeChild(childId);
    this.graphModel.deleteNode(childId);
    this.resize();
  }
}

class HorizontalLaneView extends GroupNode.view {
  getResizeShape() {
    const { model } = this.props;
    const { x, y, width, height } = model;
    const style = model.getNodeStyle();
    // 标题区域
    const foldRectAttrs = {
      ...style,
      x: x - width / 2,
      y: y - height / 2,
      width: 30,
      height,
    };
    // 泳道区域
    const transRectAttrs = {
      ...style,
      x: x - width / 2 + 30,
      y: y - height / 2,
      width: width - 30,
      height,
      fill: 'transparent',
    };
    return h('g', {}, [
      // this.getAddAbleShape(),
      h('rect', { ...foldRectAttrs }),
      h('rect', { ...transRectAttrs }),
      this.getFoldIcon(),
    ]);
  }
}

const PoolNode = {
  type: 'pool',
  view: HorizontalLaneView,
  model: HorizontalLaneModel,
};

export default PoolNode;
