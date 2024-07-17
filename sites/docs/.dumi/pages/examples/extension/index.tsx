import React from 'react';
import ShowCase from '../../../components/showCase';

import meta from './meta';

const ExtensionPage: React.FC = () => {
  return (
    <ShowCase
      id="extension"
      title="插件"
      caseData={meta}
      language="zh"
    ></ShowCase>
  );
};

export default ExtensionPage;
