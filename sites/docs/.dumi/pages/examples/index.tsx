/**
 * sidebar: false
 */
import React from 'react';
import Sidebar from '../../components/sidebar';
import ShowCase from '../../components/showCase';

import {
  bussinessData,
  demoData,
  nodeData,
  edgeData,
  extensionData,
  reactData,
} from './data';

import './index.less';

const PageIndex: React.FC = () => {
  return (
    <>
      <div className="container-page">
        <div className="container-sidebar">
          <Sidebar language="zh"></Sidebar>
        </div>
        <div className="container-content">
          <ShowCase
            id="bussiness"
            title="业务场景"
            caseData={bussinessData}
            language="zh"
          ></ShowCase>
          <ShowCase
            id="demo"
            title="示例"
            caseData={demoData}
            language="zh"
          ></ShowCase>
          <ShowCase
            id="node"
            title="节点"
            caseData={nodeData}
            language="zh"
          ></ShowCase>
          <ShowCase
            id="edge"
            title="边"
            caseData={edgeData}
            language="zh"
          ></ShowCase>
          <ShowCase
            id="react"
            title="react节点"
            caseData={reactData}
            language="zh"
          ></ShowCase>
          <ShowCase
            id="extension"
            title="插件"
            caseData={extensionData}
            language="zh"
          ></ShowCase>
        </div>
      </div>
    </>
  );
};

export default PageIndex;
