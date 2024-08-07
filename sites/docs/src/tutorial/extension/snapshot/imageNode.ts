import { RectNode, RectNodeModel, h } from '@logicflow/core';

class ImageModel extends RectNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    this.width = 80;
    this.height = 60;
  }
}

class ImageNode extends RectNode {
  getImageHref() {
    return 'https://dpubstatic.udache.com/static/dpubimg/0oqFX1nvbD/cloud.png';
  }
  getShape() {
    const { x, y, width, height } = this.props.model;
    const href = this.getImageHref();
    const attrs = {
      x: x - (1 / 2) * width,
      y: y - (1 / 2) * height,
      width,
      height,
      href,
      // 根据宽高缩放
      preserveAspectRatio: 'none meet',
    };
    return h('g', {}, [h('image', { ...attrs })]);
  }
}

export default {
  type: 'image',
  view: ImageNode,
  model: ImageModel,
};
