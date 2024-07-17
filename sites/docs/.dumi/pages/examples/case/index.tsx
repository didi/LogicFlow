import React from 'react';
import ShowCase from '../../../components/showCase';
import meta from './meta';
import meta2 from './meta2';

const CasePage: React.FC = () => {
  return (
    <>
      <ShowCase
        id="bussiness"
        title="业务场景"
        caseData={meta}
        language="zh"
      ></ShowCase>
      <ShowCase
        id="demo"
        title="示例"
        caseData={meta2}
        language="zh"
      ></ShowCase>
    </>
  );
};

export default CasePage;
