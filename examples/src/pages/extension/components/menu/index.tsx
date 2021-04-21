import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { Menu } from '@logicflow/extension';
import ExampleHeader from '../../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 80,
      text: '右键菜单'
    }
  ]
};

export default function MenuExample() {
  useEffect(() => {
    LogicFlow.use(Menu);
    const lf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot'
      },
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader
        content="右键节点展示菜单"
        githubPath="/extension/components/menu/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
