import { h } from 'preact';
import BaseNode from './BaseNode';
import { RectNodeModel } from '../../model';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  model: RectNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class HtmlNode extends BaseNode {
  rootElId: string;
  constructor(props) {
    super(props);
    this.rootElId = `htmlNode_${props.model.id}`;
  }
  get rootEl() {
    return document.querySelector(`#${this.rootElId}`) as HTMLElement;
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
    const attributes = this.getAttributes();
    const { x, y, width, height } = attributes;
    return (
      <foreignObject
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        id={this.rootElId}
      />
    );
  }
}
