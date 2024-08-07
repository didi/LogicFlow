import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import { useEffect, useRef } from 'react';

import UserTask from './customRect';
import data from './data';

const SilentConfig = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
  adjustNodePosition: true,
};

export default function App() {
  const refContainer = useRef(null);
  useEffect(() => {
    const lf = new LogicFlow({
      container: refContainer.current!,
      grid: true,
      height: 200,
      ...SilentConfig,
    });
    lf.register(UserTask);
    lf.render(data);
    lf.translateCenter();
  });
  return <div className="App" ref={refContainer}></div>;
}
