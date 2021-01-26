import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { registerProcess } from './process';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 100,
      y: 110,
      text: '审批通过'
    },
    {
      id: 20,
      type: 'rect',
      x: 300,
      y: 110,
      text: '审批中'
    },
    {
      id: 30,
      type: 'rect',
      x: 500,
      y: 110,
      text: '未开始'
    }
  ],
  edges: [
    {
      type: 'process',
      sourceNodeId: 10,
      targetNodeId: 20,
      startPoint: {
        id: '150-110',
        x: 150,
        y: 110
      },
      endPoint: {
        id: '250-110',
        x: 250,
        y: 110
      },
      properties: {
        isExecuted: true
      }
    },
    {
      type: 'process',
      sourceNodeId: 20,
      targetNodeId: 30,
      startPoint: {
        id: '350-110',
        x: 350,
        y: 110
      },
      endPoint: {
        id: '450-110',
        x: 450,
        y: 110
      },
      properties: {
        isExecuted: false
      }
    }
  ]
};

export default function CustomEdgeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('process', registerProcess);
    lf.render(data);
  }, []);

  return <div id="graph" className="viewport" />;
}
