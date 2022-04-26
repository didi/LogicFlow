/**
 * 按钮被点击的逻辑单元
 */
export function buttonClickLu(instance) {
  console.log('buttonClickLu')
  instance.next()
}

/**
 * 弹框显示的逻辑单元
 */
export function DialogShowLu(instance) {
  console.log('DialogShowLu')
  instance.next()
}

export function LoadingLu(instance) {
  console.log('LoadingLu')
  instance.next()
}

/**
 * 弹框关闭的逻辑单元
 */
 export function DialogHideLu(instance) {
  console.log('DialogHideLu')
  instance.next()
 }

/**
 * 获取数据逻辑单元
 */
 export function FetchDataLu(instance) {
  console.log('FetchDataLu')
  instance.next()
 }

/**
 * 更新表单逻辑单元
 */
 export function UpdateTableLu(instance) {
  console.log('UpdateTableLu')
  instance.next()
 }

/**
 * 模拟按钮组件
 * 在组件配置的时候，可以选择给组件绑定逻辑
 * 这里假设给按钮绑定逻辑。
 * 那么在运行的时候，因为是按钮绑定的逻辑。
 */
export const ButtonBindLogic = {
  nodes: [
    {
      id: 'node_1',
      type: 'LogicButtonClick',
      x: 100,
      y: 100,
    },
    {
      id: 'node_2',
      type: 'LogicDialogOpen',
      x: 200,
      y: 100,
      properties: {
        output: [
          {
            id: 'anchor_2ae1s1',
            name: 'default',
            desc: '确定'
          },
          {
            id: 'anchor_2ae1s2',
            name: 'cancel',
            desc: '取消'
          }
        ]
      }
    },
    {
      id: 'node_3',
      type: 'LoadingDialogShow',
      x: 300,
      y: 100
    },
    {
      id: 'node_4',
      type: 'TipsDialogShow',
      x: 300,
      y: 200
    }
  ],
  edges: [
    {
      type: 'LogicLine',
      sourceNodeId: 'node_1',
      targetNodeId: 'node_2',
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_2',
      targetNodeId: 'node_3',
      properties: {
        incoming: 'anchor_2ae1s1'
      }
    },
    {
      type: 'LogicLine',
      sourceNodeId: 'node_2',
      targetNodeId: 'node_4',
      properties: {
        incoming: 'anchor_2ae1s2'
      }
    }
  ]
};
