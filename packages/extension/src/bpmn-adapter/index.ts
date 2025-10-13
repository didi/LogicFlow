import { getBpmnId } from './bpmnIds'
import { handleAttributes, lfJson2Xml } from './json2xml'
import { lfXml2Json } from './xml2json'

/**
 * 模块说明（BPMN Adapter）
 *
 * 该模块负责在 LogicFlow 内部图数据（GraphData）与 BPMN XML/JSON 之间进行双向转换：
 * - adapterOut：将 LogicFlow 图数据转换为 BPMN JSON（随后由 json2xml 转为 XML）
 * - adapterIn：将 BPMN JSON 转换为 LogicFlow 图数据（如果是 XML，则先经 xml2json 转为 JSON）
 *
 * 设计要点与特殊处理：
 * - BPMN XML 的属性在 JSON 中以前缀 '-' 表示（如 '-id'、'-name'），本模块严格遵循该约定。
 * - XML 中同名子节点可能出现多次，xml2json 解析后会以数组表示；本模块对数组与单对象场景均做兼容处理。
 * - BPMN 画布坐标以元素左上角为基准，而 LogicFlow 以元素中心为基准；转换时需进行坐标基准转换。
 * - 文本内容在导出时进行 XML 转义，在导入时进行反转义，确保特殊字符（如 <, >, & 等）能被正确保留。
 */

import {
  ExclusiveGatewayConfig,
  StartEventConfig,
  EndEventConfig,
  ServiceTaskConfig,
  UserTaskConfig,
} from '../bpmn/constant'

/**
 * LogicFlow 节点配置（导入/导出过程中使用的中间结构）
 * - id/type/x/y：节点基本信息
 * - text：节点文本的中心坐标与内容（值为未转义的原始字符串）
 * - properties：节点的额外属性（会保留到 BPMN 的扩展字段）
 */
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

/**
 * 点坐标结构（用于边的路径点）
 */
type Point = {
  x: number
  y: number
}

/**
 * LogicFlow 边配置（导入/导出过程中使用的中间结构）
 * - id/type/sourceNodeId/targetNodeId：边的基本信息
 * - pointsList：边的路径点（用于 BPMN 的 di:waypoint）
 * - text：边文本的位置与内容（值为未转义的原始字符串）
 * - properties：边的扩展属性
 */
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

/**
 * BPMN 元素类型映射（用于在 JSON 中定位具体的 BPMN 节点类型）
 */
enum BpmnElements {
  START = 'bpmn:startEvent',
  END = 'bpmn:endEvent',
  GATEWAY = 'bpmn:exclusiveGateway',
  USER = 'bpmn:userTask',
  SYSTEM = 'bpmn:serviceTask',
  FLOW = 'bpmn:sequenceFlow',
}

/**
 * BPMN 过程元素的标准属性键列表
 * - 在解析 `processValue` 时，这些键会被视为标准属性而非扩展属性；
 * - 其余未在列表中的键会进入 LogicFlow 的 `properties` 中，以保留扩展数据。
 */
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
/**
 * 导出至 BPMN JSON 时，作为属性保留的字段列表
 * - 当这些字段的值为对象或数组时，仍视为属性（在 JSON 中以 '-' 前缀表示），而非子节点。
 */
const defaultRetainedFields = [
  'properties',
  'startPoint',
  'endPoint',
  'pointsList',
]

/**
 * 将普通 JSON 转换为 XML 风格 JSON（xmlJson）
 * 输入：任意 JSON 对象；可选的保留属性字段 retainedFields
 * 输出：遵循 XML 属性前缀约定的 xmlJson（属性键以 '-' 开头）
 * 规则：
 * - 原始字符串直接返回；数组逐项转换；对象根据键类型决定是否加 '-' 前缀。
 * - 保留字段（fields）中出现的键以属性形式（带 '-'）保留，否则视为子节点。
 */
