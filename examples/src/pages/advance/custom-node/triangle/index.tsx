import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { registerTriangleNode } from './triangleNode';
import ExampleHeader from '../../../../components/example-header/index';

const config = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopZoomGraph: true,
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

  return (
    <>
      <ExampleHeader
        content="设置多边形的顶点来实现三角形"
        githubPath="/advance/custom-node/triangle/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
