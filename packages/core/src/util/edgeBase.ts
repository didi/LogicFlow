import { pick } from 'lodash-es'
import type LogicFlow from '../LogicFlow'

type EdgeConfig = LogicFlow.EdgeConfig
type Position = LogicFlow.Position

// 规范边初始化数据
export const pickEdgeConfig = (data: EdgeConfig): EdgeConfig =>
  pick(data, [
    'id',
    'type',
    'sourceNodeId',
    'sourceAnchorId',
    'targetNodeId',
    'targetAnchorId',
    'pointsList',
    'startPoint',
    'endPoint',
    'properties',
  ])

export const twoPointDistance = (source: Position, target: Position) => {
  // fix: 修复坐标存在负值时计算错误的问题。
  // const source = {
  //   x: p1.x,
  //   y: Math.abs(p1.y),
  // }
  // const target = {
  //   x: Math.abs(p2.x),
  //   y: Math.abs(p2.y),
  // }
  return Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2)
}
