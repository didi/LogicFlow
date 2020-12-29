import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../components/example-header';

const config = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    rect: {
      height: 60
    },
    nodeText: {
      fontSize: 16
    },
    edgeText: {
      fontSize: 17
    }
  }
}

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 170,
      y: 100,
      text: 'I'
    },
    {
      id: 20,
      type: 'circle',
      x: 380,
      y: 180,
      text: 'Logic Flow'
    }
  ],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: 'Like',
      endPoint: {
        id: '330-180',
        x: 330,
        y: 180
      }
    }
  ]
};

export default function SilentModeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader content="静默模式下不可编辑" />
      <div id="graph" className="viewport" />
    </>
  )
}
