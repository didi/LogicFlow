import React from 'react';
import ShowCase from '../../../components/showCase';

import meta from './meta';

const NodePage: React.FC = () => {
  return (
    <ShowCase id="node" title="节点" caseData={meta} language="zh"></ShowCase>
  );
};

export default NodePage;
