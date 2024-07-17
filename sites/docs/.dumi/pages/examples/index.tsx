/**
 * sidebar: false
 */
import React from 'react';
import Sidebar from '../../components/sidebar';
import CasePage from './case';
import NodePage from './node';
import EdgePage from './edge';
import ReactPage from './react';
import ExtensionPage from './extension';

import './index.less';

const PageIndex: React.FC = () => {
  return (
    <>
      <div className="container-page">
        <div className="container-sidebar">
          <Sidebar></Sidebar>
        </div>
        <div className="container-content">
          <CasePage></CasePage>
          <NodePage></NodePage>
          <EdgePage></EdgePage>
          <ReactPage></ReactPage>
          <ExtensionPage></ExtensionPage>
        </div>
      </div>
    </>
  );
};

export default PageIndex;
