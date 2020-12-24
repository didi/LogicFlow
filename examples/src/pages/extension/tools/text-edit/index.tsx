import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';
import ExampleHeader from '../../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
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
      text: '文本编辑'
    }
  ]
};

export default function TextEditExample() {

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
      <ExampleHeader content="尝试修改节点内容" />
      <div id="graph" className="viewport" />
    </>
  )
}
