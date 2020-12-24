import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';
import ExampleHeader from '../../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: true,
    control: false,
  }
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
      <ExampleHeader content="右键节点展示菜单" />
      <div id="graph" className="viewport" />
    </>
  )
}
