import LogicFlow from '@logicflow/core'

import RectResize from './node/RectResize'
import EllipseResize from './node/EllipseResize'
import DiamondResize from './node/DiamondResize'
import HtmlResize from './node/HtmlResize'

const NodeResize = {
  pluginName: 'nodeResize',
  // 拖动step
  step: 0,

  install(lf: LogicFlow) {
    lf.register({
      type: RectResize.type,
      view: RectResize.view,
      model: RectResize.model,
    })
    lf.register({
      type: EllipseResize.type,
      view: EllipseResize.view,
      model: EllipseResize.model,
    })
    lf.register({
      type: DiamondResize.type,
      view: DiamondResize.view,
      model: DiamondResize.model,
    })
    lf.register({
      type: HtmlResize.type,
      view: HtmlResize.view,
      model: HtmlResize.model,
    })
  },
}

export { NodeResize, RectResize, EllipseResize, DiamondResize, HtmlResize }

export default NodeResize
