/* eslint-disable func-names */
/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-cond-assign */
/* eslint-disable no-shadow */
import _ from 'lodash-es'
import {
  ExclusiveGatewayConfig,
  InclusiveGatewayConfig,
  ParallelGatewayConfig,
  StartEventConfig,
  EndEventConfig,
  BoundaryEventConfig,
  IntermediateEventConfig,
  ServiceTaskConfig,
  UserTaskConfig,
  SubProcessConfig,
} from './constant'
import { lfXml2Json } from './xml2json'
import { lfJson2Xml, handleAttributes } from './json2xml'

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
  children?: string[]
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

type TransformerType = {
  [key: string]: {
    in?: (key: string, data: any) => any
    out?: (data: any) => any
  }
}

type MappingType = {
  in?: {
    [key: string]: string
  }
  out?: {
    [key: string]: string
  }
}

type excludeFieldsType = {
  in?: Set<string>
  out?: Set<string>
}

type ExtraPropsType = {
  retainedAttrsFields?: string[]
  excludeFields?: excludeFieldsType
  transformer?: TransformerType
  mapping?: MappingType
}

enum BpmnElements {
  START = 'bpmn:startEvent',
  END = 'bpmn:endEvent',
  INTERMEDIATE_CATCH = 'bpmn:intermediateCatchEvent',
  INTERMEDIATE_THROW = 'bpmn:intermediateThrowEvent',
  BOUNDARY = 'bpmn:boundaryEvent',
  PARALLEL_GATEWAY = 'bpmn:parallelGateway',
  INCLUSIVE_GATEWAY = 'bpmn:inclusiveGateway',
  EXCLUSIVE_GATEWAY = 'bpmn:exclusiveGateway',
  USER = 'bpmn:userTask',
  SYSTEM = 'bpmn:serviceTask',
  FLOW = 'bpmn:sequenceFlow',
  SUBPROCESS = 'bpmn:subProcess',
}

const defaultAttrsForInput = [
  '-name',
  '-id',
  'bpmn:incoming',
  'bpmn:outgoing',
  '-sourceRef',
  '-targetRef',
  '-children',
]

const defaultRetainedProperties = [
  'properties',
  'startPoint',
  'endPoint',
  'pointsList',
]

const defaultExcludeFields = {
  in: [],
  out: [
    'properties.panels',
    'properties.nodeSize',
    'properties.definitionId',
    'properties.timerValue',
    'properties.timerType',
    'properties.definitionType',
    'properties.parent',
    'properties.isBoundaryEventTouchingTask',
  ],
}

const mergeInNOutObject = (target: any, source: any): TransformerType => {
  const sourceKeys = Object.keys(source || {})
  sourceKeys.forEach((key) => {
    if (target[key]) {
      const { in: fnIn, out: fnOut } = source[key]
      if (fnIn) {
        target[key].in = fnIn
      }
      if (fnOut) {
        target[key].out = fnOut
      }
    } else {
      target[key] = source[key]
    }
  })
  return target
}

