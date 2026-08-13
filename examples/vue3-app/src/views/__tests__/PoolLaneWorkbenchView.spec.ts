import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LogicFlow from '@logicflow/core'
import { Control, DynamicGroup, PoolElements, SelectionSelect } from '@logicflow/extension'
import PoolLaneWorkbenchView from '../PoolLaneWorkbenchView.vue'

type MockNode = {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, unknown>
  children?: Set<string>
  setProperties?: (properties: Record<string, unknown>) => void
}

const eventHandlers = new Map<string, Array<(payload?: unknown) => void>>()
const mockNodes = new Map<string, MockNode>()
let selectedNodes: MockNode[] = []

function createNode(node: Partial<MockNode> & Pick<MockNode, 'id' | 'type'>): MockNode {
  const model: MockNode = {
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    properties: {},
    ...node
  }
  model.setProperties = (properties: Record<string, unknown>) => {
    model.properties = { ...model.properties, ...properties }
  }
  return model
}

function emitLfEvent(name: string, payload?: unknown) {
  eventHandlers.get(name)?.forEach((handler) => handler(payload))
}

function selectNode(id: string) {
  const node = mockNodes.get(id)
  selectedNodes = node ? [node] : []
  emitLfEvent('selection:selected', { data: { id } })
}

function selectNodes(ids: string[]) {
  selectedNodes = ids.flatMap((id) => {
    const node = mockNodes.get(id)
    return node ? [node] : []
  })
  emitLfEvent('selection:selected', {
    elements: selectedNodes.map((node) => ({ id: node.id, type: node.type }))
  })
}

vi.mock('@logicflow/core', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      const lf = {
        graphModel: {
          nodes: Array.from(mockNodes.values()),
          selectNodes: selectedNodes
        },
        extension: {
          PoolElements: {
            nodeLaneMap: new Map<string, string>(),
            cascadeDeleteChildren: true,
            minLaneCount: 1,
            collapse: { pool: true, lane: true }
          }
        },
        dnd: { startDrag: vi.fn() },
        register: vi.fn(),
        on: vi.fn((name: string, handler: (payload?: unknown) => void) => {
          const handlers = eventHandlers.get(name) ?? []
          handlers.push(handler)
          eventHandlers.set(name, handlers)
        }),
        render: vi.fn(() => undefined),
        getSelectElements: vi.fn(() => ({
          nodes: selectedNodes,
          edges: []
        })),
        getNodeModelById: vi.fn((id: string) => mockNodes.get(id)),
        getGraphData: vi.fn(() => ({ nodes: [], edges: [] })),
        destroy: vi.fn()
      }
      Object.defineProperty(lf.graphModel, 'selectNodes', {
        get: () => selectedNodes
      })
      return lf
    })
  }
})

vi.mock('@logicflow/extension', () => ({
  Control: vi.fn(),
  DynamicGroup: vi.fn(),
  PoolElements: vi.fn(),
  SelectionSelect: vi.fn(),
  dynamicGroup: {
    type: 'dynamic-group',
    view: vi.fn(),
    model: vi.fn()
  }
}))

