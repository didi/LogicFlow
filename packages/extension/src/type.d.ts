import {
  CircleNodeModel,
  CircleNode,
  BaseNodeModel,
  PolylineEdgeModel,
  PolylineEdge,
  PolygonNodeModel,
  PolygonNode,
  RectNodeModel,
  RectNode,
} from '@logicflow/core/types/LogicFlow';

type PointTuple = [number, number];

export interface CircleNodeModelContractor {
  new(data, graphModel): CircleNodeModel
}

export interface CircleNodeViewContractor {
  new(): CircleNode;
}

export type EventEventModel = BaseNodeModel & {
  r?: number;
};

export interface PolylineEdgeModelContractor {
  new(data, graphModel): PolylineEdgeModel;
}

export interface PolylineEdgeViewContractor {
  new(): PolylineEdge;
}

export interface PolygonNodeModelContractor {
  new(data, graphModel): PolygonNodeModel;
}

export interface PolygonNodeViewContractor {
  new(): PolygonNode;
}

export type ExclusiveGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[];
};

export interface ServiceTaskModelContractor {
  new(data, graphModel): RectNodeModel;
}

export interface ServiceTaskViewContractor {
  new(): RectNode;
}
