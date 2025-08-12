import { BaseNodeModel } from './baseNodeModel'

export class EndNodeModel extends BaseNodeModel {
  setAttributes() {
    this.width = 190
    this.height = 44
  }
  // 连线规则-作为起点-都不允许连线
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    const notAsTarget = {
      message: '不能连出',
      validate: () => false,
    }
    rules.push(notAsTarget)
    return rules
  }
}
