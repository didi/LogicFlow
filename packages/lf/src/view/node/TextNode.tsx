import { h } from 'preact';
import Text from '../basic-shape/Text';
import BaseNode from './BaseNode';

export default class TextNode extends BaseNode {
  getShape() {
    const attributes = this.getAttributes();
    return (
      <Text
        {...attributes}
      />
    );
  }
}
