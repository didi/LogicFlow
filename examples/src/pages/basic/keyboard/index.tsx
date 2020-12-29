import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../components/example-header';
import './index.css';

const config = {
  textEdit: false,
  tool: {
    menu: false,
    control: false,
  },
  keyboard: {
    enabled: true,
  },
  style: {
    rect: {
      width: 100,
      height: 60
    }
  }
};

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

export default function KeyboardExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data)
  }, []);

  return (
    <>
      <ExampleHeader>
        <div className="keyboard-example-code">Ctrl + C</div>
        <div className="keyboard-example-code">Ctrl + V</div>
      </ExampleHeader>
      <div id="graph" className="viewport" />
    </>
  )
}
