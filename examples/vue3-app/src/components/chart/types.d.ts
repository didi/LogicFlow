import LogicFlow, { GraphModel, BaseNodeModel } from '@logicflow/core'

/**
 * 节点数据接口
 */
export interface INode {
  id: string
  type: string
  x: number
  y: number
  properties: Record<string, any>
}

/**
 * 边数据接口
 */
export interface IEdge {
  id: string
  type: string
  sourceNodeId: string
  targetNodeId: string
}

/**
 * 节点和边的数据接口
 */
export interface IGraphData {
  nodes: INode[]
  edges: IEdge[]
}

/**
 * 自定义插件构造函数接收参数
 */
export interface IExtension {
  lf: LogicFlow
  LogicFlow?: LogicFlow
}

/**
 * 自定义节点构造函数接收参数
 */
export interface INodeProps {
  graphModel: GraphModel
  model: BaseNodeModel
  overlay: string
}
