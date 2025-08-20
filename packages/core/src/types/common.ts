// 独立的类型定义文件，避免循环依赖
export namespace CommonTypes {
  export type EdgeType = 'line' | 'polyline' | 'bezier' | string

  export interface AnimationConfig {
    edge: boolean
    node: boolean
  }

  export interface Point {
    x: number
    y: number
  }

  export type PointTuple = [number, number]

  export interface NodeData {
    id?: string
    type?: string
    x?: number
    y?: number
    text?: TextObject | string
    properties?: Record<string, any>
  }

  export interface EdgeData {
    id?: string
    type?: string
    sourceNodeId?: string
    targetNodeId?: string
    startPoint?: Point
    endPoint?: Point
    text?: TextObject | string
    pointsList?: Point[]
    properties?: Record<string, any>
  }

  export interface TextObject {
    value?: string
    x?: number
    y?: number
    draggable?: boolean
    editable?: boolean
  }

  export interface GraphData {
    nodes?: NodeData[]
    edges?: EdgeData[]
  }
}
