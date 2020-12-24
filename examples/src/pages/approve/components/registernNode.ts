import LogicFlow from "logic-flow"
import { BaseNode } from "logic-flow/types/LogicFlow";
import GraphModel from "logic-flow/types/model/GraphModel";
import { ConnectRule } from "logic-flow/types/model/node/BaseNodeModel";
import { nodeProperty } from '../type';

export default function RegisteNode(lf: LogicFlow) {
  lf.register('apply', ({ CircleNode, CircleNodeModel }) => {
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
    return {
      view: CircleNode,
      model: ApplyNodeModel,
    }
  })

  lf.register('approver', ({ RectNode, RectNodeModel, h }) => {
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
    return {
      view: ApproverNode,
      model: ApproverModel,
    }
  })
  lf.register('jugement', ({ PolygonNode, PolygonNodeModel }) => {
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
    return {
      view: PolygonNode,
      model: JugementModel,
    }
  })

  lf.register('finsh', ({ CircleNode, CircleNodeModel }) => {
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
    return {
      view: CircleNode,
      model: FinshNodeModel,
    }
  })
}