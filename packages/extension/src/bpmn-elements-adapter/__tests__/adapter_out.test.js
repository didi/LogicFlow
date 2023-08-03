/* eslint-disable no-useless-concat */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-new */
/* eslint-disable no-undef */
/* eslint-disable no-tabs */
import { BPMNAdapter } from '..';

describe('Test BPMNAdapter: export xml', () => {
  const graphData = {
    nodes: [
      {
        id: 'Event_0rqndvp',
        type: 'bpmn:startEvent',
        x: 350,
        y: 110,
        properties: {},
        text: {
          x: 350,
          y: 150,
          value: '开始',
        },
      },
      {
        id: '121213b3-8fad-4b41-bb1e-a7672e9bfc07',
        type: 'bpmn:subProcess',
        x: 640,
        y: 530,
        properties: {},
        children: [
          'Activity_383p4ds',
          'Event_3nm6g45',
          'Gateway_10p8112',
          'Gateway_36vu52v',
        ],
      },
      {
        id: 'Event_2ffv4vc',
        type: 'bpmn:boundaryEvent',
        x: 220,
        y: 570,
        properties: {
          attachedToRef: 'Activity_05avavm',
          cancelActivity: false,
          definitionType: 'bpmn:timerEventDefinition',
          timerValue: '',
          timerType: '',
          definitionId: 'bpmn:timerEventDefinitionEventDefinition_0anvuso',
          isBoundaryEvent: true,
        },
        text: {
          x: 220,
          y: 610,
          value: '时间边界',
        },
      },
      {
        id: 'Event_2o2l6ht',
        type: 'bpmn:boundaryEvent',
        x: 310,
        y: 320,
        properties: {
          attachedToRef: 'Activity_28r64ai',
          cancelActivity: false,
          definitionType: 'bpmn:timerEventDefinition',
          timerValue: 'PT15S',
          timerType: 'timeDuration',
          definitionId: 'bpmn:timerEventDefinitionEventDefinition_11s0ei9',
          isBoundaryEvent: true,
        },
        text: {
          x: 310,
          y: 360,
          value: '时间边界',
        },
      },
      {
        id: 'Event_3nm6g45',
        type: 'bpmn:boundaryEvent',
        x: 710,
        y: 530,
        properties: {
          attachedToRef: 'Activity_383p4ds',
          cancelActivity: false,
          definitionType: 'bpmn:timerEventDefinition',
          timerValue: 'R5/PT10S',
          timerType: 'timeCycle',
          definitionId: 'bpmn:timerEventDefinitionEventDefinition_0ukj8qs',
          isBoundaryEvent: true,
        },
        text: {
          x: 710,
          y: 570,
          value: '时间边界',
        },
      },
      {
        id: 'Gateway_0ke5iid',
        type: 'bpmn:parallelGateway',
        x: 500,
        y: 140,
        properties: {},
        text: {
          x: 500,
          y: 180,
          value: '并行网关',
        },
      },
      {
        id: 'Gateway_10p8112',
        type: 'bpmn:parallelGateway',
        x: 490,
        y: 530,
        properties: {
          expr: '${A > B}',
        },
        text: {
          x: 490,
          y: 570,
          value: '并行网关',
        },
      },
      {
        id: 'Activity_05avavm',
        type: 'bpmn:userTask',
        x: 270,
        y: 540,
        properties: {},
        text: {
          x: 270,
          y: 540,
          value: '人工任务',
        },
      },
      {
        id: 'Activity_28r64ai',
        type: 'bpmn:userTask',
        x: 370,
        y: 280,
        properties: {},
        text: {
          x: 370,
          y: 280,
          value: '人工任务',
        },
      },
      {
        id: 'Event_3t9u7bs',
        type: 'bpmn:endEvent',
        x: 220,
        y: 210,
        properties: {},
        text: {
          x: 220,
          y: 250,
          value: '结束',
        },
      },
      {
        id: 'Activity_383p4ds',
        type: 'bpmn:serviceTask',
        x: 760,
        y: 530,
        properties: {},
        text: {
          x: 760,
          y: 530,
          value: '服务任务',
        },
      },
      {
        id: 'Gateway_36vu52v',
        type: 'bpmn:inclusiveGateway',
        x: 640,
        y: 580,
        properties: {},
        text: {
          x: 640,
          y: 620,
          value: '包容网关',
        },
      },
    ],
    edges: [
      {
        id: 'Flow_19ep598',
        type: 'bpmn:sequenceFlow',
        sourceNodeId: 'Gateway_0ke5iid',
        targetNodeId: 'Event_3t9u7bs',
        startPoint: {
          x: 475,
          y: 140,
        },
        endPoint: {
          x: 238,
          y: 210,
        },
        properties: {},
        pointsList: [
          {
            x: 475,
            y: 140,
          },
          {
            x: 445,
            y: 140,
          },
          {
            x: 445,
            y: 210,
          },
          {
            x: 238,
            y: 210,
          },
        ],
      },
      {
        id: 'Flow_1cju7v0',
        type: 'bpmn:sequenceFlow',
        sourceNodeId: 'Gateway_0ke5iid',
        targetNodeId: '121213b3-8fad-4b41-bb1e-a7672e9bfc07',
        startPoint: {
          x: 500,
          y: 165,
        },
        endPoint: {
          x: 640,
          y: 430,
        },
        properties: {},
        pointsList: [
          {
            x: 500,
            y: 165,
          },
          {
            x: 500,
            y: 195,
          },
          {
            x: 640,
            y: 195,
          },
          {
            x: 640,
            y: 430,
          },
        ],
      },
      {
        id: 'Flow_0phuver',
        type: 'bpmn:sequenceFlow',
        sourceNodeId: 'Activity_05avavm',
        targetNodeId: 'Activity_28r64ai',
        startPoint: {
          x: 270,
          y: 500,
        },
        endPoint: {
          x: 370,
          y: 320,
        },
        properties: {},
        pointsList: [
          {
            x: 220,
            y: 540,
          },
          {
            x: 190,
            y: 540,
          },
          {
            x: 190,
            y: 410,
          },
          {
            x: 450,
            y: 410,
          },
          {
            x: 450,
            y: 280,
          },
          {
            x: 420,
            y: 280,
          },
        ],
      },
      {
        id: 'Flow_3ql1931',
        type: 'bpmn:sequenceFlow',
        sourceNodeId: '121213b3-8fad-4b41-bb1e-a7672e9bfc07',
        targetNodeId: 'Activity_05avavm',
        startPoint: {
          x: 440,
          y: 530,
        },
        endPoint: {
          x: 320,
          y: 540,
        },
        properties: {},
        pointsList: [
          {
            x: 440,
            y: 530,
          },
          {
            x: 380,
            y: 530,
          },
          {
            x: 380,
            y: 540,
          },
          {
            x: 320,
            y: 540,
          },
        ],
      },
      {
        id: 'Flow_39cdevi',
        type: 'bpmn:sequenceFlow',
        sourceNodeId: 'Gateway_10p8112',
        targetNodeId: 'Activity_383p4ds',
        startPoint: {
          x: 515,
          y: 530,
        },
        endPoint: {
          x: 710,
          y: 530,
        },
        properties: {
          expressionType: 'cdata',
          condition: 'foo &gt; bar',
        },
        pointsList: [
          {
            x: 515,
            y: 530,
          },
          {
            x: 545,
            y: 530,
          },
          {
            x: 545,
            y: 460,
          },
          {
            x: 760,
            y: 460,
          },
          {
            x: 760,
            y: 490,
          },
        ],
      },
      {
        id: 'Flow_1mpq63n',
        type: 'bpmn:sequenceFlow',
        sourceNodeId: 'Gateway_10p8112',
        targetNodeId: 'Gateway_36vu52v',
        startPoint: {
          x: 515,
          y: 530,
        },
        endPoint: {
          x: 615,
          y: 580,
        },
        properties: {
          isDefaultFlow: true,
        },
        pointsList: [
          {
            x: 515,
            y: 530,
          },
          {
            x: 565,
            y: 530,
          },
          {
            x: 565,
            y: 580,
          },
          {
            x: 615,
            y: 580,
          },
        ],
      },
    ],
  };
  const xml = `    <bpmn:definitions id="Definitions" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://logic-flow.org" exporter="logicflow" exporterVersion="1.2.10">	
  <bpmn:process isExecutable="true" id="Process">	
      <bpmn:startEvent id="Event_0rqndvp" name="开始" />	
      <bpmn:subProcess id="121213b3-8fad-4b41-bb1e-a7672e9bfc07">	
          <bpmn:incoming>Flow_1cju7v0</bpmn:incoming>	
          <bpmn:outgoing>Flow_3ql1931</bpmn:outgoing>	
          <bpmn:serviceTask id="Activity_383p4ds" name="服务任务">	
              <bpmn:incoming>Flow_39cdevi</bpmn:incoming>	
          </bpmn:serviceTask>	
          <bpmn:boundaryEvent id="Event_3nm6g45" name="时间边界" attachedToRef="Activity_383p4ds" cancelActivity="false" definitionType="bpmn:timerEventDefinition" timerValue="R5/PT10S" timerType="timeCycle" definitionId="bpmn:timerEventDefinitionEventDefinition_0ukj8qs" isBoundaryEvent="true">	
            <bpmn:timerEventDefinition id="bpmn:timerEventDefinitionEventDefinition_0ukj8qs"><bpmn:timeCycle xsi:type="bpmn:tFormalExpression">R5/PT10S</bpmn:timeCycle></bpmn:timerEventDefinition>	
          </bpmn:boundaryEvent>	
          <bpmn:parallelGateway id="Gateway_10p8112" name="并行网关" expr="\${A > B}">	
              <bpmn:outgoing>Flow_39cdevi</bpmn:outgoing>	
              <bpmn:outgoing>Flow_1mpq63n</bpmn:outgoing>	
          </bpmn:parallelGateway>	
          <bpmn:inclusiveGateway id="Gateway_36vu52v" name="包容网关">	
              <bpmn:incoming>Flow_1mpq63n</bpmn:incoming>	
          </bpmn:inclusiveGateway>	
          <bpmn:sequenceFlow id="Flow_39cdevi" sourceRef="Gateway_10p8112" targetRef="Activity_383p4ds" expressionType="cdata" condition="foo &gt; bar">	
            <bpmn:conditionExpression xsi:type="bpmn2:tFormalExpression"><![CDATA[\${foo &gt; bar}]]></bpmn:conditionExpression>	
          </bpmn:sequenceFlow>	
          <bpmn:sequenceFlow id="Flow_1mpq63n" sourceRef="Gateway_10p8112" targetRef="Gateway_36vu52v" isDefaultFlow="true" />	
      </bpmn:subProcess>	
      <bpmn:boundaryEvent id="Event_2ffv4vc" name="时间边界" attachedToRef="Activity_05avavm" cancelActivity="false" definitionType="bpmn:timerEventDefinition" timerValue="" timerType="" definitionId="bpmn:timerEventDefinitionEventDefinition_0anvuso" isBoundaryEvent="true">	
        <bpmn:timerEventDefinition id="bpmn:timerEventDefinitionEventDefinition_0anvuso"/>	
      </bpmn:boundaryEvent>	
      <bpmn:boundaryEvent id="Event_2o2l6ht" name="时间边界" attachedToRef="Activity_28r64ai" cancelActivity="false" definitionType="bpmn:timerEventDefinition" timerValue="PT15S" timerType="timeDuration" definitionId="bpmn:timerEventDefinitionEventDefinition_11s0ei9" isBoundaryEvent="true">	
        <bpmn:timerEventDefinition id="bpmn:timerEventDefinitionEventDefinition_11s0ei9"><bpmn:timeDuration xsi:type="bpmn:tFormalExpression">PT15S</bpmn:timeDuration></bpmn:timerEventDefinition>	
      </bpmn:boundaryEvent>	
      <bpmn:parallelGateway id="Gateway_0ke5iid" name="并行网关">	
          <bpmn:outgoing>Flow_19ep598</bpmn:outgoing>	
          <bpmn:outgoing>Flow_1cju7v0</bpmn:outgoing>	
      </bpmn:parallelGateway>	
      <bpmn:userTask id="Activity_05avavm" name="人工任务">	
          <bpmn:incoming>Flow_3ql1931</bpmn:incoming>	
          <bpmn:outgoing>Flow_0phuver</bpmn:outgoing>	
      </bpmn:userTask>	
      <bpmn:userTask id="Activity_28r64ai" name="人工任务">	
          <bpmn:incoming>Flow_0phuver</bpmn:incoming>	
      </bpmn:userTask>	
      <bpmn:endEvent id="Event_3t9u7bs" name="结束">	
          <bpmn:incoming>Flow_19ep598</bpmn:incoming>	
      </bpmn:endEvent>	
      <bpmn:sequenceFlow id="Flow_19ep598" sourceRef="Gateway_0ke5iid" targetRef="Event_3t9u7bs" />	
      <bpmn:sequenceFlow id="Flow_1cju7v0" sourceRef="Gateway_0ke5iid" targetRef="121213b3-8fad-4b41-bb1e-a7672e9bfc07" />	
      <bpmn:sequenceFlow id="Flow_0phuver" sourceRef="Activity_05avavm" targetRef="Activity_28r64ai" />	
      <bpmn:sequenceFlow id="Flow_3ql1931" sourceRef="121213b3-8fad-4b41-bb1e-a7672e9bfc07" targetRef="Activity_05avavm" />	
  </bpmn:process>	
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">	
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process">	
        <bpmndi:BPMNEdge id="Flow_19ep598_di" bpmnElement="Flow_19ep598">	
            <di:waypoint x="475" y="140" />	
            <di:waypoint x="445" y="140" />	
            <di:waypoint x="445" y="210" />	
            <di:waypoint x="238" y="210" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_1cju7v0_di" bpmnElement="Flow_1cju7v0">	
            <di:waypoint x="500" y="165" />	
            <di:waypoint x="500" y="195" />	
            <di:waypoint x="640" y="195" />	
            <di:waypoint x="640" y="430" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_0phuver_di" bpmnElement="Flow_0phuver">	
            <di:waypoint x="220" y="540" />	
            <di:waypoint x="190" y="540" />	
            <di:waypoint x="190" y="410" />	
            <di:waypoint x="450" y="410" />	
            <di:waypoint x="450" y="280" />	
            <di:waypoint x="420" y="280" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_3ql1931_di" bpmnElement="Flow_3ql1931">	
            <di:waypoint x="440" y="530" />	
            <di:waypoint x="380" y="530" />	
            <di:waypoint x="380" y="540" />	
            <di:waypoint x="320" y="540" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_39cdevi_di" bpmnElement="Flow_39cdevi">	
            <di:waypoint x="515" y="530" />	
            <di:waypoint x="545" y="530" />	
            <di:waypoint x="545" y="460" />	
            <di:waypoint x="760" y="460" />	
            <di:waypoint x="760" y="490" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_1mpq63n_di" bpmnElement="Flow_1mpq63n">	
            <di:waypoint x="515" y="530" />	
            <di:waypoint x="565" y="530" />	
            <di:waypoint x="565" y="580" />	
            <di:waypoint x="615" y="580" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNShape id="Event_0rqndvp_di" bpmnElement="Event_0rqndvp">	
          <dc:Bounds x="330" y="90" width="40" height="40" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="340" y="143" width="20" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="121213b3-8fad-4b41-bb1e-a7672e9bfc07_di" bpmnElement="121213b3-8fad-4b41-bb1e-a7672e9bfc07">	
          <dc:Bounds x="590" y="490" width="100" height="80" />	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Event_2ffv4vc_di" bpmnElement="Event_2ffv4vc">	
          <dc:Bounds x="170" y="530" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="200" y="603" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Event_2o2l6ht_di" bpmnElement="Event_2o2l6ht">	
          <dc:Bounds x="260" y="280" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="290" y="353" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Event_3nm6g45_di" bpmnElement="Event_3nm6g45">	
          <dc:Bounds x="660" y="490" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="690" y="563" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Gateway_0ke5iid_di" bpmnElement="Gateway_0ke5iid">	
          <dc:Bounds x="450" y="100" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="480" y="173" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Gateway_10p8112_di" bpmnElement="Gateway_10p8112">	
          <dc:Bounds x="440" y="490" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="470" y="563" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Activity_05avavm_di" bpmnElement="Activity_05avavm">	
          <dc:Bounds x="220" y="500" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="250" y="533" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Activity_28r64ai_di" bpmnElement="Activity_28r64ai">	
          <dc:Bounds x="320" y="240" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="350" y="273" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Event_3t9u7bs_di" bpmnElement="Event_3t9u7bs">	
          <dc:Bounds x="200" y="190" width="40" height="40" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="210" y="243" width="20" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Activity_383p4ds_di" bpmnElement="Activity_383p4ds">	
          <dc:Bounds x="710" y="490" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="740" y="523" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Gateway_36vu52v_di" bpmnElement="Gateway_36vu52v">	
          <dc:Bounds x="590" y="540" width="100" height="80" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="620" y="613" width="40" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
    </bpmndi:BPMNPlane>	
  </bpmndi:BPMNDiagram>	
</bpmn:definitions>`;
  const lf = {};
  const adapter = new BPMNAdapter({ lf });

  it('should transform logic-flow graph data to bpmn xml', () => {
    expect(adapter.adapterXmlOut(graphData)).toEqual(xml);
  });
});
