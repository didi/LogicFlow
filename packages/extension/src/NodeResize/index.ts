/**
 * @deprecated
 * 待废弃，2.0 版本将 NodeResize 能力内置，该插件设计和实现有比较多的问题，后续不再维护，请及时切换
 */
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
