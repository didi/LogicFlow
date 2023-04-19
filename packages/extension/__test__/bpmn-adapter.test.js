import { toXmlJson, toNormalJson } from '../src/bpmn-adapter/index';
import { lfJson2Xml } from '../src/bpmn-adapter/json2xml';

test('transform data from json to xml', () => {
  const json =
    '{ "bpmn2:extensionElements": { "flowable:taskListener": [ { "event": "create", "flowable:field": { "name": "taskType", "stringValue": "Execute", "#cdata-section": "function matchwo(a,b){if (a < b && a < 0) then{return 1;}else{return 0;}}" } }, { "event": "end", "flowable:field": { "name": "taskType", "stringValue": "Execute", "#text": "test" } } ] } }';
  const normalJson = JSON.parse(json);
  expect(toXmlJson(normalJson)).toStrictEqual({
    'bpmn2:extensionElements': {
      'flowable:taskListener': [
        {
          '-event': 'create',
          'flowable:field': {
            '-name': 'taskType',
            '-stringValue': 'Execute',
            '#cdata-section':
              'function matchwo(a,b){if (a < b && a < 0) then{return 1;}else{return 0;}}',
          },
        },
        {
          '-event': 'end',
          'flowable:field': {
            '-name': 'taskType',
            '-stringValue': 'Execute',
            '#text': 'test',
          },
        },
      ],
    },
  });

  const xmlJson = {
    'bpmn2:extensionElements': {
      'flowable:taskListener': [
        {
          '-event': 'create',
          'flowable:field': {
            '-name': 'taskType',
            '-stringValue': 'Execute',
            '#cdata-section':
              'function matchwo(a,b){if (a < b && a < 0) then{return 1;}else{return 0;}}',
          },
        },
        {
          '-event': 'end',
          'flowable:field': {
            '-name': 'taskType',
            '-stringValue': 'Execute',
            '#text': 'test',
          },
        },
      ],
    },
  };
  expect(toNormalJson(xmlJson)).toStrictEqual({
    'bpmn2:extensionElements': {
      'flowable:taskListener': [
        {
          event: 'create',
          'flowable:field': {
            name: 'taskType',
            stringValue: 'Execute',
            '#cdata-section':
              'function matchwo(a,b){if (a < b && a < 0) then{return 1;}else{return 0;}}',
          },
        },
        {
          event: 'end',
          'flowable:field': {
            name: 'taskType',
            stringValue: 'Execute',
            '#text': 'test',
          },
        },
      ],
    },
  });

  expect(lfJson2Xml(toXmlJson(normalJson)))
    .toStrictEqual(`<bpmn2:extensionElements>	
    <flowable:taskListener event="create">	
      <flowable:field name="taskType" stringValue="Execute">	
        <![CDATA[function matchwo(a,b){if (a < b && a < 0) then{return 1;}else{return 0;}}]]>	
      </flowable:field>	
    </flowable:taskListener>	
    <flowable:taskListener event="end">	
      <flowable:field name="taskType" stringValue="Execute">	
        test	
      </flowable:field>	
    </flowable:taskListener>	
</bpmn2:extensionElements>`);
});
