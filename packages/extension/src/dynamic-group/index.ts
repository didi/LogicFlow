import LogicFlow from '@logicflow/core'
import { forEach } from 'lodash-es'
import groupNode from './groupNode'

export namespace DynamicGroup {
  export type DynamicGroupOptions = Partial<{
    isFold: boolean
  }>
}

export class DynamicGroup {
  static pluginName = 'dynamicGroup'

  private lf: LogicFlow

  constructor({ lf }: LogicFlow.IExtensionProps) {
    lf.register(groupNode)
    this.lf = lf

    // 初始化插件，从监听事件开始
    this.init()
  }

  init() {
    const {
      lf: { graphModel },
    } = this
    // this.lf.eventCenter.on('node:drag', this.onNodeDrag)
    // this.lf.eventCenter.on('node:resize', this.onNodeResize)
    graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      // 判断如果是 group，移动时需要同时移动组内的所有节点
      if (model.isGroup) {
        const nodeIds = this.getNodesInGroup(model.id)
        forEach(nodeIds, (id) => {
          graphModel.moveNode(id, deltaX, deltaY)
        })
      }
      return true
    })

    this.render()
  }

  getNodesInGroup(groupId: string): string[] {
    console.log('groupId', groupId)
    return []
  }

  render() {}

  destroy() {
    // 销毁监听的事件，并移除渲染的 dom 内容
  }
}

export default DynamicGroup
