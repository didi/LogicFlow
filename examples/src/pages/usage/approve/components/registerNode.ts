import LogicFlow, {
  BaseNode,
  ConnectRule,
  CircleNodeModel,
  CircleNode,
  h,
  RectNode,
  RectNodeModel,
  PolygonNode,
  PolygonNodeModel,
} from '@logicflow/core';
import GraphModel from "@logicflow/core/types/model/GraphModel";
import { nodeProperty } from '../type';

export default function RegisteNode(lf: LogicFlow) {
  class ApplyNodeModel extends CircleNodeModel {
    getConnectedTargetRules(): ConnectRule[] {
      const rules = super.getConnectedTargetRules();
      const geteWayOnlyAsTarget = {
        message: '开始节点只能连出，不能连入！',
        validate: (source:BaseNode, target:BaseNode) => {
          let isValid = true;
          if (target) {
            isValid = false;
          }
          return isValid;
        },
      };
      // @ts-ignore
      rules.push(geteWayOnlyAsTarget);
      return rules;
    }
  }
  lf.register({
    type: 'apply',
    view: CircleNode,
    model: ApplyNodeModel,
  })

  class ApproverNode extends RectNode {
    static extendKey = 'UserTaskNode';
    getLabelShape() {
      const attributes = super.getAttributes();
      const {
        x,
        y,
        width,
        height,
        properties,
      } = attributes;
      const { labelColor, approveTypeLabel } = properties as nodeProperty;
      return h(
        'text',
        {
          fill: labelColor,
          fontSize: 12,
          x: x - width / 2 + 5,
          y: y - height / 2 + 15,
          width: 50,
          height: 25
        },
        approveTypeLabel,
      );
    }
    getShape() {
      const attributes = super.getAttributes();
      const {
        x,
        y,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        radius,
      } = attributes;
      return h(
        'g',
        {
        },
        [
          h(
            'rect',
            {
              x: x - width / 2,
              y: y - height / 2,
              rx: radius,
              ry: radius,
              fill,
              stroke,
              strokeWidth,
              width,
              height,
            },
          ),
          this.getLabelShape(),
        ],
      );
    }
  }
  class ApproverModel extends RectNodeModel { 
    constructor(data: any, graphModel: GraphModel) {
      super(data, graphModel);
      this.properties = {
        labelColor: '#000000',
        approveTypeLabel: '',
        approveType: ''
      }
    }
  }

  lf.register({
    type: 'approver',
    view: ApproverNode,
    model: ApproverModel,
  })

  class JugementModel extends PolygonNodeModel { 
    constructor(data: any, graphModel: GraphModel) {
      super(data, graphModel);
      this.points= [
        [35, 0],
        [70, 35],
        [35, 70],
        [0, 35],
      ];
      this.properties = {
        api: '',
      }
    }
  }
  lf.register({
    type: 'jugement',
    view: PolygonNode,
    model: JugementModel,
  });

  class FinshNodeModel extends CircleNodeModel {
    getConnectedSourceRules(): ConnectRule[] {
      const rules = super.getConnectedSourceRules();
      const geteWayOnlyAsTarget = {
        message: '结束节点只能连入，不能连出！',
        validate: (source:BaseNode) => {
          let isValid = true;
          if (source) {
            isValid = false;
          }
          return isValid;
        },
      };
      // @ts-ignore
      rules.push(geteWayOnlyAsTarget);
      return rules;
    }
  }
  lf.register({
    type: 'finsh',
    view: CircleNode,
    model: FinshNodeModel,
  })
}