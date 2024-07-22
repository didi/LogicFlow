import LogicFlow from '@logicflow/core'
import LabelOverlay from './LabelOverlay'

export interface INextLabelOptions {
  isVertical?: boolean
  isMultiple?: boolean
  maxCount?: number
}

export class NextLabel {
  static pluginName = 'next-label'
  lf: LogicFlow
  options: INextLabelOptions

  // TODO: 确认下面的函数类型
  constructor({ lf, options }) {
    this.lf = lf
    this.options = options ?? {}

    this.addEventListeners()

    console.log('lf --->>>', lf)
    // 插件中注册 tool
    lf.tool.registerTool(LabelOverlay.toolName, LabelOverlay)
  }

  addEventListeners() {}
}

export default NextLabel
