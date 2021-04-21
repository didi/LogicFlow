import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import './index.css';
import ExampleHeader from '../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  grid: {
    type: 'dot',
    size: 20,
  },
}

const data = {
  // 节点
  nodes: [
    {
      id: 50,
      type: 'rect',
      x: 100,
      y: 150,
      text: '你好',
    },
    {
      id: 21,
      type: 'circle',
      x: 300,
      y: 150,
    },
  ],
  // 边
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 50,
      targetNodeId: 21,
    }
  ]
}

export default function StartExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#container') as HTMLElement,
    });
    lf.render(data)
  }, []);

  return (
    <>
      <ExampleHeader githubPath="/start/index.tsx" />
      <div id="container" className="viewport" />
    </>
  )
}
