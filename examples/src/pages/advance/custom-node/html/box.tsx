import { HtmlNodeModel, HtmlNode } from '@logicflow/core';
import React from 'react';
import ReactDOM from 'react-dom';
import './uml.css';

function Hello() {
  return (
    <>
      <h1 className="box-title">title</h1>
      <div className="box-content">
        <p>content</p>
        <p>content2</p>
        <p>content3</p>
      </div>
    </>
  )
}

class BoxxModel extends HtmlNodeModel {
  setAttributes() {
    this.text.editable = false;
    const width = 200;
    const height = 116;
    this.width = width;
    this.height = height;
    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height/2],
    ]
  }
}
class BoxxNode extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    ReactDOM.render(<Hello />, rootEl);
  }
}

const boxx = {
  type: 'boxx',
  view: BoxxNode,
  model: BoxxModel
}

export default boxx;
