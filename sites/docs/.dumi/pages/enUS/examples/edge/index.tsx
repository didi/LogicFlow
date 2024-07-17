import React from 'react';
import ShowCase from '../../../../components/showCase';

import meta from './meta';

const EdgePage: React.FC = () => {
  return (
    <ShowCase id="edge" title="edge" caseData={meta} language="en"></ShowCase>
  );
};

export default EdgePage;