// @ts-ignore
let defaultTransformer: TransformerType = {
  'bpmn:startEvent': {
    out(data: any) {
      const { properties } = data
      return defaultTransformer[properties.definitionType]?.out?.(data) || {}
    },
  },
  // 'bpmn:endEvent': undefined,
  'bpmn:intermediateCatchEvent': {
    out(data: any) {
      const { properties } = data
      return defaultTransformer[properties.definitionType]?.out?.(data) || {}
    },
  },
  'bpmn:intermediateThrowEvent': {
    out(data: any) {
      const { properties } = data
      return defaultTransformer[properties.definitionType]?.out?.(data) || {}
    },
  },
  'bpmn:boundaryEvent': {
    out(data: any) {
      const { properties } = data
      return defaultTransformer[properties.definitionType]?.out?.(data) || {}
    },
  },
  // 'bpmn:userTask': undefined,
  'bpmn:sequenceFlow': {
    out(data: any) {
      const {
        properties: { expressionType, condition },
      } = data
      if (condition) {
        if (expressionType === 'cdata') {
          return {
            json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[\${${condition}}]]></bpmn:conditionExpression>`,
          }
        }
        return {
          json: `<bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression">${condition}</bpmn:conditionExpression>`,
        }
      }
      return {
        json: '',
      }
    },
  },
  // 'bpmn:subProcess': undefined,
  // 'bpmn:participant': undefined,
  'bpmn:timerEventDefinition': {
    out(data: any) {
      const {
        properties: { timerType, timerValue, definitionId },
      } = data

      const typeFunc = () =>
        `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`

      return {
        json: `<bpmn:timerEventDefinition id="${definitionId}"${
          timerType && timerValue
            ? `>${typeFunc()}</bpmn:timerEventDefinition>`
            : '/>'
        }`,
      }
    },
    in(key: string, data: any) {
      const definitionType = key
      const definitionId = data['-id']
      let timerType = ''
      let timerValue = ''
      for (const key of Object.keys(data)) {
        if (key.includes('bpmn:')) {
          ;[, timerType] = key.split(':')
          timerValue = data[key]?.['#text']
        }
      }
      return {
        '-definitionId': definitionId,
        '-definitionType': definitionType,
        '-timerType': timerType,
        '-timerValue': timerValue,
      }
    },
  },
  'bpmn:conditionExpression': {
    in(_key: string, data: any) {
      let condition = ''
      let expressionType = ''
      if (data['#cdata-section']) {
        expressionType = 'cdata'
        condition = /^\$\{(.*)\}$/g.exec(data['#cdata-section'])?.[1] || ''
      } else if (data['#text']) {
        expressionType = 'normal'
        condition = data['#text']
      }

      return {
        '-condition': condition,
        '-expressionType': expressionType,
      }
    },
  },
}

/**
 * 将普通json转换为xmlJson
 * xmlJson中property会以“-”开头
 * 如果没有“-”表示为子节点
 * fix issue https://github.com/didi/LogicFlow/issues/718, contain the process of #text/#cdata and array
 * @reference node type reference https://www.w3schools.com/xml/dom_nodetype.asp
 * @param retainedAttrsFields retainedAttrsFields会和默认的defaultRetainedProperties:
 * ["properties", "startPoint", "endPoint", "pointsList"]合并
 * 这意味着出现在这个数组里的字段当它的值是数组或是对象时不会被视为一个节点而是一个属性
 * @param excludeFields excludeFields会和默认的defaultExcludeFields合并，出现在这个数组中的字段在转换时会被忽略
 * @param transformer 对应节点或者边的子内容转换规则
 */
