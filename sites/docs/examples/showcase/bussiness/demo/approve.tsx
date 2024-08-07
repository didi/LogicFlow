import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Select, Input, Button } from 'antd';

const container = document.querySelector('#container');
const root = createRoot(container);
const { DndPanel } = Extension;

type IApproveUser = {
  label: string;
  value: string;
};

type nodeProperty = {
  labelColor: string;
  approveTypeLabel: string;
  approveType: string;
};

// 主题
const themeApprove = {
  rect: {
    stroke: '#3CB371',
  },
  circle: {
    stroke: '#FF6347',
  },
  polygon: {
    stroke: '#6495ED',
  },
  polyline: {
    strokeWidth: 1,
  },
  edgeText: {
    background: {
      fill: 'white',
    },
  },
};

// 拖拽面板数据
const panelNodes = [
  {
    type: 'apply',
    label: '申请',
    text: '申请',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/case/bussiness/approve/circle.png',
    properties: {
      r: 40,
      username: '',
      time: '',
      startTime: '',
      endTime: '',
    },
  },
  {
    type: 'approver',
    label: '审批',
    text: '审批',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/case/bussiness/approve/rect.png',
    properties: {
      width: 80,
      height: 60,
    },
  },
  {
    type: 'jugement',
    label: '判断',
    text: '判断',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/case/bussiness/approve/polygon.png',
  },
  {
    type: 'finsh',
    label: '结束',
    text: '结束',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/case/bussiness/approve/circle.png',
    properties: {
      r: 40,
    },
  },
];

// 审批节点类型
const approveUser = [
  {
    label: '直接上级',
    value: 'leader',
  },
  {
    label: 'T3领导',
    value: 't3Leader',
  },
  {
    label: 'T2领导',
    value: 't2Leader',
  },
  {
    label: 'T1领导',
    value: 't1Leader',
  },
];

// 画布数据
const graphData = {
  nodes: [
    {
      id: '28df2fbe-f32b-4a9b-b544-7e70d7187b33',
      type: 'apply',
      x: 210,
      y: 210,
      text: { x: 210, y: 210, value: '申请' },
      properties: {
        r: 40,
      },
    },
    {
      id: '64179bd7-c60e-433c-8df7-97c8e98f855d',
      type: 'approver',
      x: 350,
      y: 210,
      text: { x: 350, y: 210, value: '审批' },
      properties: {
        labelColor: '#000000',
        approveTypeLabel: '直接上级',
        approveType: 'leader',
        width: 80,
        height: 60,
      },
    },
    {
      id: 'fcb96f10-720e-40e5-8ed0-ebdd0a46f234',
      type: 'jugement',
      x: 510,
      y: 210,
      text: { x: 510, y: 210, value: '判断报销是否\n大于1000元' },
      properties: { api: '' },
    },
    {
      id: '9f119df3-c449-4e5d-a67a-cb351b9cbdb5',
      type: 'approver',
      x: 670,
      y: 210,
      text: { x: 670, y: 210, value: '审批' },
      properties: {
        labelColor: '#000000',
        approveTypeLabel: 'T2领导',
        approveType: 't2Leader',
        width: 80,
        height: 60,
      },
    },
    {
      id: 'ef34f09c-38ea-4ad4-acd2-cc2f464a2be6',
      type: 'finsh',
      x: 850,
      y: 210,
      text: { x: 850, y: 210, value: '结束' },
      properties: {
        r: 40,
      },
    },
  ],
  edges: [
    {
      id: '0d87b1eb-2389-445a-9f34-6227940b2072',
      type: 'polyline',
      sourceNodeId: '28df2fbe-f32b-4a9b-b544-7e70d7187b33',
      targetNodeId: '64179bd7-c60e-433c-8df7-97c8e98f855d',
      startPoint: { x: 235, y: 210 },
      endPoint: { x: 300, y: 210 },
      text: { x: 51.25, y: 0, value: '' },
      properties: {},
      pointsList: [
        { x: 235, y: 210 },
        { x: 300, y: 210 },
      ],
    },
    {
      id: 'd99e7451-b379-411e-b0da-df11be8be20a',
      type: 'polyline',
      sourceNodeId: '64179bd7-c60e-433c-8df7-97c8e98f855d',
      targetNodeId: 'fcb96f10-720e-40e5-8ed0-ebdd0a46f234',
      startPoint: { x: 400, y: 210 },
      endPoint: { x: 475, y: 210 },
      text: { x: 437.5, y: 210, value: '通过' },
      properties: {},
      pointsList: [
        { x: 400, y: 210 },
        { x: 475, y: 210 },
      ],
    },
    {
      id: '4c615802-15d8-442c-be22-b65430286123',
      type: 'polyline',
      sourceNodeId: 'fcb96f10-720e-40e5-8ed0-ebdd0a46f234',
      targetNodeId: '9f119df3-c449-4e5d-a67a-cb351b9cbdb5',
      startPoint: { x: 545, y: 210 },
      endPoint: { x: 620, y: 210 },
      text: { x: 582.5, y: 210, value: '是' },
      properties: {},
      pointsList: [
        { x: 545, y: 210 },
        { x: 620, y: 210 },
      ],
    },
    {
      id: '934ae03a-6ee0-4568-a2b4-8bcede565e0b',
      type: 'polyline',
      sourceNodeId: '9f119df3-c449-4e5d-a67a-cb351b9cbdb5',
      targetNodeId: 'ef34f09c-38ea-4ad4-acd2-cc2f464a2be6',
      startPoint: { x: 720, y: 210 },
      endPoint: { x: 825, y: 210 },
      text: { x: -10, y: 0, value: '' },
      properties: {},
      pointsList: [
        { x: 720, y: 210 },
        { x: 825, y: 210 },
      ],
    },
    {
      id: 'bd5e1dd0-1978-46f7-851b-d31c03aebee9',
      type: 'polyline',
      sourceNodeId: '64179bd7-c60e-433c-8df7-97c8e98f855d',
      targetNodeId: 'ef34f09c-38ea-4ad4-acd2-cc2f464a2be6',
      startPoint: { x: 350, y: 170 },
      endPoint: { x: 850, y: 185 },
      text: { x: 600, y: 140, value: '驳回' },
      properties: {},
      pointsList: [
        { x: 350, y: 170 },
        { x: 350, y: 140 },
        { x: 850, y: 140 },
        { x: 850, y: 185 },
      ],
    },
    {
      id: '453139c3-faa1-4e3a-a413-38f251243baa',
      type: 'polyline',
      sourceNodeId: 'fcb96f10-720e-40e5-8ed0-ebdd0a46f234',
      targetNodeId: 'ef34f09c-38ea-4ad4-acd2-cc2f464a2be6',
      startPoint: { x: 510, y: 245 },
      endPoint: { x: 850, y: 235 },
      text: { x: 680, y: 275, value: '否' },
      properties: {},
      pointsList: [
        { x: 510, y: 245 },
        { x: 510, y: 275 },
        { x: 850, y: 275 },
        { x: 850, y: 235 },
      ],
    },
  ],
};

