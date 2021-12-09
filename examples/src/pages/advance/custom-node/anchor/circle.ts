import { CircleNode, CircleNodeModel } from '@logicflow/core';

class Model extends CircleNodeModel {
  getAnchorsByOffset() {
    return []
  }
  // setAttributes () {
  //   this.anchorsOffset = [
  //     [this.r, 0],
  //     [-this.r, 0],
  //   ];
  // }
}

class View extends CircleNode {
}

export const CircleAnchor = {
  type: 'circle:anchor',
  view: View,
  model: Model,
};
