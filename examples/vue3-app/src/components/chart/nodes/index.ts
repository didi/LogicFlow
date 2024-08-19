import LogicFlow from '@logicflow/core'
import { register } from '@logicflow/vue-node-registry'

// import AnalysisNode from './AnalysisNode'
import AnalysisNode from './AnalysisNode.vue'
import DefaultNode from './DefaultNode'
import FirstGroup from './FirstGroup'
import MiddleGroup from './MiddleGroup'
import LandingGroup from './LandingGroup'
import type { IExtension } from '../types.d'

export default class NodeExtension {
  static pluginName = 'nodeExtension'

  constructor({ lf }: IExtension) {
    // lf?.register(AnalysisNode as LogicFlow.RegisterConfig)
    lf?.register(DefaultNode as LogicFlow.RegisterConfig)
    lf?.register(FirstGroup as LogicFlow.RegisterConfig)
    lf?.register(MiddleGroup as LogicFlow.RegisterConfig)
    lf?.register(LandingGroup as LogicFlow.RegisterConfig)

    register(
      {
        type: 'analysisNode',
        component: AnalysisNode
      },
      lf
    )
  }
}
