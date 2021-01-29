import LogicFlow from "@logicflow/core"
import GraphModel from "@logicflow/core/types/model/GraphModel";
import BaseNodeModel from "@logicflow/core/types/model/node/BaseNodeModel";
import { nodeProperty } from '../type';

type CircleNode = {
  CircleNode: any;
  CircleNodeModel: any;
}

type RectNode = {
  RectNode: any;
  RectNodeModel: any;
  h: any;
}

type PolygonNode = {
  PolygonNode: any;
  PolygonNodeModel: any;
}

type PolylineEdge = {
  PolylineEdge: any;
  PolylineEdgeModel: any;
}

const statusColor = {
  0: 'grey',
  1: 'green',
  2: 'red'
}

export default function RegisteNode(lf: LogicFlow) {
  
  lf.register('apply', ({ CircleNode, CircleNodeModel }: CircleNode) => {
    class ApplyModel extends CircleNodeModel { 
      constructor(data: BaseNodeModel, graphModel: GraphModel) {
        super(data, graphModel);
        const property = data.properties;
        // @ts-ignore
        this.stroke = statusColor[property.status];
      }
    }
    return {
      view: CircleNode,
      model: ApplyModel,
    }
  })

  lf.register('approver', ({ RectNode, RectNodeModel, h }: RectNode): any => {
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
      constructor(data: BaseNodeModel, graphModel: GraphModel) {
        super(data, graphModel);
        const property = data.properties;
        // @ts-ignore
        this.stroke = statusColor[property.status];
      }
    }
    return {
      view: ApproverNode,
      model: ApproverModel,
    }
  })

  lf.register('jugement', ({ PolygonNode, PolygonNodeModel }: PolygonNode) => {
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
    return {
      view: PolygonNode,
      model: JugementModel,
    }
  })

  lf.register('finsh', ({ CircleNode, CircleNodeModel }: CircleNode) => {
    class FinshModel extends CircleNodeModel { 
      constructor(data: BaseNodeModel, graphModel: GraphModel) {
        super(data, graphModel);
        const property = data.properties;
        // @ts-ignore
        this.stroke = statusColor[property.status];
      }
    }
    return {
      view: CircleNode,
      model: FinshModel,
    }
  })

  lf.register('action', ({ PolylineEdge, PolylineEdgeModel }: PolylineEdge) => {
    console.log(PolylineEdge, PolylineEdgeModel);
    // @ts-ignore
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
    return {
      view: PolylineEdge,
      model: ActionModel,
    }
  })
}