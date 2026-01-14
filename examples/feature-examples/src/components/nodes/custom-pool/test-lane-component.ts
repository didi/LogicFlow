/**
 * 泳道组件测试文件
 * 用于验证基于DynamicGroup重新实现的泳道组件功能
 */
import LogicFlow from '@logicflow/core'
import { LaneNode } from './NewLane'

// 创建LogicFlow实例
const lf = new LogicFlow({
  container: document.createElement('div'),
  grid: true,
  width: 1000,
  height: 600,
})

// 注册泳道节点
lf.register(LaneNode)

// 渲染测试数据
const testNodes = [
  {
    id: 'lane1',
    type: 'lane',
    x: 300,
    y: 200,
    properties: {
      name: '开发团队',
      processRef: 'dev-team',
      direction: 'horizontal',
    },
  },
  {
    id: 'lane2',
    type: 'lane',
    x: 300,
    y: 350,
    properties: {
      name: '测试团队',
      processRef: 'test-team',
      direction: 'horizontal',
    },
  },
]

// 渲染测试
console.log('泳道组件测试:')
console.log(
  '1. 组件注册成功:',
  lf.getNodeModelById('lane1')?.constructor?.name === 'LaneModel',
)
console.log('2. 默认尺寸设置:', lf.getNodeModelById('lane1')?.width === 570)
console.log('3. 禁止拖拽:', lf.getNodeModelById('lane1')?.draggable === false)
console.log(
  '4. 允许调整大小:',
  lf.getNodeModelById('lane1')?.resizable === true,
)
console.log('5. 层级设置:', lf.getNodeModelById('lane1')?.zIndex === 2)

// 使用测试数据
console.log('测试节点数量:', testNodes.length)

console.log('泳道组件测试完成!')

export {}
