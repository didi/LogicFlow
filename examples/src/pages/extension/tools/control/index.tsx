import React, { useEffect } from 'react';
import LogicFlow from 'logic-flow';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    control: true
  }
}

export default function ControlExample() {

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot'
      },
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render();
  }, []);

  return <div id="graph" className="viewport" />;
}
