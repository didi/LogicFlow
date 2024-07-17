import React from 'react';
import ShowCase from '../../../../components/showCase';
import meta from './meta';
import meta2 from './meta2';

const CasePage: React.FC = () => {
  return (
    <>
      <ShowCase
        id="bussiness"
        title="Business scene"
        caseData={meta}
        language="en"
      ></ShowCase>
      <ShowCase
        id="demo"
        title="demo"
        caseData={meta2}
        language="en"
      ></ShowCase>
    </>
  );
};

export default CasePage;
