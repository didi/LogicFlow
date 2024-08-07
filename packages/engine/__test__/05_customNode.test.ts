import { describe, expect, test } from '@jest/globals'
import Engine, { TaskNode, BaseNode, ActionStatus } from '../src/index'

describe('@logicflow/engine Customize Node', () => {
  class DataNode extends TaskNode {
    async action(): Promise<BaseNode.ActionResult | undefined> {
      this.globalData['dataSource'] = {
        time: (this.context?.getTime as any)(),
      }
      return {
        status: ActionStatus.SUCCESS,
        detail: {
          customData: '2',
        },
      }
    }
  }

  class Mod2Node extends TaskNode {
    async action(): Promise<BaseNode.ActionResult | undefined> {
      const dataSource: any = this.globalData['dataSource']
      if (dataSource && dataSource.time) {
        dataSource.time % 2 === 0
          ? (this.globalData['output'] = 'even')
          : (this.globalData['output'] = 'odd')
      }
      return undefined
    }
  }

  class OutputNode extends TaskNode {
    async action(): Promise<BaseNode.ActionResult | undefined> {
      const output: any = this.globalData['output']
      if (this.properties) {
        this.properties['output'] = output
      } else {
        this.properties = {}
        this.properties['output'] = output
      }
      return undefined
    }
  }

  const engine = new Engine({
    context: {
      getTime() {
        return new Date().getTime()
      },
    },
    debug: true,
  })
  engine.register({
    type: 'DataNode',
    model: DataNode,
  })
  engine.register({
    type: 'Mod2Node',
    model: Mod2Node,
  })
  engine.register({
    type: 'OutputNode',
    model: OutputNode,
  })

  const flowData = {
    /**
     *  node1 |--> node2(DataNode) |--> node3(Mod2Node) |--> node4(OutputNode)
     */
    graphData: {
      nodes: [
        {
          id: 'node1',
          type: 'StartNode',
          properties: {},
        },
        {
          id: 'node2',
          type: 'DataNode',
          properties: {},
        },
        {
          id: 'node3',
          type: 'Mod2Node',
          properties: {},
        },
        {
          id: 'node4',
          type: 'OutputNode',
          properties: {},
        },
      ],
      edges: [
        {
          id: 'edge1',
          sourceNodeId: 'node1',
          targetNodeId: 'node2',
          properties: {},
        },
        {
          id: 'edge2',
          sourceNodeId: 'node2',
          targetNodeId: 'node3',
          properties: {},
        },
        {
          id: 'edge3',
          sourceNodeId: 'node3',
          targetNodeId: 'node4',
          properties: {},
        },
      ],
    },
    globalData: {},
  }
  engine.load(flowData)
  test('When the process is completed, the output field in the properties attribute of the last node is odd or even.', async () => {
    const result = await engine.execute()
    const execution = await engine.getExecutionRecord(result.executionId)
    expect(
      ['odd', 'even'].indexOf(
        <string>execution?.[execution?.length - 1]?.properties?.output,
      ) !== -1,
    ).toBe(true)
  })
  test('Execution records will contain return detail', async () => {
    const result = await engine.execute()
    const execution = await engine.getExecutionRecord(result.executionId)
    expect(execution?.[1]?.detail?.customData).toBe('2')
  })
})
