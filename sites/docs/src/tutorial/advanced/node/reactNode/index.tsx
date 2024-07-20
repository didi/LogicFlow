import LogicFlow from '@logicflow/core';
import { useEffect } from 'react';
import box from './box';
import '../../../index.less';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};

export default function PageIndex() {
  useEffect(() => {
    const lf = new LogicFlow({
      container: document.querySelector('#graph_html') as HTMLElement,
      ...SilentConfig,
    });
    lf.register(box);
    lf.render({
      nodes: [
        {
          id: '11',
          type: 'boxx',
          x: 350,
          y: 100,
          properties: {
            name: 'turbo',
            body: 'hello',
          },
        },
      ],
    });

    lf.translateCenter();

    lf.on('node:click', ({ data }) => {
      lf.setProperties(data.id, {
        name: 'turbo',
        body: Math.random(),
      });
    });
  }, []);

  return (
    <>
      <div className="helloworld-app">
        <div className="app-content" id="graph_html" />
      </div>
    </>
  );
}
