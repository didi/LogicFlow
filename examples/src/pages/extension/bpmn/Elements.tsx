import React, { useEffect } from "react";
import LogicFlow from "@logicflow/core";
import { BpmnElement } from "@logicflow/extension";
import ExampleHeader from "../../../components/example-header";

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true
};

const data = {
  nodes: [
    {
      id: 10,
      type: "bpmn:startEvent",
      x: 76,
      y: 178,
      properties: {},
      baseType: "node",
      text: { x: 76, y: 213, value: "StartEvent" },
    },
    {
      id: 11,
      type: "bpmn:endEvent",
      x: 567,
      y: 176,
      properties: {},
      baseType: "node",
      text: { x: 567, y: 211, value: "EndEvent" },
    },
    {
      id: 12,
      type: "bpmn:userTask",
      x: 386,
      y: 59,
      properties: {},
      baseType: "node",
      text: { x: 386, y: 59, value: "UserTask" },
    },
    {
      id: 13,
      type: "bpmn:serviceTask",
      x: 385,
      y: 286,
      properties: {},
      baseType: "node",
      text: { x: 385, y: 286, value: "ServiceTask" },
    },
    {
      id: 14,
      type: "bpmn:exclusiveGateway",
      x: 206,
      y: 178,
      properties: {},
      baseType: "node",
    },
  ],
  edges: [
    {
      id: "Flow_2fs3ivm",
      type: "bpmn:sequenceFlow",
      sourceNodeId: 10,
      targetNodeId: 14,
      startPoint: { x: 94, y: 178 },
      endPoint: { x: 181, y: 178 },
      properties: {},
      pointsList: [
        { x: 94, y: 178 },
        { x: 181, y: 178 },
      ],
    },
    {
      id: "Flow_2mtbh4v",
      type: "bpmn:sequenceFlow",
      sourceNodeId: 14,
      targetNodeId: 12,
      startPoint: { x: 231, y: 178 },
      endPoint: { x: 336, y: 59 },
      properties: {},
      pointsList: [
        { x: 231, y: 178 },
        { x: 306, y: 178 },
        { x: 306, y: 59 },
        { x: 336, y: 59 },
      ],
    },
    {
      id: "Flow_1hm4ecl",
      type: "bpmn:sequenceFlow",
      sourceNodeId: 14,
      targetNodeId: 13,
      startPoint: { x: 231, y: 178 },
      endPoint: { x: 335, y: 286 },
      properties: {},
      pointsList: [
        { x: 231, y: 178 },
        { x: 305, y: 178 },
        { x: 305, y: 286 },
        { x: 335, y: 286 },
      ],
    },
    {
      id: "Flow_1vo95qa",
      type: "bpmn:sequenceFlow",
      sourceNodeId: 12,
      targetNodeId: 11,
      startPoint: { x: 436, y: 59 },
      endPoint: { x: 549, y: 176 },
      properties: {},
      pointsList: [
        { x: 436, y: 59 },
        { x: 519, y: 59 },
        { x: 519, y: 176 },
        { x: 549, y: 176 },
      ],
    },
    {
      id: "Flow_3o5b4v0",
      type: "bpmn:sequenceFlow",
      sourceNodeId: 13,
      targetNodeId: 11,
      startPoint: { x: 435, y: 286 },
      endPoint: { x: 549, y: 176 },
      properties: {},
      pointsList: [
        { x: 435, y: 286 },
        { x: 519, y: 286 },
        { x: 519, y: 176 },
        { x: 549, y: 176 },
      ],
    },
  ],
};

export default function Elements() {
  useEffect(() => {
    LogicFlow.use(BpmnElement);
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector("#graph") as HTMLElement,
    });
    // @ts-ignore
    window.lf = lf;
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader githubPath="/extension/bpmn/Elements.tsx" />
      <div id="graph" className="viewport"></div>
    </>
  )
}
