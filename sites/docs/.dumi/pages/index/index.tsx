/**
 * title: LogicFlow
 */
import React, { Suspense, lazy } from 'react';

const Inner = lazy(() => import('./inner'));

const Indexpage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            marginTop: '30vh',
            textAlign: 'center',
          }}
        >
          Loading...
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
};

export default Indexpage;
