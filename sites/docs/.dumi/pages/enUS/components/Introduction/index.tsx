import * as React from 'react';
import '../../../index/components/Introduction/style.less';

const locales = [
  {
    icon: '🎥',
    title: 'Visualization model',
    desc: "With LogicFlow's intuitive visualization interface, users can easily create, edit and manage complex logic flow diagrams.",
  },
  {
    icon: '🚀',
    title: 'Highly customizable',
    desc: 'Users can customize the nodes, connectors, and styles to create a customized logic flowchart that meets their needs for a specific use case.',
  },
  {
    icon: '🚌',
    title: 'Self-executing engine',
    desc: 'Execution engine supports browser-side execution of flowchart logic, providing new ideas for code-free execution.',
  },
];

export default function Introduction() {
  const inner = locales;
  return (
    <div className="intro-container">
      <div className="title-part">
        <h1>Design Process and Execution Engine</h1>
        <div>Supporting community to get your process built quickly</div>
      </div>
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
    </div>
  );
}
