/* eslint-disable @typescript-eslint/naming-convention */
import {
  EdgeConfig,
  PolylineEdge,
  PolylineEdgeModel,
  GraphModel,
  h,
} from '@logicflow/core';
import { JSX } from 'preact';
import { genBpmnId } from '../../utils';

type SequenceFlowType = {
  panels: string[];
  [key: string]: any;
};

export function sequenceFlowFactory(props?: any): {
  type: string,
  model: any,
  view: any } {
  class model extends PolylineEdgeModel {
    static extendKey = 'SequenceFlowModel';
    constructor(data: EdgeConfig, graphModel: GraphModel) {
      if (!data.id) {
        data.id = `Flow_${genBpmnId()}`;
      }
      const properties: SequenceFlowType = {
        ...(props || {}),
        ...data.properties,
        // panels: ['condition'],
        isDefaultFlow: false,
      };
      data.properties = properties;

      super(data, graphModel);
    }
  }

  class view extends PolylineEdge {
    static extendKey = 'SequenceFlowEdge';
    getStartArrow(): JSX.Element | null {
      // eslint-disable-next-line no-shadow
      const { model } = this.props;
      const { isDefaultFlow } = model.properties;
      return isDefaultFlow
        ? h('path', {
          refX: 15,
          stroke: '#000000',
          strokeWidth: 2,
          d: 'M 20 5 10 -5 z',
        })
        : h('path', {
          d: '',
        });
    }
  }

  return {
    type: 'bpmn:sequenceFlow',
    view,
    model,
  };
}
