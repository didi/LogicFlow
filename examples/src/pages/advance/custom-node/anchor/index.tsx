import React, { useEffect, useRef } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../../components/example-header';
import { Square } from '../square';
import { CircleAnchor } from './circle';

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
      text: '只有两个锚点'
    },
    {
      type: 'circle:anchor',
      x: 350,
      y: 90,
      text: '圆'
    },
  ]
};

export default function CustomNodeAnchorExample() {
  const refContainer = useRef() as React.MutableRefObject<HTMLDivElement>;
  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: refContainer.current
    });
    lf.register(Square);
    lf.register(CircleAnchor);
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader
        content="只保留水平方向上的锚点"
        githubPath="/advance/custom-node/anchor/index.tsx"
      />
      <div ref={refContainer} className="viewport" />
    </>
  )
}
