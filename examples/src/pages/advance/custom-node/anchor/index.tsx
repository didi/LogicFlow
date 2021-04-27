import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../../components/example-header';
import { Square } from '../square';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    circle: {
      r: 40
    }
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'square',
      x: 150,
      y: 90,
      text: '正方形'
    },
  ]
};

export default function CustomNodeAnchorExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register(Square);
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader
        content="只保留水平方向上的锚点"
        githubPath="/advance/custom-node/anchor/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
