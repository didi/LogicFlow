// 每一个引擎示例对应则全局数据。
// instanceId, taskId, nodeId
export default class EngineData {
  currentDataMap: Map<any, any>;
  snapshots: []; //
  constructor() {
    this.currentDataMap = new Map();
  }
  update(key, value) {
    this.currentDataMap.set(key, value);
  }
}
