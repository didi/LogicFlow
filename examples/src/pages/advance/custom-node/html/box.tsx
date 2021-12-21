import { HtmlNodeModel, HtmlNode } from '@logicflow/core';
import React from 'react';
import ReactDOM from 'react-dom';
import './uml.css';

function Hello(props: any) {
  return (
    <>
      <h1 className="box-title">title</h1>
      <div className="box-content">
        <p>{props.name}</p>
        <p>{props.body}</p>
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
    const { model: { properties } } = this.props;
    ReactDOM.render(<Hello name={properties.name} body={properties.body}/>, rootEl);
  }
}

const boxx = {
  type: 'boxx',
  view: BoxxNode,
  model: BoxxModel
}

export default boxx;
