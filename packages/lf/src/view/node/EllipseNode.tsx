import { h } from 'preact';
import BaseNode from './BaseNode';
import Ellipse from '../basic-shape/Ellipse';

export default class EllipseNode extends BaseNode {
  getShape() {
    const attributes = this.getAttributes();
    return (
      <Ellipse
        {...attributes}
      />
    );
  }
}
