import React from 'react';
import Introduction from './components/Introduction';
import ShowRoom from './components/demo/index';
import Animation from './components/animation';
import './index.less';

const Homepage: React.FC = () => {
  // const scrollDown = () => {
  //   window.scrollTo(0, 650);
  // };

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
          <p>可视化您的逻辑，增强您的工作流程</p>
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
      <ShowRoom />
      {/* 介绍 */}
      <Introduction />
    </section>
  );
};

export default Homepage;
