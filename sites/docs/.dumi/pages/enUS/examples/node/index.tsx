import React from 'react';
import ShowCase from '../../../../components/showCase';

import meta from './meta';

const NodePage: React.FC = () => {
  return (
    <ShowCase id="node" title="node" caseData={meta} language="en"></ShowCase>
  );
};

export default NodePage;
