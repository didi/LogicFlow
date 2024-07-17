import React from 'react';
import ShowCase from '../../../../components/showCase';

import meta from './meta';

const ExtensionPage: React.FC = () => {
  return (
    <ShowCase
      id="extension"
      title="extension"
      caseData={meta}
      language="en"
    ></ShowCase>
  );
};

export default ExtensionPage;
