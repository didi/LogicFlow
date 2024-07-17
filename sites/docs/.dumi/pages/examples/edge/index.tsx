import React from 'react';
import ShowCase from '../../../components/showCase';

import meta from './meta';

const EdgePage: React.FC = () => {
  return (
    <ShowCase id="edge" title="边" caseData={meta} language="zh"></ShowCase>
  );
};

export default EdgePage;
