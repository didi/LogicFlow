import { toXmlJson, toNormalJson } from '../src/bpmn-adapter/index'
import { lfJson2Xml } from '../src/bpmn-adapter/json2xml'
import { lfXml2Json } from '../src/bpmn-adapter/xml2json'

/**
 * @jest-environment jsdom
 */
test('transform data from json to xml', () => {
  const testObj = {
    nodes: [
      {
        id: 'node_1',
        type: 'rect',
        x: 100,
        y: 200,
        properties: {},
      },
      {
        id: 'node_2',
        type: 'circle',
        x: 300,
        y: 160,
        properties: {},
      },
    ],
    edges: [
      {
        id: 'ca1dea84-c5e8-4344-b888-8bb09666ac42',
        type: 'polyline',
        sourceNodeId: 'node_1',
        targetNodeId: 'node_2',
        startPoint: {
          x: 150,
          y: 200,
        },
        endPoint: {
          x: 250,
          y: 160,
        },
        properties: {},
        pointsList: [
          {
            x: 150,
            y: 200,
          },
          {
            x: 200,
            y: 200,
          },
          {
            x: 200,
            y: 160,
          },
          {
            x: 250,
            y: 160,
          },
        ],
      },
    ],
  }
  expect(toXmlJson()(testObj)).toStrictEqual({
    nodes: [
      {
        '-id': 'node_1',
        '-type': 'rect',
        '-x': 100,
        '-y': 200,
        '-properties': {},
      },
      {
        '-id': 'node_2',
        '-type': 'circle',
        '-x': 300,
        '-y': 160,
        '-properties': {},
      },
    ],
    edges: [
      {
        '-id': 'ca1dea84-c5e8-4344-b888-8bb09666ac42',
        '-type': 'polyline',
        '-sourceNodeId': 'node_1',
        '-targetNodeId': 'node_2',
        '-startPoint': {
          '-x': 150,
          '-y': 200,
        },
        '-endPoint': {
          '-x': 250,
          '-y': 160,
        },
        '-properties': {},
        '-pointsList': [
          {
            '-x': 150,
            '-y': 200,
          },
          {
            '-x': 200,
            '-y': 200,
          },
          {
            '-x': 200,
            '-y': 160,
          },
          {
            '-x': 250,
            '-y': 160,
          },
        ],
      },
    ],
  })

  const xmlJson = toXmlJson()(testObj)
  expect(toNormalJson(xmlJson)).toStrictEqual({
    nodes: [
      {
        id: 'node_1',
        type: 'rect',
        x: 100,
        y: 200,
        properties: {},
      },
      {
        id: 'node_2',
        type: 'circle',
        x: 300,
        y: 160,
        properties: {},
      },
    ],
    edges: [
      {
        id: 'ca1dea84-c5e8-4344-b888-8bb09666ac42',
        type: 'polyline',
        sourceNodeId: 'node_1',
        targetNodeId: 'node_2',
        startPoint: {
          x: 150,
          y: 200,
        },
        endPoint: {
          x: 250,
          y: 160,
        },
        properties: {},
        pointsList: [
          {
            x: 150,
            y: 200,
          },
          {
            x: 200,
            y: 200,
          },
          {
            x: 200,
            y: 160,
          },
          {
            x: 250,
            y: 160,
          },
        ],
      },
    ],
  })

  expect(lfJson2Xml(xmlJson)).toStrictEqual(
    '\t\n  <nodes id="node_1" type="rect" x="100" y="200" properties="{}" />\t\n  <nodes id="node_2" type="circle" x="300" y="160" properties="{}" />\t\n  <edges id="ca1dea84-c5e8-4344-b888-8bb09666ac42" type="polyline" sourceNodeId="node_1" targetNodeId="node_2" startPoint="{\'x\':150,\'y\':200}" endPoint="{\'x\':250,\'y\':160}" properties="{}" pointsList="[{\'x\':150,\'y\':200},{\'x\':200,\'y\':200},{\'x\':200,\'y\':160},{\'x\':250,\'y\':160}]" />',
  )

  const xml = lfJson2Xml(xmlJson)
  expect(lfXml2Json(xml)).toStrictEqual({
    nodes: [
      {
        '-id': 'node_1',
        '-type': 'rect',
        '-x': 100,
        '-y': 200,
        '-properties': {},
      },
      {
        '-id': 'node_2',
        '-type': 'circle',
        '-x': 300,
        '-y': 160,
        '-properties': {},
      },
    ],
    edges: {
      '-id': 'ca1dea84-c5e8-4344-b888-8bb09666ac42',
      '-type': 'polyline',
      '-sourceNodeId': 'node_1',
      '-targetNodeId': 'node_2',
      '-startPoint': {
        x: 150,
        y: 200,
      },
      '-endPoint': {
        x: 250,
        y: 160,
      },
      '-properties': {},
      '-pointsList': [
        {
          x: 150,
          y: 200,
        },
        {
          x: 200,
          y: 200,
        },
        {
          x: 200,
          y: 160,
        },
        {
          x: 250,
          y: 160,
        },
      ],
    },
  })
})
