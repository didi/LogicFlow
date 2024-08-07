import { CircleNode, CircleNodeModel } from '@logicflow/core';

class Model extends CircleNodeModel {
  getDefaultAnchor() {
    return []
  }
}

class View extends CircleNode {
}

export const CircleAnchor = {
  type: 'circle:anchor',
  view: View,
  model: Model,
};
