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
      y: 150,
      text: '正方形'
    },
    {
      id: 20,
      type: 'circle',
      x: 380,
      y: 70,
      text: '圆形'
    },
    {
      id: 30,
      type: 'diamond',
      x: 380,
      y: 230,
      text: '其他节点'
    },
  ]
};

export default function CustomNodeEdgeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('square', Square);
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader
        content="正方形的下一个节点只能是圆形节点"
        githubPath="/advance/custom-node/rule/index.tsx"
      />
      <div id="graph" className="viewport" />
    </>
  )
}
