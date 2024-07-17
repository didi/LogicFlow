import React from 'react';
import ShowCase from '../../../components/showCase';

import meta from './meta';

const ReactPage: React.FC = () => {
  return (
    <ShowCase
      id="react"
      title="react节点"
      caseData={meta}
      language="zh"
    ></ShowCase>
  );
};

export default ReactPage;
