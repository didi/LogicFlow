import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../../components/example-header';
import { Square } from '../square';

const config = {
  hideAnchors: true,
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

export default function CustomNodeStyleExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.registerElement('square', Square);
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader
        content="设置自定义节点的 width 和 height"
        githubPath="/advance/custom-node/style/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
