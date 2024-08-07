/**
 * title: LogicFlow
 */
import React, { Suspense, lazy } from 'react';
import Introduction from './components/Introduction';
// import Demo from './components/demo/index';
// import MobileDemo from './components/demo2/index';
import Animation from './components/animation';
import './index.less';

const Demo = lazy(() => import('./components/demo/index'));
const MobileDemo = lazy(() => import('./components/demo2/index'));

const Homepage: React.FC = () => {
  // const scrollDown = () => {
  //   window.scrollTo(0, 650);
  // };

  const isMobile = () => {
    let flag =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    return flag;
  };

  return (
    <section className="home-page">
      <div className="home-title">
        {/* 名称 */}
        <div className="dumi-default-hero">
          <h1 className="dumi-default-hero-title left-title">
            <span
              style={{
                background: 'linear-gradient(30deg, #3eaefd 30%, #2b65fa)',
                backgroundClip: 'revert-layer',
              }}
            >
              LogicFlow
            </span>
          </h1>
          <p>低成本实现，让逻辑管理更简单、更高效</p>
          <div className="dumi-default-hero-actions">
            <a href="/tutorial">开始使用</a>
            <a href="https://github.com/didi/LogicFlow" target="_blank">
              Github
            </a>
          </div>
          {/* <span className="more-icon" onClick={scrollDown}></span> */}
        </div>
        <Animation />
      </div>
      {/* 首页 demo */}
      {isMobile() ? (
        <Suspense fallback={<div></div>}>
          <MobileDemo />
        </Suspense>
      ) : (
        <Suspense fallback={<div></div>}>
          <Demo />
        </Suspense>
      )}
      {/* 介绍 */}
      <Introduction />
    </section>
  );
};

export default Homepage;
