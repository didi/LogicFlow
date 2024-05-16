import LogicFlow from '@logicflow/core'

import EllipseResize from './node/EllipseResize'
import DiamondResize from './node/DiamondResize'
import HtmlResize from './node/HtmlResize'
import RectResize from './node/RectResize'

export * from './node'
export const NodeResize = {
  pluginName: 'nodeResize',
  // 拖动step
  step: 0,

  install(lf: LogicFlow) {
    lf.register(EllipseResize)
    lf.register(DiamondResize)
    lf.register(HtmlResize)
    lf.register(RectResize)
  },
}

export default NodeResize
