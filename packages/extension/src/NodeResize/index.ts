import RectResize from './RectResize';

const NodeResize = {
  name: 'node-resize',
  install(lf) {
    lf.register({
      type: RectResize.type,
      view: RectResize.view,
      model: RectResize.model,
    });
  },
};

export default NodeResize;

export {
  NodeResize,
};
