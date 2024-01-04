import * as React from 'react';
import { useLocation } from 'dumi';
import * as utils from '../../../../theme/utils';
import './style.less';

const locales = {
  cn: [
    {
      icon: '🎥',
      title: '可视化模型',
      desc: '通过 LogicFlow 提供的直观可视化界面，用户可以轻松创建、编辑和管理复杂的逻辑流程图。',
    },
    {
      icon: '🚀 ',
      title: '高可定制性',
      desc: '用户可以根据自己的需要定制节点、连接器和样式，创建符合特定用例的定制逻辑流程图。',
    },
    {
      icon: '🚌',
      title: '自执行引擎',
      desc: '执行引擎支持浏览器端执行流程图逻辑，为无代码执行提供新思路。',
    },
  ],
  en: [],
};

export default function Introduction() {
  const { pathname, search } = useLocation();
  const isEnUS = utils.isEnUS(pathname);
  const inner = isEnUS ? locales.en : locales.cn;

  return (
    <div className="intro-container">
      <div className="title-part">
        <h1>设计语言与研发框架</h1>
        <div>配套生态，让你快速搭建网站应用</div>
      </div>
      {/* TODO: 增加 Star 数、weekly Installs 以及 License，参考 [ReactFlow](https://reactflow.dev/) 官网样式 */}

      <div className="dumi-default-features intro-inner" data-cols="3">
        {inner.map((domItem, domIdx) => {
          return (
            <div
              className="dumi-default-features-item intro-item"
              key={`intro-item${domIdx}`}
            >
              <i>{domItem.icon}</i>
              <h3>{domItem.title}</h3>
              <p>{domItem.desc}</p>
            </div>
          );
        })}
      </div>

      {/* TODO: 增加用户展示栏目，在群中收集目前使用的公司、项目、以及产品。最好有图（Github 有一项收集的地方，汇总一下） */}
    </div>
  );
}
