import LogicFlow from '@logicflow/core'
import { Group, MiniMap } from '@logicflow/extension'
import NodeExtension from './nodes'
import Graph from './graph'
import type { IGraphData } from './types.d'
import '@logicflow/extension/es/index.css'

interface IOptions {
  container: HTMLDivElement
  graphData: IGraphData
}

export default class LinkChart {
  lf: LogicFlow
  flowId: string = ''

  constructor(options: IOptions) {
    this.lf = new LogicFlow({
      container: options.container,
      snapline: false,
      grid: {
        visible: true,
        type: 'mesh',
        size: 10,
        config: {
          color: '#eee'
        }
      },
      plugins: [NodeExtension, Group, Graph, MiniMap],
      pluginsOptions: {
        miniMap: {
          width: 200,
          height: 150,
          isShowHeader: true,
          isShowCloseIcon: true,
          position: 'right-bottom' as const
        }
      }
    })
    this.lf.graphModel.graphData = options.graphData
    const g = this.lf.extension.graph as any
    this.lf.on('graph:rendered', ({ graphModel }) => {
      this.flowId = graphModel.flowId!
    })
    g.init()
    this.lf.extension.miniMap.show()

    // this.lf.render()
  }

  destroy() {
    this.lf.clearData()
  }

  static create(options: IOptions) {
    return new LinkChart(options)
  }
}
