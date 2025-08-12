import { BaseNodeModel } from './baseNodeModel'

export class StartNodeModel extends BaseNodeModel {
  setAttributes() {
    this.width = 190
    this.height = 44
  }
  // 连线规则-作为起点-都不允许连线
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    const onlyUniqueSource = {
      message: '节点只能与一个节点相连',
      validate: () => {
        const { edges } = this.outgoing
        return !(edges && edges.length > 0)
      },
    }
    rules.push(onlyUniqueSource)
    return rules
  }
  // 连线规则-作为终点-都不允许连线
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const notAsTarget = {
      message: '不能连入',
      validate: () => false,
    }
    rules.push(notAsTarget)
    return rules
  }
}
