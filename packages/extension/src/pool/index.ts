import LogicFlow from '@logicflow/core'
import { assign } from 'lodash-es'
import { PoolModel } from './PoolModel'
import { PoolView } from './PoolView'
import { LaneModel } from './LaneModel'
import { LaneView } from './LaneView'

export const PoolNode = {
  type: 'pool',
  view: PoolView,
  model: PoolModel,
}

export const LaneNode = {
  type: 'lane',
  view: LaneView,
  model: LaneModel,
}

export class PoolElements {
  static pluginName = 'PoolElements'
  private lf: LogicFlow
  // 激活态的 group 节点
  activeGroup?: LaneModel
  // 存储节点与 group 的映射关系
  nodeGroupMap: Map<string, string> = new Map()

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    lf.register(PoolNode)
    lf.register(LaneNode)
    this.lf = lf
    assign(this, options)
    // 初始化插件，从监听事件开始及设置规则开始
    // this.init()
  }

  /**
   * 获取节点所属的分组
   * @param nodeId
   */
  getGroupByNodeId(nodeId: string) {
    const groupId = this.nodeGroupMap.get(nodeId)
    if (groupId) {
      return this.lf.getNodeModelById(groupId)
    }
  }
}

export default PoolElements
