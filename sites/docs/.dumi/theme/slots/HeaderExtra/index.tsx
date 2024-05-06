import { ReactComponent as IconDown } from '@ant-design/icons-svg/inline-svg/outlined/down.svg';
import React, { type FC } from 'react';
import './index.less';

const historyVersion = {
  ONE: '1.x.x',
  ZERO: '0.7.x',
};

const HeaderExtra: FC = () => {
  const isVersionPage = window.location.href.includes('release');
  const version = isVersionPage ? historyVersion.ONE : process.env.DUMI_VERSION;
  const isEnglish = window.location.href.includes('en-US');
  const changeVersion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === historyVersion.ZERO) {
      window.open('https://07.logic-flow.cn/', '_blank');
      return;
    }
    if (e.target.value === historyVersion.ONE) {
      window.location.href = isEnglish
        ? '/en-US/release/one-point-two'
        : '/release/one-point-two';
      return;
    }
    window.location.href = isEnglish ? '/en-US/tutorial' : '/tutorial';
  };

  return (
    <div className="dumi-default-lang-select dumi-version-select">
      <select value={version} onChange={(e) => changeVersion(e)}>
        <option value={process.env.DUMI_VERSION}>
          {process.env.DUMI_VERSION}
        </option>
        <option value={historyVersion.ONE}>1.x</option>
        <option value={historyVersion.ZERO}>0.x</option>
      </select>
      <IconDown />
    </div>
  );
};

export default HeaderExtra;