// 注册自定义节点
const RegisteNodes = (lf: LogicFlow) => {
  class ApplyNodeModel extends CircleNodeModel {
    getConnectedTargetRules(): ConnectRule[] {
      const rules = super.getConnectedTargetRules();
      const geteWayOnlyAsTarget = {
        message: '开始节点只能连出，不能连入！',
        validate: (source: BaseNodeModel, target: BaseNodeModel) => {
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
  });

  class ApproverNode extends RectNode {
    static extendKey = 'UserTaskNode';
    getLabelShape() {
      const { x, y, width, height, properties } = this.props.model;
      const { labelColor, approveTypeLabel } = properties as nodeProperty;
      return h(
        'text',
        {
          fill: labelColor,
          fontSize: 12,
          x: x - width / 2 + 5,
          y: y - height / 2 + 15,
          width: 50,
          height: 25,
        },
        approveTypeLabel,
      );
    }
    getShape() {
      const { x, y, width, height, radius } = this.props.model;
      const style = this.props.model.getNodeStyle();
      return h('g', {}, [
        h('rect', {
          ...style,
          x: x - width / 2,
          y: y - height / 2,
          rx: radius,
          ry: radius,
          width,
          height,
        }),
        this.getLabelShape(),
      ]);
    }
  }
  class ApproverModel extends RectNodeModel {
    constructor(data: any, graphModel: GraphModel) {
      super(data, graphModel);
      this.properties = {
        labelColor: '#000000',
        approveTypeLabel: '',
        approveType: '',
      };
    }
  }
  lf.register({
    type: 'approver',
    view: ApproverNode,
    model: ApproverModel,
  });

  class JugementModel extends PolygonNodeModel {
    constructor(data: any, graphModel: GraphModel) {
      super(data, graphModel);
      this.points = [
        [35, 0],
        [70, 35],
        [35, 70],
        [0, 35],
      ];
      this.properties = {
        api: '',
      };
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
        validate: (source: BaseNodeModel) => {
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
  });
};

const PropertyPanel: React.FC = ({
  nodeData,
  updateproperty,
  hidePropertyPanel,
}) => {
  const getApproveList: React.FC = () => {
    const approveUserOption: JSX.Element[] = [];
    approveUser.forEach((item: IApproveUser) => {
      approveUserOption.push(
        <Select.Option value={item.value}>{item.label}</Select.Option>,
      );
    });
    const approveSelect = (
      <Form.Item
        key="select"
        className="form-property"
        label="审核节点类型"
        name="approveType"
      >
        <Select>{approveUserOption}</Select>
      </Form.Item>
    );
    return approveSelect;
  };
  const getApiUrl = () => {
    const Api = (
      <Form.Item label="API" name="api">
        <Input />
      </Form.Item>
    );
    return Api;
  };
  const onFormLayoutChange = (value: any) => {
    approveUser.forEach((item) => {
      if (item.value === value.approveType) {
        value['approveTypeLabel'] = item.label;
      }
    });
    updateproperty(nodeData.id, value);
  };
  return (
    <div key={nodeData.id}>
      <h2>属性面板</h2>
      <Form
        layout="inline"
        initialValues={nodeData.properties}
        onValuesChange={onFormLayoutChange}
      >
        <span className="form-property">
          类型：<span>{nodeData.type}</span>
        </span>
        <span className="form-property">
          文案：<span>{nodeData.text?.value}</span>
        </span>
        {nodeData.type === 'approver' ? getApproveList() : ''}
        {nodeData.type === 'jugement' ? getApiUrl() : ''}
      </Form>
      <div>
        <h3>......</h3>
        <h3>业务属性可根据需要进行自定义扩展</h3>
      </div>
      <div className="property-panel-footer">
        <Button
          className="property-panel-footer-hide"
          type="primary"
          icon={<DownOutlined />}
          onClick={hidePropertyPanel}
        >
          收起
        </Button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const container = useRef(null);
  const lfRef = useRef(null);
  const [nodeData, setNodeData] = useState(null);

  const initEvent = (lf: LogicFlow) => {
    lf.on('element:click', ({ data }) => {
      setNodeData(data);
    });
    lf.on('connection:not-allowed', (data: any) => {
      message.error(data.msg);
    });
  };

  useEffect(() => {
    lfRef.current = new LogicFlow({
      container: container.current,
      stopScrollGraph: true,
      stopZoomGraph: true,
      grid: {
        size: 10,
        visible: true,
        type: 'mesh',
        config: {
          color: '#DCDCDC', // 设置网格的颜色
        },
      },
      keyboard: { enabled: true },
      style: themeApprove,
      plugins: [DndPanel],
    });
    RegisteNodes(lfRef.current);
    lfRef.current.render(graphData);
    lfRef.current.translateCenter();
    initEvent(lfRef.current);
    lfRef.current.setPatternItems(panelNodes);
  }, []);

  // 更新属性
  const updateProperty = (id: string, data: any) => {
    const node = lfRef.current.graphModel.nodesMap[id];
    const edge = lfRef.current.graphModel.edgesMap[id];
    if (node) {
      node.model.setProperties(Object.assign(node.model.properties, data));
    } else if (edge) {
      edge.model.setProperties(Object.assign(edge.model.properties, data));
    }
  };
  // 隐藏属性面板
  const hidePropertyPanel = () => {
    setNodeData(null);
  };

  return (
    <>
      <div id="graph" ref={container}></div>
      {nodeData ? (
        <PropertyPanel
          nodeData={nodeData}
          updateProperty={updateProperty}
          hidePropertyPanel={hidePropertyPanel}
        ></PropertyPanel>
      ) : null}
    </>
  );
};

root.render(<App></App>);

insertCss(`
#graph {
  width: 100%;
  height: 100%;
}
.lf-dnd-shape {
  background-size: contain;
}
`);

// .approve-example-container {
//   position: relative;
//   height: 100%;
// }
// .node-panel {
//   position: absolute;
//   top: 10px;
//   left: 10px;
//   width: 70px;
//   padding: 20px 10px;
//   background-color: white;
//   box-shadow: 0 0 10px 1px rgb(228, 224, 219);
//   border-radius: 6px;
//   text-align: center;
//   z-index: 101;
// }
// .approve-node {
//   display: inline-block;
//   margin-bottom: 20px;
// }
// .node-label {
//   font-size: 12px;
//   margin-top: 5px;
// }
// .node-jugement .node-label {
//   margin-top: 15px;
// }
// .property-panel {
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   width: 100%;
//   padding: 20px;
//   margin: 0;
//   background-color: white;
//   border-top-left-radius: 6px;
//   border-top-right-radius: 6px;
//   z-index: 101;
//   box-shadow: 0 0 10px 1px rgb(228, 224, 219);
// }
// .property-panel-footer {
//   width: 100%;
//   text-align: center;
// }
// .property-panel-footer .property-panel-footer-hide {
//   width: 200px;
// }
// .approve-example-container .lf-control{
//   position: fixed;
//   top: 10px;
//   left: calc(50vw - 150px);
//   width: 275px;
//   box-shadow: 0 0 10px #888888;
// }
// .form-property{
//   width: 30%;
// }
// .hover-panel{
//   position: fixed;
// }
