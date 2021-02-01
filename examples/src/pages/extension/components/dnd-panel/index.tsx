import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { DndPanel } from '@logicflow/extension'

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
};

export default function DndPanelExample() {
  useEffect(() => {
    LogicFlow.use(DndPanel);
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