function convertNormalToXml(other?: ExtraPropsType) {
  const { retainedAttrsFields, excludeFields, transformer } = other ?? {}
  const retainedAttrsSet = new Set([
    ...defaultRetainedProperties,
    ...(retainedAttrsFields || []),
  ])
  const excludeFieldsSet = {
    in: new Set([...defaultExcludeFields.in, ...(excludeFields?.in || [])]),
    out: new Set([...defaultExcludeFields.out, ...(excludeFields?.out || [])]),
  }

  defaultTransformer = mergeInNOutObject(defaultTransformer, transformer)

  return (object: { nodes: any; edges: any }) => {
    const { nodes } = object
    const { edges } = object
    function ToXmlJson(obj: any, path: string): any {
      if (obj?.flag === 1) {
        return
      }

      let fn
      // @ts-ignore
      if ((fn = defaultTransformer[obj.type]) && fn.out) {
        const output = fn.out(obj)
        const keys = Object.keys(output)
        if (keys.length > 0) {
          keys.forEach((key: string) => {
            obj[key] = output[key]
          })
        }
      }

      if (obj?.children) {
        obj.children = obj.children.map((key: any) => {
          const target =
            nodes.find((item: { id: any }) => item.id === key) ||
            edges.find((item: { id: any }) => item.id === key)
          return target || {}
        })
      }

      const xmlJson: any = {}

      if (typeof obj === 'string') {
        return obj
      }

      if (Array.isArray(obj)) {
        return (
          obj
            .map((item) => ToXmlJson(item, ''))
            // eslint-disable-next-line eqeqeq
            .filter((item) => item != undefined)
        )
      }

      for (const [key, value] of Object.entries(obj)) {
        if ((value as any)?.['flag'] === 1) {
          return
        }
        const newPath = [path, key].filter((item) => item).join('.')
        if (excludeFieldsSet.out.has(newPath)) {
          continue
        } else if (typeof value !== 'object') {
          // node type reference https://www.w3schools.com/xml/dom_nodetype.asp
          if (
            key.indexOf('-') === 0 ||
            ['#text', '#cdata-section', '#comment'].includes(key)
          ) {
            xmlJson[key] = value
          } else {
            xmlJson[`-${key}`] = value
          }
        } else if (retainedAttrsSet.has(newPath)) {
          xmlJson[`-${key}`] = ToXmlJson(value, newPath)
        } else {
          xmlJson[key] = ToXmlJson(value, newPath)
        }
      }

      return xmlJson
    }
    return ToXmlJson(object, '')
  }
}

/**
 * 将xmlJson转换为普通的json，在内部使用。
 */
function convertXmlToNormal(xmlJson: any) {
  const json: any = {}
  for (const [key, value] of Object.entries(xmlJson)) {
    if (key.indexOf('-') === 0) {
      json[key.substring(1)] = handleAttributes(value)
    } else if (typeof value === 'string') {
      json[key] = value
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      json[key] = convertXmlToNormal(value)
    } else if (Array.isArray(value)) {
      // contain the process of array
      json[key] = value.map((v) => convertXmlToNormal(v))
    } else {
      json[key] = value
    }
  }
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
  bpmnData: any,
  data: any,
  other?: ExtraPropsType,
) {
  const nodeIdMap = new Map()

  const xmlJsonData = convertNormalToXml(other)(data)

  xmlJsonData.nodes.forEach((node: any) => {
    const {
      '-id': nodeId,
      '-type': nodeType,
      text,
      children,
      ...otherProps
    } = node
    const processNode: any = { '-id': nodeId }

    if (text?.['-value']) {
      processNode['-name'] = text['-value']
    }

    if (otherProps['-json']) {
      processNode['-json'] = otherProps['-json']
    }

    if (otherProps['-properties']) {
      Object.assign(processNode, otherProps['-properties'])
    }

    if (children) {
      processNode.children = children
    }

    // (bpmnData[nodeType] ??= []).push(processNode);

    if (!bpmnData[nodeType]) {
      bpmnData[nodeType] = []
    }
    bpmnData[nodeType].push(processNode)

    nodeIdMap.set(nodeId, processNode)
  })

  const sequenceFlow = xmlJsonData.edges.map((edge: any) => {
    const {
      '-id': id,
      // '-type': type,
      '-sourceNodeId': sourceNodeId,
      '-targetNodeId': targetNodeId,
      text,
      ...otherProps
    } = edge
    const targetNode = nodeIdMap.get(targetNodeId)
    // (targetNode['bpmn:incoming'] ??= []).push(id);

    if (!targetNode['bpmn:incoming']) {
      targetNode['bpmn:incoming'] = []
    }
    targetNode['bpmn:incoming'].push(id)

    const edgeConfig: any = {
      '-id': id,
      '-sourceRef': sourceNodeId,
      '-targetRef': targetNodeId,
    }

    if (text?.['-value']) {
      edgeConfig['-name'] = text['-value']
    }

    if (otherProps['-json']) {
      edgeConfig['-json'] = otherProps['-json']
    }

    if (otherProps['-properties']) {
      Object.assign(edgeConfig, otherProps['-properties'])
    }

    return edgeConfig
  })

  // @see https://github.com/didi/LogicFlow/issues/325
  // 需要保证incoming在outgoing之前
  data.edges.forEach(({ sourceNodeId, id }: any) => {
    const sourceNode = nodeIdMap.get(sourceNodeId)
    // (sourceNode['bpmn:outgoing'] ??= []).push(id);

    if (!sourceNode['bpmn:outgoing']) {
      sourceNode['bpmn:outgoing'] = []
    }
    sourceNode['bpmn:outgoing'].push(id)
  })

  bpmnData['bpmn:subProcess']?.forEach((item: any) => {
    const setMap: any = {
      'bpmn:incoming': new Set<string>(),
      'bpmn:outgoing': new Set<string>(),
    }
    const edgesInSubProcess: any = []
    item.children.forEach((child: any) => {
      const target = nodeIdMap.get(child['-id'])
      ;['bpmn:incoming', 'bpmn:outgoing'].forEach((key: string) => {
        target[key] &&
          target[key].forEach((value: string) => {
            setMap[key].add(value)
          })
      })

      const index = bpmnData[child['-type']]?.findIndex(
        (_item: any) => _item['-id'] === child['-id'],
      )
      if (index >= 0) {
        bpmnData[child['-type']].splice(index, 1)
      }

      nodeIdMap.delete(child['-id'])

      // (item[child['-type']] ??= []).push(target);
      if (!item[child['-type']]) {
        item[child['-type']] = []
      }
      item[child['-type']].push(target)
    })

    const { 'bpmn:incoming': incomingSet, 'bpmn:outgoing': outgoingSet } =
      setMap

    outgoingSet.forEach((value: string) => {
      incomingSet.has(value) && edgesInSubProcess.push(value)
    })

    for (let i = 0; i < edgesInSubProcess.length; ) {
      const index = sequenceFlow.findIndex(
        (item: any) => item['-id'] === edgesInSubProcess[i],
      )
      if (index >= 0) {
        // (item['bpmn:sequenceFlow'] ??= []).push(sequenceFlow[index]);
        if (!item['bpmn:sequenceFlow']) {
          item['bpmn:sequenceFlow'] = []
        }
        item['bpmn:sequenceFlow'].push(sequenceFlow[index])
        sequenceFlow.splice(index, 1)
      } else {
        i++
      }
    }

    delete item.children
  })

  bpmnData[BpmnElements.FLOW] = sequenceFlow

  return bpmnData
}

