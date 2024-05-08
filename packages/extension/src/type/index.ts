// import { BaseNodeModel } from '@logicflow/core';

type PointTuple = [number, number]

export interface BaseNodeModel {}

export type ExclusiveGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[] & string
}
