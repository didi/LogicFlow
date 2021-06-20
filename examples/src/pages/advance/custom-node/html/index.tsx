import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../../components/example-header';
import Uml from './uml';
// @ts-ignore
import box from './box.tsx';

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
      type: 'uml',
      x: 150,
      y: 90,
    },
    {
      id: 11,
      type: 'boxx',
      x: 350,
      y: 100,
    },
  ]
};

export default function CustomNodeAnchorExample() {

  useEffect(() => {
    console.log(LogicFlow)
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph_html') as HTMLElement
    });
    lf.register(Uml);
    lf.register(box);
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader
        content="自定义HTML节点"
        githubPath="/advance/custom-node/html/index.tsx"
      />
      <div id="graph_html" className="viewport" />
    </>
  )
}