/**
 * adapterOut 设置bpmn diagram信息
 */
function convertLf2DiagramData(bpmnDiagramData: any, data: any) {
  bpmnDiagramData['bpmndi:BPMNEdge'] = data.edges.map((edge: any) => {
    const edgeId = edge.id
    const pointsList = edge.pointsList.map(
      ({ x, y }: { x: number; y: number }) => ({
        '-x': x,
        '-y': y,
      }),
    )
    const diagramData: any = {
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
  bpmnDiagramData['bpmndi:BPMNShape'] = data.nodes.map((node: any) => {
    const nodeId = node.id
    let width = 100
    let height = 80
    let { x, y } = node
    // bpmn坐标是基于左上角，LogicFlow基于中心点，此处处理一下。
    const shapeConfig = BPMNBaseAdapter.shapeConfigMap.get(node.type)
    if (shapeConfig) {
      width = shapeConfig.width
      height = shapeConfig.height
    }
    x -= width / 2
    y -= height / 2
    const diagramData: any = {
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

const ignoreType = ['bpmn:incoming', 'bpmn:outgoing']

/**
 * 将bpmn数据转换为LogicFlow内部能识别数据
 */
function convertBpmn2LfData(bpmnData: any, other?: ExtraPropsType) {
  let nodes: any[] = []
  let edges: any[] = []

  const eleMap = new Map<string, any>()

  const { transformer, excludeFields } = other ?? {}

  const excludeFieldsSet = {
    in: new Set([...defaultExcludeFields.in, ...(excludeFields?.in || [])]),
    out: new Set([...defaultExcludeFields.out, ...(excludeFields?.out || [])]),
  }

  defaultTransformer = mergeInNOutObject(defaultTransformer, transformer)

  const definitions = bpmnData['bpmn:definitions']
  if (definitions) {
    const process = definitions['bpmn:process']
    ;(function (data, callbacks) {
      callbacks.forEach((callback) => {
        try {
          Object.keys(data).forEach((key: string) => {
            try {
              callback(key)
            } catch (error) {
              console.error(error)
            }
          })
        } catch (error) {
          console.error(error)
        }
      })
    })(process, [
      (key: string) => {
        // 将bpmn:subProcess中的数据提升到process中
        function subProcessProcessing(data: any) {
          // data['-children'] ??= [];
          if (!data['-children']) {
            data['-children'] = []
          }
          Object.keys(data).forEach((key: string) => {
            if (key.indexOf('bpmn:') === 0 && !ignoreType.includes(key)) {
              // process[key] ??= [];
              if (!process[key]) {
                process[key] = []
              }
              !Array.isArray(process[key]) && (process[key] = [process[key]])
              Array.isArray(data[key])
                ? process[key].push(...data[key])
                : process[key].push(data[key])
              if (Array.isArray(data[key])) {
                data[key].forEach((item: any) => {
                  !key.includes('Flow') && data['-children'].push(item['-id'])
                })
              } else {
                !key.includes('Flow') &&
                  data['-children'].push(data[key]['-id'])
              }
              delete data[key]
            }
          })
        }
        if (key === 'bpmn:subProcess') {
          const data = process[key]
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              key === 'bpmn:subProcess' && subProcessProcessing(item)
            })
          } else {
            subProcessProcessing(data)
          }
        }
      },
      (key: string) => {
        // 处理被提升的节点、边, 主要是通过definitionTransformer处理出节点的属性
        const fn = (obj: any) => {
          Object.keys(obj).forEach((key: string) => {
            if (key.includes('bpmn:')) {
              let props: any = {}
              if (defaultTransformer[key] && defaultTransformer[key].in) {
                props = defaultTransformer[key].in?.(key, _.cloneDeep(obj[key]))
                delete obj[key]
              } else {
                func(obj[key])
              }
              let keys: (string | number | symbol)[]
              if ((keys = Reflect.ownKeys(props)).length > 0) {
                keys.forEach((key) => {
                  Reflect.set(obj, key, props[key])
                })
              }
            }
          })
        }
        function func(data: any) {
          eleMap.set(data['-id'], data)
          if (Array.isArray(data)) {
            data.forEach((item) => {
              func(item)
            })
          } else if (typeof data === 'object') {
            fn(data)
          }
        }
        func(process[key])
      },
      (key: string) => {
        if (key.indexOf('bpmn:') === 0) {
          const value = process[key]
          if (key === 'bpmn:sequenceFlow') {
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
            if (key === 'bpmn:boundaryEvent') {
              const data = process[key]
              const fn = (item: any) => {
                const { '-attachedToRef': attachedToRef } = item
                const attachedToNode = eleMap.get(attachedToRef)

                // attachedToNode['-boundaryEvents'] ??= [];

                if (!attachedToNode['-boundaryEvents']) {
                  attachedToNode['-boundaryEvents'] = []
                }

                attachedToNode['-boundaryEvents'].push(item['-id'])
              }
              if (Array.isArray(data)) {
                data.forEach((item) => {
                  fn(item)
                })
              } else {
                fn(data)
              }
            }
            nodes = nodes.concat(getLfNodes(value, shapes, key))
          }
        }
      },
    ])
  }

  const ignoreFields = (
    obj: Record<string, any>,
    filterSet: Set<string>,
    path: string,
  ) => {
    Object.keys(obj).forEach((key) => {
      const tmpPath = path ? `${path}.${key}` : key
      if (filterSet.has(tmpPath)) {
        delete obj[key]
      } else if (typeof obj[key] === 'object') {
        ignoreFields(obj[key], filterSet, tmpPath)
      }
    })
  }

  nodes.forEach((node) => {
    if (other?.mapping?.in) {
      const mapping = other?.mapping?.in
      const { type } = node
      if (mapping[type]) {
        node.type = mapping[type]
      }
    }
    ignoreFields(node, excludeFieldsSet.in, '')
    // Object.keys(node.properties).forEach((key) => {
    //   excludeFieldsSet.in.has(key) && delete node.properties[key];
    // });
  })

  edges.forEach((edge) => {
    if (other?.mapping?.in) {
      const mapping = other?.mapping?.in
      const { type } = edge
      if (mapping[type]) {
        edge.type = mapping[type]
      }
    }
    ignoreFields(edge, excludeFieldsSet.in, '')
    // Object.keys(edge.properties).forEach((key) => {
    //   excludeFieldsSet.in.has(key) && delete edge.properties[key];
    // });
  })

  return {
    nodes,
    edges,
  }
}

function getLfNodes(value: any, shapes: any, key: any) {
  const nodes: NodeConfig[] = []
  if (Array.isArray(value)) {
    // 数组
    value.forEach((val) => {
      let shapeValue: any
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

function getNodeConfig(shapeValue: any, type: any, processValue: any) {
  let x = Number(shapeValue['dc:Bounds']['-x'])
  let y = Number(shapeValue['dc:Bounds']['-y'])
  const { '-children': children } = processValue
  const name = processValue['-name']
  const shapeConfig = BPMNBaseAdapter.shapeConfigMap.get(type)
  if (shapeConfig) {
    x += shapeConfig.width / 2
    y += shapeConfig.height / 2
  }
  let properties: any = {}
  // 判断是否存在额外的属性，将额外的属性放到properties中
  Object.entries(processValue).forEach(([key, value]) => {
    if (!defaultAttrsForInput.includes(key)) {
      properties[key] = value
    }
  })
  properties = convertXmlToNormal(properties)
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
  children && (nodeConfig.children = children)
  if (text) {
    nodeConfig.text = text
  }
  return nodeConfig
}

function getLfEdges(value: any, bpmnEdges: any) {
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

function getEdgeConfig(edgeValue: any, processValue: any) {
  let text
  const textVal = processValue['-name'] ? `${processValue['-name']}` : ''
  if (textVal) {
    const textBounds = edgeValue['bpmndi:BPMNLabel']['dc:Bounds']
    // 如果边文本换行，则其偏移量应该是最长一行的位置
    let textLength = 0
    textVal.split('\n').forEach((textSpan: string) => {
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
  let properties: any = {}
  // 判断是否存在额外的属性，将额外的属性放到properties中
  Object.entries(processValue).forEach(([key, value]) => {
    if (!defaultAttrsForInput.includes(key)) {
      properties[key] = value
    }
  })
  properties = convertXmlToNormal(properties)
  const pointsList = edgeValue['di:waypoint'].map((point: any) => ({
    x: Number(point['-x']),
    y: Number(point['-y']),
  }))
  const edge: EdgeConfig = {
    id: processValue['-id'],
    type: BpmnElements.FLOW,
    pointsList,
    sourceNodeId: processValue['-sourceRef'],
    targetNodeId: processValue['-targetRef'],
    properties,
  }
  if (text) {
    edge.text = text
  }
  return edge
}

class BPMNBaseAdapter {
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
  constructor({ lf }: any) {
    lf.adapterIn = this.adapterIn
    lf.adapterOut = this.adapterOut
    this.processAttributes = {
      '-isExecutable': 'true',
      '-id': 'Process',
    }
    this.definitionAttributes = {
      '-id': 'Definitions',
      '-xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '-xmlns:bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
      '-xmlns:bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
      '-xmlns:dc': 'http://www.omg.org/spec/DD/20100524/DC',
      '-xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
      '-targetNamespace': 'http://logic-flow.org',
      '-exporter': 'logicflow',
      '-exporterVersion': '1.2.10',
    }
  }
  setCustomShape(key: string, val: any) {
    BPMNBaseAdapter.shapeConfigMap.set(key, val)
  }
  /**
   * @param retainedAttrsFields?: string[] (可选)属性保留字段，retainedField会和默认的defaultRetainedFields:
   * ["properties", "startPoint", "endPoint", "pointsList"]合并，
   * 这意味着出现在这个数组里的字段当它的值是数组或是对象时不会被视为一个节点而是一个属性。
   * @param excludeFields excludeFields会和默认的defaultExcludeFields合并，出现在这个数组中的字段在转换时会被忽略
   * @param transformer 对应节点或者边的内容转换规则
   */
  adapterOut = (data: any, other?: ExtraPropsType) => {
    const bpmnProcessData = { ...this.processAttributes }
    convertLf2ProcessData(bpmnProcessData, data, other)
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

    if (other?.mapping?.out) {
      const mapping = other?.mapping?.out

      const nameMapping = (obj: Record<string, any> | any[]): any => {
        if (Array.isArray(obj)) {
          obj.forEach((item) => nameMapping(item))
        }
        if (typeof obj === 'object') {
          Object.keys(obj).forEach((key: string) => {
            let mappingName: string
            if ((mappingName = mapping[key])) {
              obj[mappingName] = _.cloneDeep(obj[key])
              delete obj[key]
              nameMapping(obj[mappingName])
            } else {
              nameMapping(obj[key])
            }
          })
        }
      }
      nameMapping(bpmnData)
    }

    return bpmnData
  }
  adapterIn = (bpmnData: any, other?: ExtraPropsType) => {
    if (bpmnData) {
      return convertBpmn2LfData(bpmnData, other)
    }
  }
}

BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.START, {
  width: StartEventConfig.width,
  height: StartEventConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.END, {
  width: EndEventConfig.width,
  height: EndEventConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.INTERMEDIATE_CATCH, {
  width: IntermediateEventConfig.width,
  height: IntermediateEventConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.INTERMEDIATE_THROW, {
  width: IntermediateEventConfig.width,
  height: IntermediateEventConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.BOUNDARY, {
  width: BoundaryEventConfig.width,
  height: BoundaryEventConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.PARALLEL_GATEWAY, {
  width: ParallelGatewayConfig.width,
  height: ParallelGatewayConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.INCLUSIVE_GATEWAY, {
  width: InclusiveGatewayConfig.width,
  height: InclusiveGatewayConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.EXCLUSIVE_GATEWAY, {
  width: ExclusiveGatewayConfig.width,
  height: ExclusiveGatewayConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.SYSTEM, {
  width: ServiceTaskConfig.width,
  height: ServiceTaskConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.USER, {
  width: UserTaskConfig.width,
  height: UserTaskConfig.height,
})
BPMNBaseAdapter.shapeConfigMap.set(BpmnElements.SUBPROCESS, {
  width: SubProcessConfig.width,
  height: SubProcessConfig.height,
})

class BPMNAdapter extends BPMNBaseAdapter {
  static pluginName = 'BPMNAdapter'
  private props: ExtraPropsType
  constructor(data: any) {
    super(data)
    const { lf, props } = data
    lf.adapterIn = this.adapterXmlIn
    lf.adapterOut = this.adapterXmlOut
    this.props = props
  }
  adapterXmlIn = (bpmnData: any) => {
    const json = lfXml2Json(bpmnData)
    return this.adapterIn(json, this.props)
  }
  adapterXmlOut = (data: any) => {
    const outData = this.adapterOut(data, this.props)
    return lfJson2Xml(outData)
  }
}

export { BPMNBaseAdapter, BPMNAdapter, convertNormalToXml, convertXmlToNormal }

export default BPMNAdapter
