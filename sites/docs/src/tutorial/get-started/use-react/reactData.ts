import LogicFlow from '@logicflow/core';

const data = {
  nodes: [
    {
      type: 'rect',
      x: 100,
      y: 100,
      text: '节点1',
      id: 'node_id_1',
    },
    {
      type: 'rect',
      text: '节点2',
      x: 300,
      y: 100,
      id: 'node_id_2',
    },
  ],
  edges: [
    {
      id: 'edge_id_1',
      type: 'CustomEdge',
      sourceNodeId: 'node_id_1',
      properties: {},
      targetNodeId: 'node_id_2',
      startPoint: {
        x: 140,
        y: 100,
      },
      endPoint: {
        x: 250,
        y: 100,
      },
    },
  ],
};

const SilentConfig = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
  adjustNodePosition: true,
};

const styleConfig: Partial<LogicFlow.Options> = {
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
  },
};

export { data, SilentConfig, styleConfig };
