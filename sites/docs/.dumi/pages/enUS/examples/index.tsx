/**
 * sidebar: false
 */
import React from 'react';
import Sidebar from '../../../components/sidebar';
import ShowCase from '../../../components/showCase';

import {
  bussinessData,
  demoData,
  nodeData,
  edgeData,
  reactData,
  extensionData,
} from './data';

import './index.less';

const PageIndex: React.FC = () => {
  return (
    <>
      <div className="container-page">
        <div className="container-sidebar">
          <Sidebar language="en"></Sidebar>
        </div>
        <div className="container-content">
          <ShowCase
            id="bussiness"
            title="Bussiness Scene"
            caseData={bussinessData}
            language="en"
          ></ShowCase>
          <ShowCase
            id="demo"
            title="Demo"
            caseData={demoData}
            language="en"
          ></ShowCase>
          <ShowCase
            id="node"
            title="Node"
            caseData={nodeData}
            language="en"
          ></ShowCase>
          <ShowCase
            id="edge"
            title="Edge"
            caseData={edgeData}
            language="en"
          ></ShowCase>
          <ShowCase
            id="react"
            title="React Nodes"
            caseData={reactData}
            language="en"
          ></ShowCase>
          <ShowCase
            id="extension"
            title="Extension"
            caseData={extensionData}
            language="en"
          ></ShowCase>
        </div>
      </div>
    </>
  );
};

export default PageIndex;
