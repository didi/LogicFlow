
/**
 * 模拟按钮组件
 * 在组件配置的时候，可以选择给组件绑定逻辑
 * 这里假设给按钮绑定逻辑。
 * 那么在运行的时候，因为是按钮绑定的逻辑。
 * 逻辑单元分类： 自动驱动、手动驱动
 */
let ButtonBindLogic = {
  properties: {
    startNode: 'node_1',
  },
  nodes: [
    {
      id: 'node_1',
      type: 'LogicButtonClick',
      properties: {
      },
      text: '点击按钮',
      x: 100,
      y: 100,
    },
    {
      id: 'node_2',
      type: 'LogicDialogOpen',
      text: '打开弹框',
      output: [
        {
          outputName: 'default',
          outputDesc: '确定'
        },
        {
          outputName: 'cancel',
          outputDesc: '取消'
        }
      ],
      x: 300,
      y: 100,
    },
    {
      id: 'node_3',
      type: 'LoadingDialog',
      text: '显示加载中...',
      properties: {
        action: 'show',
      },
      x: 500,
      y: 100,
    },
    {
      id: 'node_4',
      type: 'TipsDialog',
      text: '提示取消',
      properties: {
        tip: '你点击了取消。',
        type: 'error'
      },
      x: 500,
      y: 200,
    },
    {
      id: 'node_5',
      type: 'FetchData',
      text: '加载数据',
      properties: {
      },
      x: 700,
      y: 100,
    },
    {
      id: 'node_6',
      type: 'LoadingDialog',
      text: '隐藏加载中',
      properties: {
        action: 'hide',
      },
      x: 900,
      y: 100,
    },
    {
      id: 'node_7',
      type: 'RenderTable',
      text: '渲染表格',
      x: 1100,
      y: 100,
    }
  ],
  edges: [
    {
      type: 'LogicLine',
      sourceNodeId: 'node_1',
      targetNodeId: 'node_2'
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_2',
      targetNodeId: 'node_3', 
      sourceOutputName: 'default',
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_2',
      targetNodeId: 'node_4',
      sourceOutputName: 'cancel',
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_3',
      targetNodeId: 'node_5'
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_5',
      targetNodeId: 'node_6'
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_6',
      targetNodeId: 'node_7'
    },
  ]
};

function updateLogicData (data) {
  ButtonBindLogic = data;
}
function getLogicData (data) {
  return ButtonBindLogic
}
export {
  ButtonBindLogic,
  updateLogicData,
  getLogicData
}