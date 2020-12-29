import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
    control: false,
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形'
    },
    {
      id: 20,
      type: 'circle',
      x: 400,
      y: 100,
      text: '圆形'
    }
  ],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '直角折线',
      startPoint: {
        id: '150-60',
        x: 150,
        y: 60
      }
    },
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '直线',
      endPoint: {
        id: '150-60',
        x: 350,
        y: 100
      }
    }
  ]
};

export default function EdgeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data)
  }, []);

  return (
    <>
      <ExampleHeader content="尝试为矩形和圆形手动添加连线" />
      <div id="graph" className="viewport" />
    </>
  )
}
