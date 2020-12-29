import { getCircleModel, getCircleView } from './circle';

const ResizeNode = {
  install(lf) {
    lf.register('circle', this.registerLabelPlusNode);
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
