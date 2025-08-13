/* eslint-disable class-methods-use-this */
import { h } from '@logicflow/core';
import { ReactNodeView } from '@logicflow/react-node-registry';

export default class BaseNodeView extends ReactNodeView {
  getAnchorShape(anchorData: any) {
    const { x, y } = anchorData;
    return h('circle', {
      cx: x,
      cy: y,
      r: 5,
      stroke: '#fff',
      fill: '#2961EF',
      transformOrigin: `${x} ${y}`,
      className: 'lf-basic-shape lf-node-anchor',
    });
  }
}
