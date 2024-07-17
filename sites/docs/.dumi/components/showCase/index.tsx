import React from 'react';

import './index.less';

interface CaseData {
  language: string;
  id: string;
  title: string;
  caseData: BodyCaseProps[];
}

interface BodyCaseProps {
  title: { zh: string; en: string };
  screenshot: string;
  previewUrl: string;
  github: { url: string; avatar: string };
}

const HeaderCase: React.FC<{ title: string; id: string }> = ({ title, id }) => {
  return (
    <>
      <div id={id} className="header-case">
        <h2>{title}</h2>
      </div>
    </>
  );
};

const BodyCase: React.FC<{ caseData: BodyCaseProps[]; language: string }> = ({
  caseData,
  language,
}) => {
  const handelClick = (url: string) => {
    window.open(url, '_blank');
  };
  return (
    <div className="body-case">
      {caseData.map((caseItem, index) => (
        <div className="card-case" key={index}>
          <img
            className="screen-shot"
            src={caseItem.screenshot}
            onClick={() => handelClick(caseItem.previewUrl)}
            alt="Screenshot"
          />
          <div className="introduction">
            <span className="title">
              {caseItem.title[language as keyof typeof caseItem.title]}
            </span>
            <img
              className="avatar"
              src={caseItem.github.avatar}
              alt="Avatar"
              onClick={() => handelClick(caseItem.github.url)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ShowCase: React.FC<CaseData> = ({ caseData, title, id, language }) => {
  return (
    <>
      <HeaderCase id={id} title={title}></HeaderCase>
      <BodyCase caseData={caseData} language={language}></BodyCase>
    </>
  );
};

export default ShowCase;
