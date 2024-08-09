---
title: Decoding LogicFlow's Extension Mechanism
order: 2
toc: content
---

Decoding LogicFlow's Extension Mechanism

## Introduction

Since [LogicFlow](https://github.com/didi/LogicFlow) was officially open-sourced, it has received much more attention than we expected. When we first started to develop LogicFlow, we spent a lot of time discussing what kind of flow visualization library we should build. One option was to create an out-of-the-box library that includes all the commonly used features of a flow editor, with everything pre-configured for easy use. However, we ultimately chose not to go this route because of our background: **in different projects, there are significant differences in the appearance and data format required for the flowchart.** Some projects use activiti, while others use custom workflow engines. **Therefore, we needed a flow visualization library that could support smooth migration across different systems, be flexible enough to meet the visual styles of different systems, and ideally allow selective use of various flowchart features based on specific needs.**

## Plugin-based Extension Mechanism
### Configuration or Plugin-based?
We had two ideas on how to make LogicFlow a flexible flow visualization library. One idea was to make everything configurable, also known as configuration-based approach. Many visualization libraries follow this approach, the most typical example being ECharts. If you've used ECharts, you probably know that its configuration capabilities are very rich, allowing you to configure almost any element's visual effects on the chart, thereby achieving custom effects for developers.

However, for us, making everything configurable to maintain sufficient flexibility would require us to maintain a lot of UI-related logic internally. Let's take a node as an example:

<img src='/docs/_images/custom_node.png' alt='' width='300'/>

If we were to use a configuration-based approach, the configuration passed by the developer might look like this:

```javascript
{
  type: 'rect',
  icon: 'https://example-icon.com/settings.png',
  text: '22\n33333',
}
```


In general, while configuration-based approach may be more user-friendly for developers, it would require significant effort from us to implement various effects and might even lead to dropping support for some less common features due to other considerations. In the long run, this configuration-based approach may not be flexible enough for us.


The plugin-based approach brings several benefits:

2. Secondary extension development; for example, we plan to implement an lf-bpmn plugin in the future, which allows compatibility with the BPMN 2.0 specification in the flow designer. We could also add a lf-venn plugin to draw Venn diagrams using LogicFlow. Eventually, we could have a plugin for every type of flowchart editing.
3. Flexible customization; menus, toolbars, canvases, etc., are implemented as plugins, so developers who find them unsuitable for their business needs can choose not to use them and develop their own instead.
### API Completeness & Stability

What is a plugin? A plugin is a program that follows the interface specification provided by the core program and is written again based on it. Plugins cannot exist independently of the core program; they are an extension of the core program's functionality. Therefore, I believe that the most critical aspect of the plugin-based approach is the completeness and stability of the core program's API. If our API is not complete enough, community developers won't be able to develop plugins that meet their requirements. If our API undergoes significant changes, it could lead to the plugins developed previously becoming incompatible with future versions, resulting in chaos in the entire LogicFlow community ecosystem.

To ensure the completeness and stability of the API, we have done the following:

1. Strictly adhere to open-source versioning standards to ensure controlled impact on the surrounding ecosystem when releasing new versions of LogicFlow.
2. Prioritize forward compatibility when making changes to the API.
3. Validate API soundness and stability through a sufficient number of built-in plugins.
### Built-in Plugins

If we only provide `@logicflow/core`, which represents the graphical editing part of LogicFlow, it means LogicFlow is an unfinished product, which is not conducive to promotion or easy adoption. So, we separated the functionality of LogicFlow into several plugins, such as menu, toolbar, various special nodes, and common flow application scenarios, and implemented them in the `@logicflow/extension` package. Among them is the bpmn-js plugin, and here I will briefly explain how LogicFlow utilizes the plugin mechanism to be compatible with bpmn-js.

1. Basic Shapes: We have a BpmnElement plugin that encapsulates all the basic shapes needed by bpmn-js, such as userTask, gateWay, sequenceFlow, etc.
2. Data Conversion: LogicFlow's default data format is a JSON representation of nodes and edges, while bpmn-js requires data in XML format compliant with the BPMN 2.0 standard. We provide a BpmnAdapter to convert BPMN XML data to LogicFlow Data when importing and vice versa when exporting.
3. Visualization Components: We use LogicFlow's custom component feature to encapsulate menus, canvases, quick tools, etc., required during the process of drawing a flowchart, and package them as Bpmn Components.
4. Packaging: Finally, we package the above three plugins into the Bpmn plugin.

<img src='/docs/_images/bpmn_extension.png' alt='' width='500'/>

LogicFlow itself is just a pure flowchart editor and does not have built-in business attributes. For better ease of use, we offer the Bpmn-js plugin, allowing projects that use bpmn-js to quickly switch to LogicFlow. With the Bpmn plugin, by loading the bpmn plugin into LogicFlow, the page behaves like bpmn-js.

```javascript
import LogicFlow from '@logicflow/core';
import { Bpmn } from '@logicflow/extension';

LogicFlow.use(Bpmn);
```

## LogicFlow's Extension Capability

As mentioned earlier, the strength of a plugin's extensibility depends on whether the core program's API offers sufficient extensibility. LogicFlow's design on most APIs aims to support extensibility. The plugins we developed in `@logicflow/extension` are also a way to validate our APIs. The overall approach to supporting extension capability in LogicFlow is shown in the following diagram:

<img src='/docs/_images/expand.png' alt='' width='500'/>

#### Custom Nodes
For ease of use, LogicFlow provides built-in basic nodes and special nodes, and developers can customize nodes based on these built-in nodes to meet their business requirements.

1. Base Nodes: Internally, @logicflow/core has an abstract class called BaseNode that implements the majority of logic required for nodes in the flowchart, such as handling node dragging, clicking, and edge processing. It also provides methods that can be overridden by subclasses to get node appearance properties, basic properties, and custom properties from configurations.
2. Built-in Nodes: Since BaseNode is an abstract class, for ease of use, LogicFlow also provides some built-in basic shapes, such as Rectangle (RectNode), Circle (CircleNode), Diamond (DiamondNode), and Polygon (PolygonNode).
3. Extension Nodes: To simplify the usage, besides providing built-in nodes for developers to extend and customize in the core package, we also offer more nodes in the extension package @logicflow/extension, such as CylinderNode and RectIconNode.
4. Custom Nodes: Developers can create their custom nodes based on any of the nodes in LogicFlow (including those from @logicflow/extension). They can inherit from existing nodes and override the corresponding methods to implement nodes that meet their business needs. Similarly, developers' custom nodes can become plugins and be contributed to the community. In the future, we plan to add a LogicFlow plugin market, where everyone can freely choose nodes they need for their projects.

<img src='/docs/_images/structure.png' alt='' width='700'/>

### Custom Node Rules

Sometimes, we may need to control the way edges are connected. For example, Node A cannot be the starting point of an edge, Node B cannot be the target point of an edge, or Node C must be followed by Node A, etc. LogicFlow provides a custom node rule mechanism to achieve this requirement.

LogicFlow has two public methods, `getConnectedSourceRules` and `getConnectedTargetRules`, which return the validation rules for the node as a starting point and as a connection target, respectively. When performing an edge operation on the panel, all rules must be met before the connection is allowed.

```javascript
class CnodeModel extends RectModel {
  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const gateWayOnlyAsTarget = {
      message: 'C节点下一个节点只能是A节点',
      validate: (source: BaseNodeModel, target: BaseNodeModel) => {
        let isValid = true;
        if (target.type !== 'a-node') {
          isValid = false;
        }
        return isValid;
      },
    };
    rules.push(gateWayOnlyAsTarget);
    return rules;
  }
  // 判断这个节点的上一个节点是否符合自定义要求
  getConnectedTargetRules() {}
}
```

### Custom Edges

The approach for custom edges is similar to custom nodes. We implement most of the logic for drawing lines in the base edge, and then in the built-in edges, we implement special interaction processing for edges. Finally, developers can customize development based on built-in edges. Of course, since most chart editors only have three types of line representations: straight, polyline, and curve, most custom edges involve changing styles (e.g., colors, dash lines) and names (e.g., edges are called `bpmn:sequenceFlow` in BPMN).

<img src='/docs/_images/custom_line.png' alt='' width='400'/>

### Custom Properties

Typically, for a node, we only need properties like `type`, `x`, `y`, and text to represent all the visible information of a node on the chart. `type` controls the type of the node, `x` and `y` control the position of the node, and `text` controls the text displayed on the node. However, in practical use, we may need to add more business-related properties to the node and use them to handle the node's display. For example, in a flow, we may want to highlight certain nodes to indicate that they are in an abnormal state.

LogicFlow provides a `properties` field for developers to store their business-related `properties`, which can then be used to implement custom handling in custom nodes.

```javascript
import { TriangleNode, PolygonNodeModel } from '@logicflow/core';

class CustomProcessNode extends TriangleNode {
  static extendKey = 'CustomProcessNode';
  getShapeStyle() {
    const attributes = super.getShapeStyle();
    const properties = super.getProperties();
    // If the custom property customStatus is 'error',
    // set the fill color of this node to red.
    if (properties.customStatus === 'error') {
      attributes.fill = 'red'
    }
    return attributes;
  }
}

lf.register({
  type: 'custom-process',
  view: CustomProcessNode,
  model: PolygonNodeModel,
});
```


### Custom Components
In LogicFlow, besides nodes and edges, which are rendered by SVG, there are some components used for control during the flowchart editing process, implemented using HTML (such as menus, control panels, etc.). LogicFlow provides the capability to insert custom DOM elements onto the chart, allowing developers to implement custom components based on this capability.

With the ability to freely insert DOM elements on the chart, we can do many things, such as implementing a tool to adjust node colors and font sizes freely. This tool can be developed just like normal frontend development, and then we insert this DOM element next to the corresponding node when we detect that a node is selected.

### Themes
As mentioned earlier, we can use custom nodes to customize the appearance of any node, but customizing each node individually can be cumbersome. LogicFlow provides a theme feature to uniformly set the basic appearance properties for all nodes. For example, we might want all rectangles to have no border.

```javascript
lf.setTheme({
  rect: {
    strokeWidth: 0
  },
})
```

In addition to setting the appearance of nodes and edges, themes can also set the styles for internal features, such as text and alignment lines.

## Conclusion
Through the above introduction, you should have a good understanding of LogicFlow's extension mechanism. LogicFlow itself is not a flowchart designer specialized for a specific scenario; it is a flowchart editing library. In most cases, strong extensibility means it cannot be used out of the box. To make LogicFlow an out-of-the-box library, LogicFlow uses the plugin-based mechanism to limit the scenarios to actual business scenarios through plugins.

LogicFlow is still a relatively new open-source project, and the provided plugins are not yet sufficient, and there may be some overlooked business scenarios. We welcome everyone to create issues on GitHub, and we will take each issue seriously! LogicFlow is also looking for contributors, so if you are interested, you are welcome to join us in building together!

> To join the user group on WeChat: logic-flow
