import { getCircleModel, getCircleView } from './circle';

const ResizeNode = {
  name: 'resize-node',
  install(lf) {
    lf.register('circle', this.registerLabelPlusNode, true);
  },
  registerLabelPlusNode({ CircleNode, CircleNodeModel, h }) {
    return {
      view: getCircleView(CircleNode, h),
      model: getCircleModel(CircleNodeModel),
    };
  },
};

export default ResizeNode;

export {
  ResizeNode,
};
