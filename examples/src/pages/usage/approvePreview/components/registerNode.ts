import LogicFlow, {
  CircleNodeModel,
  CircleNode,
  RectNode,
  RectNodeModel,
  PolygonNode,
  PolygonNodeModel,
  PolylineEdge,
  PolylineEdgeModel,
  h,
} from "@logicflow/core"
import GraphModel from "@logicflow/core/types/model/GraphModel";
import BaseNodeModel from "@logicflow/core/types/model/node/BaseNodeModel";
import { nodeProperty } from '../type';

const statusColor = {
  0: 'grey',
  1: 'green',
  2: 'red'
}

export default function RegisteNode(lf: LogicFlow) {
  
  class ApplyModel extends CircleNodeModel { 
    constructor(data: BaseNodeModel, graphModel: GraphModel) {
      super(data, graphModel);
      const property = data.properties;
      // @ts-ignore
      this.stroke = statusColor[property.status];
    }
  }

  lf.register({
    type: 'apply',
    model: ApplyModel,
    view: CircleNode, 
  })

  class ApproverNode extends RectNode {
    static extendKey = 'UserTaskNode';
    getLabelShape() {
      const {
        x,
        y,
        width,
        height,
        properties,
      } = this.props.model;
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
      const {
        x,
        y,
        width,
        height,        
        radius,
      } = this.props.model;
      const style = this.props.model.getNodeStyle();
      return h(
        'g',
        {
        },
        [
          h(
            'rect',
            {
              ...style,
              x: x - width / 2,
              y: y - height / 2,
              rx: radius,
              ry: radius,
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
    constructor(data: BaseNodeModel, graphModel: GraphModel) {
      super(data, graphModel);
      const property = data.properties;
      // @ts-ignore
      this.stroke = statusColor[property.status];
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
      const property = data.properties;
      // @ts-ignore
      this.stroke = statusColor[property.status];
      this.properties = {
        api: '',
      }
    }
  }

  lf.register({
    type: 'jugement',
    view: PolygonNode,
    model: JugementModel,
  })

  class FinshModel extends CircleNodeModel { 
    constructor(data: BaseNodeModel, graphModel: GraphModel) {
      super(data, graphModel);
      const property = data.properties;
      // @ts-ignore
      this.stroke = statusColor[property.status];
    }
  }

  lf.register({
    type: 'finsh',
    view: CircleNode,
    model: FinshModel,
  })


  class ActionModel extends PolylineEdgeModel { 
    constructor(data: BaseNodeModel, graphModel: GraphModel) {
      super(data, graphModel);
      const property = data.properties as any;
      // @ts-ignore
      this.stroke = statusColor[property.status];
      // @ts-ignore
      this.hoverStroke = statusColor[property.status];
      // @ts-ignore
      this.selectedStroke = statusColor[property.status];
    }
  }

  lf.register({
    type: 'action',
    view: PolylineEdge,
    model: ActionModel,
  })
}