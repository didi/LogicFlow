import LogicFlow from '@logicflow/core'
import { poolConfig, TitlePosition } from '../../src/pool/constant'
import { PoolElements } from '../../src/pool'

type PoolDirection = 'horizontal' | 'vertical'

export function createPoolTitleProperties(
  titlePosition?: TitlePosition,
): Record<string, unknown> {
  return titlePosition ? { titlePosition } : {}
}

export function createContainer() {
  const container = document.createElement('div')
  container.style.width = '1200px'
  container.style.height = '800px'
  document.body.appendChild(container)
  return container
}

export function createPoolLF(options: Record<string, unknown> = {}) {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    allowResize: true,
    plugins: [PoolElements],
    pluginsOptions: {
      PoolElements: options,
    },
  })
}

export function createHorizontalPoolGraph() {
  return {
    nodes: [
      {
        id: 'pool_1',
        type: 'pool',
        x: 400,
        y: 300,
        text: '横向泳池',
        properties: {
          direction: 'horizontal',
          width: 520,
          height: 360,
        },
      },
    ],
    edges: [],
  }
}

export function createVerticalPoolGraph() {
  return {
    nodes: [
      {
        id: 'pool_1',
        type: 'pool',
        x: 400,
        y: 300,
        text: '纵向泳池',
        properties: {
          direction: 'vertical',
          width: 360,
          height: 520,
        },
      },
    ],
    edges: [],
  }
}

export function createPoolWithTwoLanes(
  direction: PoolDirection = 'horizontal',
) {
  const isHorizontal = direction === 'horizontal'
  const poolWidth = isHorizontal ? 520 : 360
  const poolHeight = isHorizontal ? 360 : 520
  const laneWidth = isHorizontal
    ? poolWidth - poolConfig.titleSize
    : poolWidth / 2
  const laneHeight = isHorizontal
    ? poolHeight / 2
    : poolHeight - poolConfig.titleSize

  return {
    nodes: [
      {
        id: 'pool_1',
        type: 'pool',
        x: 500,
        y: 260,
        text: '泳池',
        properties: {
          direction,
          width: poolWidth,
          height: poolHeight,
          children: ['lane_1', 'lane_2'],
        },
        children: ['lane_1', 'lane_2'],
      },
      {
        id: 'lane_1',
        type: 'lane',
        x: isHorizontal ? 530 : 410,
        y: isHorizontal ? 170 : 290,
        width: laneWidth,
        height: laneHeight,
        text: '泳道1',
        properties: {
          parent: 'pool_1',
          direction,
          isHorizontal,
        },
      },
      {
        id: 'lane_2',
        type: 'lane',
        x: isHorizontal ? 530 : 590,
        y: isHorizontal ? 350 : 290,
        width: laneWidth,
        height: laneHeight,
        text: '泳道2',
        properties: {
          parent: 'pool_1',
          direction,
          isHorizontal,
        },
      },
    ],
    edges: [],
  }
}

export function createPoolGraphWithNodeInLane() {
  const graph = createPoolWithTwoLanes()
  const lane = graph.nodes.find((node) => node.id === 'lane_1')

  if (lane) {
    lane.children = ['rect_1']
    lane.properties = {
      ...lane.properties,
      children: ['rect_1'],
    }
  }

  graph.nodes.push({
    id: 'rect_1',
    type: 'rect',
    x: 530,
    y: 170,
    width: 80,
    height: 40,
    text: '普通节点',
    properties: {
      parent: 'lane_1',
    },
  })

  return graph
}

export function createTwoPoolGraph() {
  const first = createPoolGraphWithNodeInLane()
  return {
    nodes: [
      ...first.nodes,
      {
        id: 'pool_2',
        type: 'pool',
        x: 900,
        y: 260,
        text: '目标泳池',
        properties: {
          direction: 'horizontal',
          width: 520,
          height: 180,
          children: ['lane_3'],
        },
        children: ['lane_3'],
      },
      {
        id: 'lane_3',
        type: 'lane',
        x: 930,
        y: 260,
        width: 480,
        height: 180,
        text: '目标泳道',
        properties: {
          parent: 'pool_2',
          direction: 'horizontal',
          isHorizontal: true,
        },
      },
    ],
    edges: first.edges,
  }
}

export function getPoolAndLanes(lf: LogicFlow) {
  const pool = lf.getNodeModelById('pool_1') as any
  const lanes = pool.getLanes()
  return { pool, lanes }
}