describe('PoolLaneWorkbenchView', () => {
  async function mountWorkbench() {
    eventHandlers.clear()
    mockNodes.clear()
    selectedNodes = []
    mockNodes.set(
      'pool_1',
      createNode({
        id: 'pool_1',
        type: 'pool',
        width: 520,
        height: 360,
        properties: {
          titlePosition: 'left',
          minLaneCount: 1
        },
        children: new Set(['lane_1'])
      })
    )
    mockNodes.set(
      'lane_1',
      createNode({
        id: 'lane_1',
        type: 'lane',
        width: 500,
        height: 180,
        properties: {
          parent: 'pool_1',
          titlePosition: 'left',
          isRestrict: true,
          autoResize: false
        },
        children: new Set(['node_a'])
      })
    )
    mockNodes.set(
      'dynamic_group_1',
      createNode({
        id: 'dynamic_group_1',
        type: 'dynamic-group',
        width: 360,
        height: 220,
        properties: {
          isRestrict: false,
          autoResize: false,
          transformWithContainer: true,
          collapsible: true
        },
        children: new Set()
      })
    )

    const wrapper = mount(PoolLaneWorkbenchView, {
      attachTo: document.body,
      global: {
        stubs: {
          'el-button': { template: '<div><slot /></div>' },
          'el-button-group': { template: '<div><slot /></div>' },
          'el-checkbox': { template: '<div><slot /></div>' },
          'el-input-number': { template: '<div><slot /></div>' },
          'el-option': { template: '<div><slot /></div>' },
          'el-select': { template: '<div><slot /></div>' },
          'el-switch': {
            props: ['modelValue'],
            emits: ['update:modelValue', 'change'],
            template:
              '<button class="mock-switch" @click="$emit(`update:modelValue`, !modelValue); $emit(`change`, !modelValue)"><slot /></button>'
          },
          'el-tag': { template: '<div><slot /></div>' }
        }
      }
    })
    await nextTick()
    return wrapper
  }

  it('shows node configuration only after a configurable node is selected', async () => {
    const wrapper = await mountWorkbench()

    expect(wrapper.text()).toContain('选中节点配置')
    expect(wrapper.text()).toContain('请选择单个 Pool、Lane 或 DynamicGroup')
    expect(wrapper.text()).not.toContain('Pool 标题位置')
    expect(wrapper.text()).not.toContain('Lane 标题位置')

    selectNode('pool_1')
    await nextTick()
    expect(wrapper.text()).toContain('选中 Pool 配置')
    expect(wrapper.text()).toContain('Pool 标题位置')
    expect(wrapper.text()).toContain('Pool 最小 Lane 数')
    expect(wrapper.text()).toContain('Lane 默认标题位置')
    expect(wrapper.text()).not.toContain('Lane 标题位置')

    selectNode('lane_1')
    await nextTick()
    expect(wrapper.text()).toContain('选中 Lane 配置')
    expect(wrapper.text()).toContain('Lane 标题位置')
    expect(wrapper.text()).not.toContain('限制子节点拖出')
    expect(wrapper.text()).not.toContain('自动调整尺寸')
    expect(wrapper.text()).not.toContain('Pool 最小 Lane 数')
  })

  it('shows inherited group behavior options when DynamicGroup is selected', async () => {
    const wrapper = await mountWorkbench()

    const compareButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Pool + DynamicGroup'))
    await compareButton!.trigger('click')
    await nextTick()
    selectNode('dynamic_group_1')
    await nextTick()

    expect(wrapper.text()).toContain('选中 DynamicGroup 配置')
    expect(wrapper.text()).toContain('限制子节点拖出')
    expect(wrapper.text()).toContain('自动调整尺寸')
    expect(wrapper.text()).toContain('容器变换联动子节点')
    expect(wrapper.text()).toContain('允许折叠')
    expect(wrapper.text()).not.toContain('Pool 标题位置')
    expect(wrapper.text()).not.toContain('Lane 标题位置')
  })

  it('does not guess a configurable node when multiple nodes are selected', async () => {
    const wrapper = await mountWorkbench()

    selectNodes(['pool_1', 'lane_1'])
    await nextTick()

    expect(wrapper.text()).toContain('请选择单个 Pool、Lane 或 DynamicGroup')
    expect(wrapper.text()).not.toContain('Pool 标题位置')
    expect(wrapper.text()).not.toContain('Lane 标题位置')
  })

  it('uses a full-height canvas shell instead of a fixed half-page graph', async () => {
    const wrapper = await mountWorkbench()

    expect(wrapper.find('.workbench-page').classes()).toContain('full-height')
    expect(wrapper.find('.canvas-wrap').classes()).toContain('canvas-fill')
    expect(wrapper.find('.lf-container').classes()).toContain('canvas-fill')
  })

  it('keeps selection and exception controls in a dedicated action layout', async () => {
    const wrapper = await mountWorkbench()

    expect(wrapper.find('.selection-panel').exists()).toBe(true)
    expect(wrapper.find('.selection-actions').exists()).toBe(true)
    expect(wrapper.find('.exception-toggle').exists()).toBe(true)
  })

  it('offers DynamicGroup only when the comparison mode is enabled', async () => {
    const wrapper = await mountWorkbench()

    expect(wrapper.find('.tool-grid').text()).not.toContain('DynamicGroup')

    const compareButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Pool + DynamicGroup'))
    await compareButton!.trigger('click')
    await nextTick()

    expect(wrapper.find('.tool-grid').text()).toContain('DynamicGroup')
  })

  it('can remount with only the DynamicGroup plugin registered', async () => {
    const wrapper = await mountWorkbench()

    const dynamicGroupOnlyButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('只 DynamicGroup'))
    expect(dynamicGroupOnlyButton).toBeTruthy()

    await dynamicGroupOnlyButton!.trigger('click')
    await nextTick()

    const lastConstructorCall = vi.mocked(LogicFlow).mock.calls.at(-1)?.[0]
    expect(lastConstructorCall?.plugins).toEqual([DynamicGroup, SelectionSelect, Control])
    expect(lastConstructorCall?.plugins).not.toContain(PoolElements)
    expect(wrapper.find('.tool-grid').text()).toContain('DynamicGroup')
    expect(wrapper.find('.tool-grid').text()).not.toContain('Pool')
  })
})
