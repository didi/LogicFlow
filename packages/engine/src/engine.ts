type Lu = (instance: Engine) => any;

type LogicElementOut = {
  outputName: string;
  outputDesc: string;
};

type LogicNodeData = {
  id: string;
  type: string;
  properties?: Record<string, any>;
  output?: LogicElementOut[];
  x: number;
  y: number;
};

type LogicElementChild = {
  targetNodeId: string,
  sourceOutputName: string
};

type LogicElement = {
  children: LogicElementChild[];
} & LogicNodeData;

type LogicEdgeData = {
  sourceNodeId: string;
  targetNodeId: string;
  type: string;
  sourceOutputName: string,
};

type LogicModel = {
  properties: { startNode: string } & Record<string, any>;
  nodes: LogicNodeData[];
  edges: LogicEdgeData[];
};
export class Engine {
  luMaps: Record<string, Lu>;
  currentTaskId: string;
  logicModel: LogicModel;
  logicElementMap: Record<string, LogicElement>;
  currentTaskElement: LogicElement;
  flowDataMap: Map<string, any>;
  logicEdgeMap: Record<string, any>;
  constructor() {
    console.log(1);
    this.flowDataMap = new Map();
  }
  batchRegisterLu(Lus) {
    this.luMaps = Lus.reduce((nMap, model, index) => {
      nMap[model.type] = model.lu;
      return nMap;
    }, {});
  }
  next(outputName) {
    const nextNode = this.getNextTask(outputName);
    if (nextNode) {
      this.currentTaskId = nextNode.id;
      this.currentTaskElement = nextNode;
      this.execLu(this.currentTaskElement);
    }
  }
  private getNextTask(outputName) {
    const { children } = this.currentTaskElement;
    if (!children || children.length === 0) {
      return null;
    }

    // const defaultOutput = children[0];
    if (!outputName) {
      return this.logicElementMap[children[0].targetNodeId];
    }

    const child = children.find(o => o.sourceOutputName === outputName);
    if (!child || !child.targetNodeId) {
      return null;
    }
    return this.logicElementMap[child.targetNodeId];
  }
  run(logic) {
    console.log(11);
    this.logicModel = logic;
    const { nodes, edges } = this.logicModel;
    this.logicElementMap = nodes.reduce((nMap, element) => {
      nMap[element.id] = element;
      return nMap;
    }, {});
    edges.forEach(edge => {
      const { sourceNodeId, targetNodeId, sourceOutputName } = edge;
      const element = this.logicElementMap[sourceNodeId];
      if (!element.children) {
        element.children = [];
      }
      element.children.push({
        targetNodeId,
        sourceOutputName,
      });
    });
    this.currentTaskId = this.logicModel.properties.startNode;
    this.currentTaskElement = this.logicElementMap[this.currentTaskId];
    this.execLu(this.currentTaskElement);
  }
  execLu(logicElement: LogicElement) {
    const lu = this.luMaps[logicElement.type];
    if (lu) {
      lu.call(null, this, logicElement);
    } else {
      console.error(`找不到逻辑单元${logicElement.type}, 请确认是否注册。`);
    }
  }
  setFlowData(key, value) {
    this.flowDataMap.set(key, value);
  }
  getFlowData(key) {
    return this.flowDataMap.get(key);
  }
}
