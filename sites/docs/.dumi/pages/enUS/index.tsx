import React from 'react';
import Introduction from './components/Introduction';
import Demo from '../index/components/demo';
import Animation from '../index/components/animation';

const Homepage: React.FC = () => {
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
          <p>Visualize your logic and enhance your workflow</p>
          <div className="dumi-default-hero-actions">
            <a href="/tutorial">Start</a>
            <a href="https://github.com/didi/LogicFlow" target="_blank">
              Github
            </a>
          </div>
        </div>
        <Animation />
      </div>
      {/* 首页 demo */}
      <Demo></Demo>
      {/* 介绍 */}
      <Introduction></Introduction>
    </section>
  );
};

export default Homepage;
