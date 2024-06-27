import { assign } from 'lodash-es'
import { createElement as h } from 'preact/compat'
import LogicFlow from './LogicFlow'
import { KeyboardDef } from './keyboard'
import { OverlapMode } from './constant'
import { Grid } from './view/overlay'

import GridOptions = Grid.GridOptions

export namespace Options {
  import NodeData = LogicFlow.NodeData
  import EdgeData = LogicFlow.EdgeData
  import ExtensionConstructor = LogicFlow.ExtensionConstructor
  import GraphData = LogicFlow.GraphData
  export type EdgeType = 'line' | 'polyline' | 'bezier' | string
  export type BackgroundConfig = {
    // 背景图片地址
    backgroundImage?: string
    // CSS background-repeat 属性
    backgroundRepeat?:
      | 'repeat'
      | 'repeat-x'
      | 'repeat-y'
      | 'no-repeat'
      | 'initial'
      | 'inherit'
    // TODO: 根据具体情况添加各种自定义样式
    [key: string]: any
  }

  export type AnimationConfig = {
    node: boolean
    edge: boolean
  }

  export type EdgeGeneratorType = (
    sourceNode: LogicFlow.NodeData,
    targetNode: LogicFlow.NodeData,
    currentEdge?: Partial<LogicFlow.EdgeConfig>,
  ) => any

  export interface CustomAnchorLineProps {
    sourcePoint: LogicFlow.Point
    targetPoint: LogicFlow.Point

    [key: string]: any
  }

  export interface GuardsConfig {
    beforeClone?: (data: NodeData | GraphData) => boolean
    beforeDelete?: (data: NodeData | EdgeData) => boolean
  }

  export interface Common {
    container: HTMLElement
    // REMIND: 注意，当在 SSR 框架（比如 Next.js Nuxt.js）项目中使用 LogicFlow 时，在初始化时需要设置宽高
    width?: number
    height?: number
    background?: false | BackgroundConfig
    /**
     * Grid 网格配置
     */
    grid?: number | boolean | GridOptions

    partial?: boolean
    keyboard?: KeyboardDef
    style?: Partial<LogicFlow.Theme> // 主题配置
    edgeType?: EdgeType
    adjustEdge?: boolean

    allowRotate?: boolean // 允许节点旋转
    allowResize?: boolean // 是否允许缩放

    isSilentMode?: boolean
    stopScrollGraph?: boolean
    stopZoomGraph?: boolean
    stopMoveGraph?:
      | boolean
      | 'vertical'
      | 'horizontal'
      | [number, number, number, number]
    animation?: boolean | Partial<AnimationConfig>
    history?: boolean
    outline?: boolean
    snapline?: boolean
    textEdit?: boolean

    guards?: GuardsConfig
    overlapMode?: OverlapMode

    plugins?: ExtensionConstructor[]
    pluginsOptions?: Record<string, any>
    disabledPlugins?: string[]
    disabledTools?: string[]

    idGenerator?: (type?: string) => string
    edgeGenerator?: EdgeGeneratorType

    customTrajectory?: (props: CustomAnchorLineProps) => h.JSX.Element
    [key: string]: unknown
  }

  export interface ManualBooleans {}

  export interface Manual extends Partial<Common>, Partial<ManualBooleans> {}

  export interface Definition extends Common {}
}

export namespace Options {
  export function get(options: Partial<Manual>) {
    const { ...others } = options
    const container = options.container
    if (container != null) {
      if (options.width == null) {
        others.width = container.clientWidth
      }
      if (options.height == null) {
        others.height = container.clientHeight
      }
    } else {
      throw new Error(
        'Ensure the container of LogicFlow is specified and valid.',
      )
    }

    const result = assign({}, defaults, others) as Options.Definition

    return result
  }
}

export namespace Options {
  export const defaults: Partial<Definition> = {
    background: false,
    grid: false,
    textEdit: true,
    snapline: true,
    outline: false,
    disabledTools: [],
  }
}
