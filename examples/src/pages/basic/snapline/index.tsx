import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  grid: {
    size: 10,
    type: 'dot'
  }
}

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 170,
      y: 150,
      text: '你好！'
    },
    {
      id: 20,
      type: 'circle',
      x: 380,
      y: 60,
      text: '你好！',
      r: 50
    }
  ]
};

export default function SnaplineExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data)
  }, []);

  return (
    <>
      <ExampleHeader
        content="尝试拖拽圆形使两个节点对齐"
        githubPath="/basic/snapline/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
