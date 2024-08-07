import { useRef, useEffect } from 'react';

import { LogicFlow } from '@logicflow/core';
import '@logicflow/core/es/index.css';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

const config = {
  height: 500,
  width: 1000,
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    rect: {
      width: 100,
      height: 50,
      rx: 2,
      ry: 2
    }
  }
};

const data = {
  nodes: [
    {
      id: '10',
      type: 'rect',
      x: 150,
      y: 70,
      text: '矩形'
    },
    {
      id: '20',
      type: 'rect',
      x: 350,
      y: 70,
      text: '矩形'
    }
  ]
};

const SamplePage = () => {
  const lfRef = useRef();
  const containerRef = useRef(null);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10
        }
      });

      lf.render(data);
      lfRef.current = lf;
    }
  }, []);

  return (
    <MainCard title="Native Node">
      <div ref={containerRef} id="graph" className="viewport"></div>
    </MainCard>
  );
};

export default SamplePage;
