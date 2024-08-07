const TurboType = {
  SEQUENCE_FLOW: 1,
  START_EVENT: 2,
  END_EVENT: 3,
  USER_TASK: 4,
  // SERVICE_TASK = 5, 暂不支持
  EXCLUSIVE_GATEWAY: 6,
}

const TurboTypeMap = {
  1: 'bpmn:sequenceFlow',
  2: 'bpmn:startEvent',
  3: 'bpmn:endEvent',
  4: 'bpmn:userTask',
  6: 'bpmn:exclusiveGateway',
}

// 转换Turbo识别的类型
function getTurboType(type) {
  switch (type) {
    case 'bpmn:sequenceFlow':
      return TurboType.SEQUENCE_FLOW
    case 'bpmn:startEvent':
      return TurboType.START_EVENT
    case 'bpmn:endEvent':
      return TurboType.END_EVENT
    case 'bpmn:userTask':
      return TurboType.USER_TASK
    // case 'bpmn:serviceTask':
    //   return TurboType.SERVICE_TASK;
    case 'bpmn:exclusiveGateway':
      return TurboType.EXCLUSIVE_GATEWAY
    default:
      return type
  }
}

// 将LogicFlow中的Node数据转换为Turbo元素数据
function convertNodeToTurboElement(node) {
  const { id, type, x, y, text = '', properties } = node
  return {
    incoming: [],
    outgoing: [],
    dockers: [],
    type: getTurboType(type),
    properties: {
      ...properties,
      name: (text && text.value) || '',
      x,
      y,
      text,
    },
    key: id,
  }
}

// 将LogicFlow中的Edge数据转换为Turbo元素数据
function convertEdgeToTurboElement(edge) {
  const {
    id,
    type,
    sourceNodeId,
    targetNodeId,
    startPoint,
    endPoint,
    pointsList,
    text = '',
    properties,
  } = edge
  return {
    incoming: [sourceNodeId],
    outgoing: [targetNodeId],
    type: getTurboType(type),
    dockers: [],
    properties: {
      ...properties,
      name: (text && text.value) || '',
      text,
      startPoint: JSON.stringify(startPoint),
      endPoint: JSON.stringify(endPoint),
      pointsList: JSON.stringify(pointsList),
    },
    key: id,
  }
}

// 将LogicFlow中数据转换为Turbo数据
export function toTurboData(data) {
  const nodeMap = new Map()
  const turboData: any = {
    // TODO: 定义类型
    flowElementList: [],
  }
  data.nodes.forEach((node) => {
    const flowElement = convertNodeToTurboElement(node)
    turboData.flowElementList.push(flowElement)
    nodeMap.set(node.id, flowElement)
  })
  data.edges.forEach((edge) => {
    const flowElement = convertEdgeToTurboElement(edge)
    const sourceElement = nodeMap.get(edge.sourceNodeId)
    sourceElement.outgoing.push(flowElement.key)
    const targetElement = nodeMap.get(edge.targetNodeId)
    targetElement.incoming.push(flowElement.key)
    turboData.flowElementList.push(flowElement)
  })
  return turboData
}

// 将Turbo元素数据转换为LogicFlow中的Edge数据
function convertFlowElementToEdge(element) {
  const { incoming, outgoing, properties, key, type } = element
  const { text, name, startPoint, endPoint, pointsList } = properties
  const edge: Record<string, any> = {
    id: key,
    type: TurboTypeMap[type],
    sourceNodeId: incoming[0],
    targetNodeId: outgoing[0],
    text: text || name,
    properties: {},
  }
  if (startPoint) {
    edge.startPoint = JSON.parse(startPoint)
  }
  if (endPoint) {
    edge.endPoint = JSON.parse(endPoint)
  }
  if (pointsList) {
    edge.pointsList = JSON.parse(pointsList)
  }
  // 这种转换方式，在自定义属性中不能与excludeProperties中的属性重名，否则将在转换过程中丢失
  const excludeProperties = ['startPoint', 'endPoint', 'pointsList', 'text']
  Object.keys(element.properties).forEach((property) => {
    if (excludeProperties.indexOf(property) === -1) {
      edge.properties[property] = element.properties[property]
    }
  })
  return edge
}

// 将Turbo元素数据转换为LogicFlow中的Node数据
function convertFlowElementToNode(element) {
  const { properties, key, type, bounds } = element
  let { x, y } = properties
  const { text } = properties
  if (x === undefined) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = bounds
    x = (x1 + x2) / 2
    y = (y1 + y2) / 2
  }
  const node = {
    id: key,
    type: TurboTypeMap[type],
    x,
    y,
    text,
    properties: {},
  }
  // 这种转换方式，在自定义属性中不能与excludeProperties中的属性重名，否则将在转换过程中丢失
  const excludeProperties = ['x', 'y', 'text']
  Object.keys(element.properties).forEach((property) => {
    if (excludeProperties.indexOf(property) === -1) {
      node.properties[property] = element.properties[property]
    }
  })
  return node
}

// 将Turbo元素数据转换为LogicFlow数据
export function toLogicflowData(data) {
  const lfData: any = {
    // TODO: 定义类型
    nodes: [],
    edges: [],
  }
  const list = data.flowElementList
  list &&
    list.length > 0 &&
    list.forEach((element) => {
      if (element.type === TurboType.SEQUENCE_FLOW) {
        const edge = convertFlowElementToEdge(element)
        lfData.edges.push(edge)
      } else {
        const node = convertFlowElementToNode(element)
        lfData.nodes.push(node)
      }
    })
  return lfData
}

class TurboAdapter {
  static pluginName = 'turboAdapter'

  constructor({ lf }) {
    lf.adapterIn = this.adapterIn
    lf.adapterOut = this.adapterOut
  }

  adapterOut(logicflowData) {
    if (logicflowData) {
      return toTurboData(logicflowData)
    }
  }

  adapterIn(turboData) {
    if (turboData) {
      return toLogicflowData(turboData)
    }
  }
}

export default TurboAdapter
