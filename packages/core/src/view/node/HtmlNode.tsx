import { h } from 'preact';
import BaseNode from './BaseNode';
import { RectNodeModel } from '../../model';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  model: RectNodeModel;
  graphModel: GraphModel;
};

export default class HtmlNode extends BaseNode {
  ref: HTMLElement;
  setRef = (dom): void => {
    this.ref = dom;
  };
  get rootEl() {
    return this.ref;
  }
  setHtml(rootEl: HTMLElement) {
    rootEl.appendChild(document.createElement('div'));
  }
  componentDidMount() {
    this.setHtml(this.rootEl);
  }
  componentDidUpdate() {
    this.setHtml(this.rootEl);
  }
  getShape() {
    const { x, y, height, width } = this.getAttributes();
    return (
      <foreignObject
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        ref={this.setRef}
      />
    );
  }
}
