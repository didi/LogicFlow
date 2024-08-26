import { getBpmnId } from './bpmnIds'
import { handleAttributes, lfJson2Xml } from './json2xml'
import { lfXml2Json } from './xml2json'

import {
  ExclusiveGatewayConfig,
  StartEventConfig,
  EndEventConfig,
  ServiceTaskConfig,
  UserTaskConfig,
} from '../bpmn/constant'

type NodeConfig = {
  id: string
  properties?: Record<string, unknown>
  text?: {
    x: number
    y: number
    value: string
  }
  type: string
  x: number
  y: number
}

type Point = {
  x: number
  y: number
}

type EdgeConfig = {
  id: string
  sourceNodeId: string
  targetNodeId: string
  type: string
  startPoint?: {
    x: number
    y: number
  }
  endPoint?: {
    x: number
    y: number
  }
  text?: {
    x: number
    y: number
    value: string
  }
  pointsList?: Point[]
  properties: Record<string, unknown>
}

enum BpmnElements {
  START = 'bpmn:startEvent',
  END = 'bpmn:endEvent',
  GATEWAY = 'bpmn:exclusiveGateway',
  USER = 'bpmn:userTask',
  SYSTEM = 'bpmn:serviceTask',
  FLOW = 'bpmn:sequenceFlow',
}

const defaultAttrs = [
  '-name',
  '-id',
  'bpmn:incoming',
  'bpmn:outgoing',
  '-sourceRef',
  '-targetRef',
]

/**
 * 将普通json转换为xmlJson
 * xmlJson中property会以“-”开头
 * 如果没有“-”表示为子节点
 * fix issue https://github.com/didi/LogicFlow/issues/718, contain the process of #text/#cdata and array
 * @param retainedFields retainedField会和默认的defaultRetainedFields:
 * ["properties", "startPoint", "endPoint", "pointsList"]合并
 * 这意味着出现在这个数组里的字段当它的值是数组或是对象时不会被视为一个节点而是一个属性
 * @reference node type reference https://www.w3schools.com/xml/dom_nodetype.asp
 */
const defaultRetainedFields = [
  'properties',
  'startPoint',
  'endPoint',
  'pointsList',
]

function toXmlJson(retainedFields?: string[]) {
  const fields = retainedFields
    ? defaultRetainedFields.concat(retainedFields)
    : defaultRetainedFields
  return (json: string | any[] | Record<string, any>) => {
    function ToXmlJson(obj: string | any[] | Record<string, any>) {
      const xmlJson = {}
      if (typeof obj === 'string') {
        return obj
      }
      if (Array.isArray(obj)) {
        return obj.map((j) => ToXmlJson(j))
      }
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value !== 'object') {
          // node type reference https://www.w3schools.com/xml/dom_nodetype.asp
          if (
            key.indexOf('-') === 0 ||
            ['#text', '#cdata-section', '#comment'].includes(key)
          ) {
            xmlJson[key] = value
          } else {
            xmlJson[`-${key}`] = value
          }
        } else if (fields.includes(key)) {
          xmlJson[`-${key}`] = ToXmlJson(value)
        } else {
          xmlJson[key] = ToXmlJson(value)
        }
      })
      return xmlJson
    }

    return ToXmlJson(json)
  }
}

/**
 * 将xmlJson转换为普通的json，在内部使用。
 */
function toNormalJson(xmlJson) {
  const json = {}
  Object.entries(xmlJson).forEach(([key, value]) => {
    if (key.indexOf('-') === 0) {
      json[key.substring(1)] = handleAttributes(value)
    } else if (typeof value === 'string') {
      json[key] = value
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      json[key] = toNormalJson(value)
    } else if (Array.isArray(value)) {
      // contain the process of array
      json[key] = value.map((v) => toNormalJson(v))
    } else {
      json[key] = value
    }
  })
  return json
}

/**
 * 设置bpmn process信息
 * 目标格式请参考examples/bpmn.json
 * bpmn因为是默认基于xml格式的，其特点与json存在差异。
 * 1) 如果是xml的属性，json中属性用'-'开头
 * 2）如果只有一个子元素，json中表示为正常属性
 * 3）如果是多个子元素，json中使用数组存储
 */
