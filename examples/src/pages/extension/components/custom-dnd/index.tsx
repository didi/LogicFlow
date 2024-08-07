import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import Dnd from './Dnd';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
}

export default function CustomDndExample() {
  useEffect(() => {
    LogicFlow.use(Dnd);
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render();
  }, []);

  return <div id="graph" className="viewport" />;
}
