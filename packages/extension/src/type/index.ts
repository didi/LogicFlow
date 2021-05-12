import { BaseNodeModel } from '@logicflow/core';

type PointTuple = [number, number];

export type ExclusiveGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[] & string;
};