function convertLf2ProcessData(
  bpmnProcessData,
  data,
  retainedFields?: string[],
) {
  const nodeMap = new Map()
  data.nodes.forEach((node: NodeConfig) => {
    const processNode = {
      '-id': node.id, // 如果是xml的属性，json中属性用'-'开头
    }
    if (node.text?.value) {
      processNode['-name'] = node.text.value
    }
    if (node.properties) {
      const properties = toXmlJson(retainedFields)(node.properties)
      Object.assign(processNode, properties)
    }
    nodeMap.set(node.id, processNode)

    if (!bpmnProcessData[node.type]) {
      bpmnProcessData[node.type] = processNode // 如果只有一个子元素，json中表示为正常属性
    } else if (Array.isArray(bpmnProcessData[node.type])) {
      // 如果是多个子元素，json中使用数组存储
      bpmnProcessData[node.type].push(processNode)
    } else {
      // 如果是多个子元素，json中使用数组存储
      bpmnProcessData[node.type] = [bpmnProcessData[node.type], processNode]
    }
  })
  const sequenceFlow = data.edges.map((edge: EdgeConfig) => {
    const targetNode = nodeMap.get(edge.targetNodeId)
    if (!targetNode['bpmn:incoming']) {
      targetNode['bpmn:incoming'] = edge.id
    } else if (Array.isArray(targetNode['bpmn:incoming'])) {
      targetNode['bpmn:incoming'].push(edge.id)
    } else {
      targetNode['bpmn:incoming'] = [targetNode['bpmn:incoming'], edge.id]
    }
    const edgeConfig = {
      '-id': edge.id,
      '-sourceRef': edge.sourceNodeId,
      '-targetRef': edge.targetNodeId,
    }
    if (edge.text?.value) {
      edgeConfig['-name'] = edge.text?.value
    }
    if (edge.properties) {
      const properties = toXmlJson(retainedFields)(edge.properties)
      Object.assign(edgeConfig, properties)
    }
    return edgeConfig
  })
  // @see https://github.com/didi/LogicFlow/issues/325
  // 需要保证incoming在outgoing之前
  data.edges.forEach((edge: EdgeConfig) => {
    const sourceNode = nodeMap.get(edge.sourceNodeId)
    if (!sourceNode['bpmn:outgoing']) {
      sourceNode['bpmn:outgoing'] = edge.id
    } else if (Array.isArray(sourceNode['bpmn:outgoing'])) {
      sourceNode['bpmn:outgoing'].push(edge.id)
    } else {
      // 字符串转数组
      sourceNode['bpmn:outgoing'] = [sourceNode['bpmn:outgoing'], edge.id]
    }
  })
  bpmnProcessData[BpmnElements.FLOW] = sequenceFlow
}

/**
 * adapterOut 设置bpmn diagram信息
 */
function convertLf2DiagramData(bpmnDiagramData, data) {
  bpmnDiagramData['bpmndi:BPMNEdge'] = data.edges.map((edge) => {
    const edgeId = edge.id
    const pointsList = edge.pointsList.map(({ x, y }) => ({
      '-x': x,
      '-y': y,
    }))
    const diagramData = {
      '-id': `${edgeId}_di`,
      '-bpmnElement': edgeId,
      'di:waypoint': pointsList,
    }
    if (edge.text?.value) {
      diagramData['bpmndi:BPMNLabel'] = {
        'dc:Bounds': {
          '-x': edge.text.x - (edge.text.value.length * 10) / 2,
          '-y': edge.text.y - 7,
          '-width': edge.text.value.length * 10,
          '-height': 14,
        },
      }
    }
    return diagramData
  })
  bpmnDiagramData['bpmndi:BPMNShape'] = data.nodes.map((node) => {
    const nodeId = node.id
    let width = 100
    let height = 80
    let { x, y } = node
    // bpmn坐标是基于左上角，LogicFlow基于中心点，此处处理一下。
    const shapeConfig = BpmnAdapter.shapeConfigMap.get(node.type)
    if (shapeConfig) {
      width = shapeConfig.width
      height = shapeConfig.height
    }
    x -= width / 2
    y -= height / 2
    const diagramData = {
      '-id': `${nodeId}_di`,
      '-bpmnElement': nodeId,
      'dc:Bounds': {
        '-x': x,
        '-y': y,
        '-width': width,
        '-height': height,
      },
    }
    if (node.text?.value) {
      diagramData['bpmndi:BPMNLabel'] = {
        'dc:Bounds': {
          '-x': node.text.x - (node.text.value.length * 10) / 2,
          '-y': node.text.y - 7,
          '-width': node.text.value.length * 10,
          '-height': 14,
        },
      }
    }
    return diagramData
  })
}

/**
 * 将bpmn数据转换为LogicFlow内部能识别数据
 */
