import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { registerTriangleNode } from './triangleNode';

const config = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
    control: false
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'triangle',
      x: 150,
      y: 70,
      text: 'triangle'
    }
  ]
};

export default function CustomNodeShapeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('triangle', registerTriangleNode);
    lf.render(data);
  }, []);

  return <div id="graph" className="viewport" />;
}