function toXmlJson(retainedFields?: string[]) {
  const fields = retainedFields
    ? defaultRetainedFields.concat(retainedFields)
    : defaultRetainedFields
  return (json: string | any[] | Record<string, any>) => {
    /**
     * 递归转换核心方法
     * @param obj 输入对象/数组/字符串
     * @returns 转换后的 xmlJson
     */
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
 * 将 XML 风格 JSON（xmlJson）转换回普通 JSON（内部使用）
 * 输入：遵循 '-' 属性前缀约定的 xmlJson
 * 输出：去除前缀并恢复原有结构的普通 JSON
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
/**
 * 将 LogicFlow 图数据中的节点与边转换为 BPMN 的 process 数据结构
 * 输入：
 * - bpmnProcessData：输出目标对象（会被填充 '-id'、各 bpmn:* 节点以及 sequenceFlow）
 * - data：LogicFlow 图数据（nodes/edges）
 * - retainedFields：可选保留属性字段，用于控制属性与子节点的映射
 * 输出：直接修改 bpmnProcessData
 * 特殊处理：
 * - 节点文本（node.text.value）作为 BPMN 的 '-name' 属性；
 * - 维护 incoming/outgoing 的顺序，保证解析兼容性；
 * - 多子元素时转为数组结构（XML 约定）。
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
/**
 * 将 LogicFlow 图数据转换为 BPMN 的图形数据（BPMNDiagram/BPMNPlane 下的 Shape 与 Edge）
 * 输入：
 * - bpmnDiagramData：输出目标对象（填充 BPMNShape/BPMNEdge）
 * - data：LogicFlow 图数据（nodes/edges）
 * 输出：直接修改 bpmnDiagramData
 * 特殊处理：
 * - 节点坐标从中心点转换为左上角基准；
 * - 文本的显示边界（Bounds）根据文本长度近似计算，用于在 BPMN 渲染器正确定位标签。
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
/**
 * 将 BPMN JSON 转换为 LogicFlow 可识别的图数据
 * 输入：
 * - bpmnData：包含 'bpmn:definitions' 的 BPMN JSON
 * 输出：{ nodes, edges }：LogicFlow 的 GraphConfigData
 * 特殊处理：
 * - 兼容 xml2json 输出的数组结构（当 definitions 下存在多个 process/diagram/plane 时取第一个）；
 * - 若缺失 process 或 plane，返回空数据以避免渲染错误。
 */
function convertBpmn2LfData(bpmnData) {
  let nodes: NodeConfig[] = []
  let edges: EdgeConfig[] = []
  const definitions = bpmnData['bpmn:definitions']
  if (definitions) {
    // xml2json 在遇到同名子节点（如多个 process/diagram/plane）时会返回数组，
    // 这里统一取第一个以满足单图渲染场景；如需多图/多流程支持，可在此扩展为遍历与合并。
    const processRaw = definitions['bpmn:process']
    const process = Array.isArray(processRaw) ? processRaw[0] : processRaw
    const diagramRaw = definitions['bpmndi:BPMNDiagram']
    const diagram = Array.isArray(diagramRaw) ? diagramRaw[0] : diagramRaw
    const planeRaw = diagram?.['bpmndi:BPMNPlane']
    const plane = Array.isArray(planeRaw) ? planeRaw[0] : planeRaw
    if (!process || !plane) {
      return { nodes, edges }
    }
    Object.keys(process).forEach((key) => {
      if (key.indexOf('bpmn:') === 0) {
        const value = process[key]
        if (key === BpmnElements.FLOW) {
          const edgesRaw = plane['bpmndi:BPMNEdge']
          const bpmnEdges = Array.isArray(edgesRaw) ? edgesRaw : edgesRaw
          edges = getLfEdges(value, bpmnEdges)
        } else {
          const shapesRaw = plane['bpmndi:BPMNShape']
          const shapes = Array.isArray(shapesRaw) ? shapesRaw : shapesRaw
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

/**
 * 根据 BPMN 的 process 子节点与 plane 中的 BPMNShape 生成 LogicFlow 节点数组
 * 输入：
 * - value：当前类型（如 bpmn:userTask）的值，可能为对象或数组
 * - shapes：plane['bpmndi:BPMNShape']，可能为对象或数组
 * - key：当前处理的 BPMN 类型键名（如 'bpmn:userTask'）
 * 输出：LogicFlow 节点数组
 */
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

/**
 * 将单个 BPMNShape 与其对应的 process 节点合成为 LogicFlow 节点配置
 * 输入：
 * - shapeValue：plane 中的 BPMNShape（包含 Bounds 与可选 BPMNLabel）
 * - type：BPMN 节点类型键（如 'bpmn:userTask'）
 * - processValue：process 中对应的节点对象（包含 '-id'、'-name' 等）
 * 输出：LogicFlow NodeConfig
 * 特殊处理：
 * - 坐标从左上角转为中心点；
 * - 文本从 '-name' 读取并进行 XML 实体反转义；
 * - 文本位置优先使用 BPMNLabel 的 Bounds。
 */
function getNodeConfig(shapeValue, type, processValue) {
  let x = Number(shapeValue['dc:Bounds']['-x'])
  let y = Number(shapeValue['dc:Bounds']['-y'])
  // 反转义 XML 实体，确保导入后文本包含特殊字符时能被完整还原
  const unescapeXml = (text: string) =>
    String(text || '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  const name = unescapeXml(processValue['-name'])
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

/**
 * 根据 BPMN 的 sequenceFlow 与 BPMNEdge 生成 LogicFlow 边数组
 * 输入：
 * - value：process['bpmn:sequenceFlow']，对象或数组
 * - bpmnEdges：plane['bpmndi:BPMNEdge']，对象或数组
 * 输出：LogicFlow 边数组
 */
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

/**
 * 将单个 BPMNEdge 与其对应的 sequenceFlow 合成为 LogicFlow 边配置
 * 输入：
 * - edgeValue：BPMNEdge（包含 di:waypoint 以及可选 BPMNLabel/Bounds）
 * - processValue：sequenceFlow（包含 '-id'、'-sourceRef'、'-targetRef'、'-name' 等）
 * 输出：LogicFlow EdgeConfig
 * 特殊处理：
 * - 文本从 '-name' 读取并进行 XML 实体反转义；
 * - 若缺失 BPMNLabel，则以边的几何中心近似作为文本位置；
 * - pointsList 由 waypoints 转换得到，数值类型统一为 Number。
 */
function getEdgeConfig(edgeValue, processValue): EdgeConfig {
  let text
  // 反转义 XML 实体，确保导入后文本包含特殊字符时能被完整还原
  const unescapeXml = (text: string) =>
    String(text || '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  const textVal = processValue['-name']
    ? unescapeXml(`${processValue['-name']}`)
    : ''
  if (textVal) {
    let textBounds
    if (
      edgeValue['bpmndi:BPMNLabel'] &&
      edgeValue['bpmndi:BPMNLabel']['dc:Bounds']
    ) {
      textBounds = edgeValue['bpmndi:BPMNLabel']['dc:Bounds']
    }
    // 如果边文本换行，则其偏移量应该是最长一行的位置
    let textLength = 0
    textVal.split('\n').forEach((textSpan) => {
      if (textLength < textSpan.length) {
        textLength = textSpan.length
      }
    })

    if (textBounds) {
      text = {
        value: textVal,
        x: Number(textBounds['-x']) + (textLength * 10) / 2,
        y: Number(textBounds['-y']) + 7,
      }
    } else {
      // 兼容缺少 BPMNLabel 的图：使用边的几何中心作为文本位置
      const waypoints = edgeValue['di:waypoint'] || []
      const first = waypoints[0]
      const last = waypoints[waypoints.length - 1] || first
      const centerX =
        (Number(first?.['-x'] || 0) + Number(last?.['-x'] || 0)) / 2
      const centerY =
        (Number(first?.['-y'] || 0) + Number(last?.['-y'] || 0)) / 2
      text = {
        value: textVal,
        x: centerX,
        y: centerY,
      }
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

/**
 * BpmnAdapter：基础适配器
 *
 * 作用：在 LogicFlow 数据与 BPMN JSON 之间进行转换，并注入 adapterIn/adapterOut 钩子。
 * - processAttributes：导出时 BPMN process 的基础属性（可配置 isExecutable、id 等）。
 * - definitionAttributes：导出时 BPMN definitions 的基础属性与命名空间声明。
 * - shapeConfigMap：不同 BPMN 元素类型的默认宽高，用于坐标/Bounds 计算。
 */
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

  /**
   * 构造函数
   * - 注入 LogicFlow 的 adapterIn/adapterOut（处理 JSON 方向的适配）
   * - 初始化 process 与 definitions 的基础属性
   */
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
  /**
   * adapterOut：将 LogicFlow 图数据转换为 BPMN JSON
   * 输入：
   * - data：LogicFlow GraphData
   * - retainedFields：扩展属性保留字段
   * 输出：BPMN JSON（包含 definitions/process/diagram/plane）
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
  /**
   * adapterIn：将 BPMN JSON 转换为 LogicFlow 图数据
   * 输入：bpmnData：BPMN JSON
   * 输出：GraphConfigData（nodes/edges）
   */
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

/**
 * BpmnXmlAdapter：XML 适配器（继承 BpmnAdapter）
 *
 * 作用：处理 XML 输入/输出的适配，使用 xml2json/json2xml 完成格式转换。
 * 特殊处理：在 XML 导入前对 name 属性的非法字符进行预处理转义，提升容错。
 */
class BpmnXmlAdapter extends BpmnAdapter {
  static pluginName = 'bpmnXmlAdapter'

  /**
   * 构造函数
   * - 覆盖 LogicFlow 的 adapterIn/adapterOut，使其面向 XML 输入与输出。
   */
  constructor(data) {
    super(data)
    const { lf } = data
    lf.adapterIn = this.adapterXmlIn
    lf.adapterOut = this.adapterXmlOut
  }

  // 预处理：修复属性值中非法的XML字符（仅针对 name 属性）
  /**
   * 预处理 XML：仅对 name 属性值进行非法字符转义（<, >, &），避免 DOM 解析失败。
   * 注意：不影响已合法的实体（如 &amp;），仅在属性值中生效，不修改其它内容。
   */
  private sanitizeNameAttributes(xml: string): string {
    return xml.replace(/name="([^"]*)"/g, (_, val) => {
      const safe = val
        .replace(/&(?!#?\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `name="${safe}"`
    })
  }

  /**
   * adapterXmlIn：将 BPMN XML 转换为 LogicFlow 图数据
   * 输入：bpmnData：XML 字符串或对象
   * 步骤：
   * 1) 若为字符串，先对 name 属性进行预处理转义；
   * 2) 使用 lfXml2Json 转换为 BPMN JSON；
   * 3) 调用基础 adapterIn 转换为 GraphData。
   */
  adapterXmlIn = (bpmnData) => {
    const xmlStr =
      typeof bpmnData === 'string'
        ? this.sanitizeNameAttributes(bpmnData)
        : bpmnData
    const json = lfXml2Json(xmlStr)
    return this.adapterIn(json)
  }
  /**
   * adapterXmlOut：将 LogicFlow 图数据转换为 BPMN XML
   * 输入：
   * - data：GraphData
   * - retainedFields：保留属性字段
   * 步骤：
   * 1) 调用基础 adapterOut 生成 BPMN JSON；
   * 2) 使用 lfJson2Xml 转为合法的 XML 字符串（包含属性与文本的转义）。
   */
  adapterXmlOut = (data, retainedFields?: string[]) => {
    const outData = this.adapterOut(data, retainedFields)
    return lfJson2Xml(outData)
  }
}

export { BpmnAdapter, BpmnXmlAdapter, toXmlJson, toNormalJson }

export default BpmnAdapter