function convertBpmn2LfData(bpmnData) {
  let nodes: NodeConfig[] = []
  let edges: EdgeConfig[] = []
  const definitions = bpmnData['bpmn:definitions']
  if (definitions) {
    const process = definitions['bpmn:process']
    Object.keys(process).forEach((key) => {
      if (key.indexOf('bpmn:') === 0) {
        const value = process[key]
        if (key === BpmnElements.FLOW) {
          const bpmnEdges =
            definitions['bpmndi:BPMNDiagram']['bpmndi:BPMNPlane'][
              'bpmndi:BPMNEdge'
            ]
          edges = getLfEdges(value, bpmnEdges)
        } else {
          const shapes =
            definitions['bpmndi:BPMNDiagram']['bpmndi:BPMNPlane'][
              'bpmndi:BPMNShape'
            ]
          nodes = nodes.concat(getLfNodes(value, shapes, key))
        }
      }
    })
  }
  return {
    nodes,
    edges,
  }
}

function getLfNodes(value, shapes, key) {
  const nodes: NodeConfig[] = []
  if (Array.isArray(value)) {
    // 数组
    value.forEach((val) => {
      let shapeValue
      if (Array.isArray(shapes)) {
        shapeValue = shapes.find(
          (shape) => shape['-bpmnElement'] === val['-id'],
        )
      } else {
        shapeValue = shapes
      }
      const node = getNodeConfig(shapeValue, key, val)
      nodes.push(node)
    })
  } else {
    let shapeValue
    if (Array.isArray(shapes)) {
      shapeValue = shapes.find(
        (shape) => shape['-bpmnElement'] === value['-id'],
      )
    } else {
      shapeValue = shapes
    }
    const node = getNodeConfig(shapeValue, key, value)
    nodes.push(node)
  }
  return nodes
}

function getNodeConfig(shapeValue, type, processValue) {
  let x = Number(shapeValue['dc:Bounds']['-x'])
  let y = Number(shapeValue['dc:Bounds']['-y'])
  const name = processValue['-name']
  const shapeConfig = BpmnAdapter.shapeConfigMap.get(type)
  if (shapeConfig) {
    x += shapeConfig.width / 2
    y += shapeConfig.height / 2
  }
  let properties
  // 判断是否存在额外的属性，将额外的属性放到properties中
  Object.entries(processValue).forEach(([key, value]) => {
    if (defaultAttrs.indexOf(key) === -1) {
      if (!properties) properties = {}
      properties[key] = value
    }
  })
  if (properties) {
    properties = toNormalJson(properties)
  }
  let text
  if (name) {
    text = {
      x,
      y,
      value: name,
    }
    // 自定义文本位置
    if (
      shapeValue['bpmndi:BPMNLabel'] &&
      shapeValue['bpmndi:BPMNLabel']['dc:Bounds']
    ) {
      const textBounds = shapeValue['bpmndi:BPMNLabel']['dc:Bounds']
      text.x = Number(textBounds['-x']) + Number(textBounds['-width']) / 2
      text.y = Number(textBounds['-y']) + Number(textBounds['-height']) / 2
    }
  }
  const nodeConfig: NodeConfig = {
    id: shapeValue['-bpmnElement'],
    type,
    x,
    y,
    properties,
  }
  if (text) {
    nodeConfig.text = text
  }
  return nodeConfig
}

function getLfEdges(value, bpmnEdges) {
  const edges: EdgeConfig[] = []
  if (Array.isArray(value)) {
    value.forEach((val) => {
      let edgeValue
      if (Array.isArray(bpmnEdges)) {
        edgeValue = bpmnEdges.find(
          (edge) => edge['-bpmnElement'] === val['-id'],
        )
      } else {
        edgeValue = bpmnEdges
      }
      edges.push(getEdgeConfig(edgeValue, val))
    })
  } else {
    let edgeValue
    if (Array.isArray(bpmnEdges)) {
      edgeValue = bpmnEdges.find(
        (edge) => edge['-bpmnElement'] === value['-id'],
      )
    } else {
      edgeValue = bpmnEdges
    }
    edges.push(getEdgeConfig(edgeValue, value))
  }
  return edges
}

function getEdgeConfig(edgeValue, processValue): EdgeConfig {
  let text
  const textVal = processValue['-name'] ? `${processValue['-name']}` : ''
  if (textVal) {
    const textBounds = edgeValue['bpmndi:BPMNLabel']['dc:Bounds']
    // 如果边文本换行，则其偏移量应该是最长一行的位置
    let textLength = 0
    textVal.split('\n').forEach((textSpan) => {
      if (textLength < textSpan.length) {
        textLength = textSpan.length
      }
    })

    text = {
      value: textVal,
      x: Number(textBounds['-x']) + (textLength * 10) / 2,
      y: Number(textBounds['-y']) + 7,
    }
  }
  let properties
  // 判断是否存在额外的属性，将额外的属性放到properties中
  Object.entries(processValue).forEach(([key, value]) => {
    if (defaultAttrs.indexOf(key) === -1) {
      if (!properties) properties = {}
      properties[key] = value
    }
  })
  if (properties) {
    properties = toNormalJson(properties)
  }
  const edge: EdgeConfig = {
    id: processValue['-id'],
    type: BpmnElements.FLOW,
    pointsList: edgeValue['di:waypoint'].map((point) => ({
      x: Number(point['-x']),
      y: Number(point['-y']),
    })),
    sourceNodeId: processValue['-sourceRef'],
    targetNodeId: processValue['-targetRef'],
    properties,
  }
  if (text) {
    edge.text = text
  }
  return edge
}

