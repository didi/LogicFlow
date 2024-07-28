import LogicFlow from '@logicflow/core'
import GraphConfigData = LogicFlow.GraphConfigData

export const data: GraphConfigData = {
  nodes: [
    {
      id: 'custom-node-1',
      type: 'rect',
      rotate: 1.1722738811284763,
      text: {
        x: 300,
        y: 200,
        value: 'node-1',
      },
      properties: {
        _textMode: 'text',
      },
      x: 300,
      y: 200,
    },
    {
      id: 'custom-node-2',
      type: 'rect',
      x: 300,
      y: 300,
      properties: {
        _textMode: 'label',
      },
      text: 'custom-node-2',
    },
    {
      id: 'custom-node-3',
      type: 'circle',
      properties: {
        _labelOption: {
          isMultiple: true,
        },
        _label: [
          {
            value: '333331',
            x: 500,
            y: 50,
            rotate: 45,
            draggable: true,
          },
          {
            value: '333332',
            x: 500,
            y: 150,
          },
        ],
      },
      x: 500,
      y: 100,
    },
    {
      id: 'custom-node-4',
      type: 'rect',
      x: 500,
      y: 300,
    },
    {
      id: 'custom-node-5',
      type: 'rect',
      x: 800,
      y: 200,
      properties: {
        width: 80,
        height: 120,
      },
    },
  ],
  edges: [
    {
      sourceNodeId: 'custom-node-2',
      targetNodeId: 'custom-node-3',
      type: 'bezier',
      text: 'bezier',
      properties: {
        _textMode: 'text',
      },
    },
    {
      sourceNodeId: 'custom-node-3',
      targetNodeId: 'custom-node-5',
      type: 'bezier',
      properties: {
        _textMode: 'label',
        _labelOption: {
          isMultiple: true,
        },
      },
    },
    {
      sourceNodeId: 'custom-node-3',
      targetNodeId: 'custom-node-1',
      type: 'polyline',
      properties: {
        _textMode: 'label',
        _label: [
          {
            value: 'polyline3',
            draggable: true,
            editable: false,
            x: 620,
            y: 90,
          },
          {
            value: 'polyline4',
            x: 520,
            y: 90,
          },
          {
            value: 'polyline5',
            x: 620,
            y: 50,
          },
        ],
        _labelOption: {
          isMultiple: true,
          maxCount: 3,
        },
      },
    },
  ],
}
