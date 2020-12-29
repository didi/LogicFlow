import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';

const config = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
    control: false
  },
  style: {
    rect: {
      width: 100,
      height: 50
    }
  }
}

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 70,
      text: '矩形'
    }
  ]
};

export default function NodeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data)
  }, []);

  return <div id="graph" className="viewport"></div>;
}