class BpmnAdapter {
  static pluginName = 'bpmn-adapter'
  static shapeConfigMap = new Map()
  processAttributes: {
    ['-isExecutable']: string
    ['-id']: string
  }
  definitionAttributes: {
    ['-id']: string
    ['-xmlns:xsi']: string
    ['-xmlns:bpmn']: string
    ['-xmlns:bpmndi']: string
    ['-xmlns:dc']: string
    ['-xmlns:di']: string
    ['-targetNamespace']: string
    ['-exporter']: string
    ['-exporterVersion']: string
    [key: string]: any
  }

  constructor({ lf }) {
    lf.adapterIn = (data) => this.adapterIn(data)
    lf.adapterOut = (data, retainedFields?: string[]) =>
      this.adapterOut(data, retainedFields)
    this.processAttributes = {
      '-isExecutable': 'true',
      '-id': `Process_${getBpmnId()}`,
    }
    this.definitionAttributes = {
      '-id': `Definitions_${getBpmnId()}`,
      '-xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '-xmlns:bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
      '-xmlns:bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
      '-xmlns:dc': 'http://www.omg.org/spec/DD/20100524/DC',
      '-xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
      '-targetNamespace': 'http://logic-flow.org',
      '-exporter': 'logicflow',
      '-exporterVersion': '1.2.0',
    }
  }

  setCustomShape(key, val) {
    BpmnAdapter.shapeConfigMap.set(key, val)
  }

  /**
   * @param retainedFields?: string[] (可选)属性保留字段，retainedField会和默认的defaultRetainedFields:
   * ["properties", "startPoint", "endPoint", "pointsList"]合并，
   * 这意味着出现在这个数组里的字段当它的值是数组或是对象时不会被视为一个节点而是一个属性。
   */
  adapterOut = (data, retainedFields?: string[]) => {
    const bpmnProcessData = { ...this.processAttributes }
    convertLf2ProcessData(bpmnProcessData, data, retainedFields)
    const bpmnDiagramData = {
      '-id': 'BPMNPlane_1',
      '-bpmnElement': bpmnProcessData['-id'],
    }
    convertLf2DiagramData(bpmnDiagramData, data)
    const definitions = this.definitionAttributes
    definitions['bpmn:process'] = bpmnProcessData
    definitions['bpmndi:BPMNDiagram'] = {
      '-id': 'BPMNDiagram_1',
      'bpmndi:BPMNPlane': bpmnDiagramData,
    }
    const bpmnData = {
      'bpmn:definitions': definitions,
    }
    return bpmnData
  }
  adapterIn = (bpmnData) => {
    if (bpmnData) {
      return convertBpmn2LfData(bpmnData)
    }
  }
}

BpmnAdapter.shapeConfigMap.set(BpmnElements.START, {
  width: StartEventConfig.width,
  height: StartEventConfig.height,
})
BpmnAdapter.shapeConfigMap.set(BpmnElements.END, {
  width: EndEventConfig.width,
  height: EndEventConfig.height,
})
BpmnAdapter.shapeConfigMap.set(BpmnElements.GATEWAY, {
  width: ExclusiveGatewayConfig.width,
  height: ExclusiveGatewayConfig.height,
})
BpmnAdapter.shapeConfigMap.set(BpmnElements.SYSTEM, {
  width: ServiceTaskConfig.width,
  height: ServiceTaskConfig.height,
})
BpmnAdapter.shapeConfigMap.set(BpmnElements.USER, {
  width: UserTaskConfig.width,
  height: UserTaskConfig.height,
})

class BpmnXmlAdapter extends BpmnAdapter {
  static pluginName = 'bpmnXmlAdapter'

  constructor(data) {
    super(data)
    const { lf } = data
    lf.adapterIn = this.adapterXmlIn
    lf.adapterOut = this.adapterXmlOut
  }

  adapterXmlIn = (bpmnData) => {
    const json = lfXml2Json(bpmnData)
    return this.adapterIn(json)
  }
  adapterXmlOut = (data, retainedFields?: string[]) => {
    const outData = this.adapterOut(data, retainedFields)
    return lfJson2Xml(outData)
  }
}

export { BpmnAdapter, BpmnXmlAdapter, toXmlJson, toNormalJson }

export default BpmnAdapter
