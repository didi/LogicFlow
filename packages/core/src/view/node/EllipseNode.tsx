import { h } from 'preact';
import BaseNode from './BaseNode';
import Ellipse from '../basic-shape/Ellipse';

export default class EllipseNode extends BaseNode {
  rx: number;
  ry: number;
  constructor(props) {
    super(props);
    const { model: { rx, ry } } = props;
    this.rx = rx;
    this.ry = ry;
  }
  getAttributes() {
    const attributes = super.getAttributes();
    return { ...attributes, rx: this.rx, ry: this.ry };
  }
  getShape() {
    const attributes = this.getAttributes();
    return (
      <Ellipse
        {...attributes}
      />
    );
  }
}
