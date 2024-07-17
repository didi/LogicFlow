import React from 'react';
import ShowCase from '../../../../components/showCase';

import meta from './meta';

const ReactPage: React.FC = () => {
  return (
    <ShowCase
      language="en"
      id="react"
      title="react nodes"
      caseData={meta}
    ></ShowCase>
  );
};

export default ReactPage;
