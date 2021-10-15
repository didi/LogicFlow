import RectResize from './Node/RectResize';
import EllipseResize from './Node/EllipseResize';
import DiamondResize from './Node/DiamondResize';

const NodeResize = {
  pluginName: 'node-resize',
  // 拖动step
  step: 0,
  // 边框和contol拖动点样式的设置
  style: {
    outline: {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    },
    controlPoint: {
      width: 7,
      height: 7,
      fill: '#FFFFFF',
      stroke: '#000000',
    },
  },
  // 缩放范围
  sizeRange: {
    // rect: {
    //   minWidth: 30,
    //   minHeight: 30,
    //   maxWidth: 300,
    //   maxHeight: 300,
    // },
    ellipse: {
      minRx: 15,
      minRy: 15,
      maxRx: 150,
      maxRy: 150,
    },
    diamond: {
      minRx: 15,
      minRy: 15,
      maxRx: 150,
      maxRy: 150,
    },
  },
  install(lf) {
    // 设置默认样式，主要将outlineColor设置为透明，不再core包中默认的节点外框
    lf.setTheme({
      rect: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
      ellipse: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
      diamond: {
        strokeWidth: 2,
        outlineColor: 'transparent',
      },
    });
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
  },
};

export default NodeResize;

export {
  NodeResize,
  RectResize,
  EllipseResize,
  DiamondResize,
};
