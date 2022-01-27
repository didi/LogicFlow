import RectResize from './Node/RectResize';
import EllipseResize from './Node/EllipseResize';
import DiamondResize from './Node/DiamondResize';
import HtmlResize from './Node/HtmlResize';

const NodeResize = {
  pluginName: 'nodeResize',
  // 拖动step
  step: 0,
  install(lf) {
    lf.register({
      type: RectResize.type,
      view: RectResize.view,
      model: RectResize.model,
    });
    lf.register({
      type: EllipseResize.type,
      view: EllipseResize.view,
      model: EllipseResize.model,
    });
    lf.register({
      type: DiamondResize.type,
      view: DiamondResize.view,
      model: DiamondResize.model,
    });
    lf.register({
      type: HtmlResize.type,
      view: HtmlResize.view,
      model: HtmlResize.model,
    });
  },
};

export default NodeResize;

export {
  NodeResize,
  RectResize,
  EllipseResize,
  DiamondResize,
  HtmlResize,
};
