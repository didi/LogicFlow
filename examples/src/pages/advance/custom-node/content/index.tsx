import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { registerUserTaskNode } from './userTaskNode';

const config = {
  isSilentMode: true,
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
      type: 'userTask',
      x: 150,
      y: 70,
      text: 'userTask'
    }
  ]
};

export default function CustomNodeContentExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('userTask', registerUserTaskNode);
    lf.render(data);
  }, []);

  return <div id="graph" className="viewport" />;
}
