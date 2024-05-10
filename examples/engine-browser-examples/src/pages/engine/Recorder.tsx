import { useRef } from 'react'
import { Engine } from '@logicflow/engine'

export default function GetStarted() {
  const engineRef = useRef<Engine>()
  const init = async () => {
    const engine = new Engine()
    engineRef.current = engine
    const flowData = {
      /**
       * node1 |--> node2
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
            type: 'TaskNode',
            properties: {},
          },
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          },
        ],
      },
      global: {},
    }
    engine.load(flowData)
    // 获取执行结果
    const result = await engine.execute()
    console.log('result --->>>', result)

    // 获取执行记录
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const execution = await engine.getExecutionRecord(result?.executionId)
    console.log('execution --->>>', execution)

    const executionIds = await engine.getExecutionList()
    console.log('executionIds ===>>>', executionIds)

    // Test1: 'Using the getExecutionRecord API, receive the complete execution record of the process.'
    // expect(execution.length).toBe(2);
    // expect(execution[1]).toHaveProperty('actionId');
    // expect(execution[1]).toHaveProperty('nodeId');
    // expect(execution[1]).toHaveProperty('executionId');
    // expect(execution[1]).toHaveProperty('nodeType');
    // expect(execution[1]).toHaveProperty('timestamp');
    // expect(execution[1]).toHaveProperty('properties');
    // expect(execution[1].nodeId).toBe('node2');
    // expect(execution[1].nodeType).toBe('TaskNode');
    // const executionIds = await engine.getExecutionList();
    // expect(executionIds.length).toBe(1);

    // Test2: The execution record cannot be obtained when the number of executions exceeds the maximum number of executions.
    // engine.load(flowData);
    // engine.recorder.setMaxRecorderNumber(2);
    // const result = await engine.execute();
    // await engine.execute();
    // await engine.execute();
    // const execution = await engine.getExecutionRecord(result.executionId);
    // expect(execution).toBe(null);

    // Test3: the number of execution records obtained by the getExecutionList api is correct.
    // const engine = new Engine();
    // engine.load(flowData);
    // await engine.execute();
    // await engine.execute();
    // const engine1 = new Engine();
    // engine1.load(JSON.parse(JSON.stringify(flowData)));
    // await engine1.execute();
    //
    // const execution = await engine.getExecutionList();
    // const execution1 = await engine1.getExecutionList();
    // expect(execution.length).toEqual(2);
    // expect(execution1.length).toEqual(1);
    // const recorder = new Recorder({
    //   instanceId: engine1.instanceId
    // })
    // const execution2 = await recorder.getExecutionList();
    // expect(execution2.length).toEqual(1);
  }

  return (
    <div>
      <h1>The Recorder Demo</h1>
      <button onClick={() => init()}>开始运行</button>
    </div>
  )
}
