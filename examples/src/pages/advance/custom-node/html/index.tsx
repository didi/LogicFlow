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
      properties: {
        name: 'logicflow',
        body: 'hello'
      }
    },
    {
      id: 11,
      type: 'boxx',
      x: 350,
      y: 100,
      properties: {
        name: 'turbo',
        body: 'hello'
      }
    },
  ]
};
let lf: LogicFlow;
export default function CustomNodeAnchorExample() {

  useEffect(() => {
    lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph_html') as HTMLElement
    });
    lf.register(Uml);
    lf.register(box);
    lf.render(data);
    lf.on('node:click', ({ data}) => {
      lf.setProperties(data.id, {
        name: 'turbo',
        body: Math.random()
      })
    })
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
