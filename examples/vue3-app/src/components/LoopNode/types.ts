import type { GraphModel, Model } from '@logicflow/core'
import type { VueNodeModel } from '@logicflow/vue-node-registry'

export interface RegisterNodeComponentProps {
  graph: GraphModel
  node: VueNodeModel
}

export interface AnchorConfig extends Model.AnchorConfig {
  /**
   * @description 控制是否可以在此锚点手动创建连线
   * @link http://logicflow.cn/release/upgrade-to-v1-1#118-%E4%BB%A5%E4%B8%8B
   */
  edgeAddable?: boolean
}
