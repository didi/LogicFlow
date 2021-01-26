import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { registerGatewayNode } from './gatewayNode';
import { registerUserTaskNode } from '../userTask/userTask';
import ExampleHeader from '../../../../components/example-header';

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
      type: 'userTask',
      x: 150,
      y: 150,
      text: 'userTask'
    },
    {
      id: 20,
      type: 'gateway',
      x: 380,
      y: 70,
      text: 'gateway'
    },
    {
      id: 30,
      type: 'circle',
      x: 380,
      y: 230,
      text: 'other'
    },
  ]
};

export default function CustomNodeEdgeExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.register('userTask', registerUserTaskNode);
    lf.register('gateway', registerGatewayNode);
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader content="userTask 的下一个节点只能是网关节点" />
      <div id="graph" className="viewport" />
    </>
  )
}
