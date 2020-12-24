import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';
import { registerBeginNode } from './beginNode';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
    control: false
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'begin',
      x: 150,
      y: 70,
      text: 'big',
      properties: {
        size: 'big'
      }
    },
    {
      id: 20,
      type: 'begin',
      x: 400,
      y: 70,
      text: 'normal'
    }
  ]
};

export default function CustomNodePropertiesExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('begin', registerBeginNode);
    lf.render(data);
  }, []);

  return <div id="graph" className="viewport" />;
}
