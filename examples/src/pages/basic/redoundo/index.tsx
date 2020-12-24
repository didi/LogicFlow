import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';
import ExampleHeader from '../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    control: true
  },
}

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 200,
      y: 90,
      text: '你好！'
    },
    {
      id: 20,
      type: 'circle',
      x: 200,
      y: 250,
      text: '你好！',
      r: 50
    }
  ]
};

export default function RedoUndoExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader content={"尝试连线后点击“上一步”撤销"} />
      <div id="graph" className="viewport" />
    </>
  )
}
