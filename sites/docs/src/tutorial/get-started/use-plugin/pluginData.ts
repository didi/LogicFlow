import LogicFlow from '@logicflow/core';

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 100,
      y: 100,
      text: '节点1',
    },
    {
      id: '2',
      type: 'circle',
      x: 300,
      y: 100,
      text: '节点2',
    },
  ],
  edges: [
    {
      sourceNodeId: '1',
      targetNodeId: '2',
      type: 'polyline',
      text: '连线',
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

const styleConfig: Partial<LogicFlow.Options> = {
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
  },
};

const SilentConfig = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
  adjustNodePosition: true,
};

export { data, SilentConfig, styleConfig };
