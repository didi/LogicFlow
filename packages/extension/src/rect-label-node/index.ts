import RectLabelNodeView from './RectLabelNodeView';

const RectLabelNode = {
  name: 'rect-label-node',
  install(lf) {
    lf.register('rect-label', this.registerLabelPlusNode);
  },
  registerLabelPlusNode({ RectNode, RectNodeModel, h }) {
    return {
      model: RectNodeModel,
      view: RectLabelNodeView(RectNode, h),
    };
  },
};

export default RectLabelNode;

export {
  RectLabelNode,
};
