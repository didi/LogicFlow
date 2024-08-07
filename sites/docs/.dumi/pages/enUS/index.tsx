import React from 'react';
import Introduction from './components/Introduction';
import Demo from '../index/components/demo';
import MobileDemo from '../index/components/demo2/index';
import Animation from '../index/components/animation';
import '../index/index.less';

const Homepage: React.FC = () => {
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
          <p>
            Low-cost implementation for simpler,
            <br />
            more efficient logic management
          </p>
          <div className="dumi-default-hero-actions">
            <a href="/tutorial">Get Started</a>
            <a href="https://github.com/didi/LogicFlow" target="_blank">
              Github
            </a>
          </div>
        </div>
        <Animation />
      </div>
      {/* 首页 demo */}
      {isMobile() ? <MobileDemo /> : <Demo />}
      {/* 介绍 */}
      <Introduction></Introduction>
    </section>
  );
};

export default Homepage;
