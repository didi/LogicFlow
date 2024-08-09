---
title: The design and architecture of LogicFlow
order: 1
toc: content
---

The design and architecture of LogicFlow

## Introduction to LogicFlow

LogicFlow is a flowchart editing framework by didi experience platform, providing a series of functions necessary for flowchart interaction and editing, as well as simple and flexible node customization, plug-in and other expansion mechanisms, so that we can quickly meet the needs of flowcharts in business systems. Currently, LogicFlow has supported many systems such as IVR, work order flow and intelligent robot under customer service business, and has been proven in different process configuration requirements of each system.

## Why do we develop LogicFlow

First of all, under the demand of supporting the customer service system of almost all divisions of the group, the traditional scenario-oriented programming is costly and long-period in the face of diverse and fast-changing logic business scenarios. Therefore, we have built an online configurable operation system that allows operations and products to change online business logic by drawing flowcharts, such as interactive voice response when users call in, standard operating procedures for manual customer service in handling users who call in, and various other application scenarios.

While all business systems require the application of process editing technology, the needs vary. Some have simple requirements for flowcharts and data formats for diagrams, while others need to follow the BPMN specifications for flowcharts and have higher requirements for customization. We investigated the relevant frameworks on the market (BPMN.js, X6, Jsplumb, G6-editor), but there are some scenarios that do not meet the requirements, and the cost of technology stack unification is high. It is embodied in:

1. The expansion ability of BMPN.js and Jsplumb is insufficient, and the cost of custom nodes is high. Moreover, it can only be imported in full, and can not be imported into each system on demand.
2. It is more expensive to adapt to the process engine of the back-end. None of them support business customization requirements such as data conversion and verification of processes.

As a result, we started the LogicFlow project in the first half of 2020 to support the process editing needs of each system.


## Capabilities and features of LogicFlow
I will cover what LogicFlow is capable of today in two parts.

### Flowchart editor quick build
Providing various capabilities necessary for editing a flowchart, which is also the basic capability of LogicFlow:

- The ability to draw graphs. Draw nodes and edges of various shapes based on SVG, and provide basic nodes (rectangles, circles, polygons, etc.) and edges (straight lines, polylines, bezier).
- All kinds of interactive capabilities. Respond to various mouse events (hover, click, drag, etc.) of nodes, edges, and graphs. Such as node dragging, dragging to create edges, line adjustment, double-clicking nodes to edit text, etc.
- Ability to improve editing efficiency. Provide grids, alignment lines, previous step, next step, keyboard shortcuts, image zoom in and out, etc., to help users improve editing efficiency.
- Providing Rich API. Developer completes the interaction with LogicFlow by calling API and listening to events.

With the above capabilities, front-end R&D can cost effectively and quickly build up process editing applications to provide smooth product interactions. The following is an example of a flowchart made through LogicFlow's built-in nodes and supporting capabilities：

![example1](https://dpubstatic.udache.com/static/dpubimg/eEMT14E7BR/lfexample1.gif)

### Expand based on business scenarios

When basic capabilities cannot meet business needs, they need to be expanded based on business scenarios.  This is the key to LogicFlow's ability to support multiple systems on the customer service side.

- Set the style of all elements on the graph, such as the size and color of various nodes, lines, anchor points, arrows, alignment lines, etc., to meet the needs of front-end style adjustments.
- API extensions. Supports registering custom methods on LogicFlow, such as extending the method of providing image downloads through API extensions.
- Custom nodes, edges. Built-in graphics nodes such as rectangles and circles often cannot meet actual business needs, and nodes with business significance need to be defined. LogicFlow provides a way for users to customize nodes with custom graphics and business data, such as the "Approval" node in the process approval scenario.
- Extension components. LogicFlow provides an HTML layer and a series of coordinate transformation logic on top of the SVG layer, and supports registering components on the HTML layer. Host R&D can develop components based on any View framework through the LogicFlow API, such as the right-click menu of the node, the control panel, etc.
- Data conversion adapter. The graph data exported by LogicFlow by default may not be suitable for all businesses. At this time, you can use the adapter API to do custom conversion when the graph data is input and output from LogicFlow, such as converting to BPMN-standard graph data.
- Built-in partial expansion capabilities. Based on the above-mentioned expansion capabilities, we also provide a extension package, which is used to store the general-purpose nodes and components precipitated under the current business, such as nodes and data adapters oriented to the BPMN specification, and the default menu. Note that extension can be installed separately and supports on-demand import.

Based on the above expanded capabilities, front-end R&D can flexibly develop required nodes, components, etc. according to the needs of actual business scenarios. Below are two flow charts based on LogicFlow's expansion capabilities:

BPMN： http://logic-flow.org/examples/#/extension/bpmn

![image:bpmn](https://dpubstatic.udache.com/static/dpubimg/CS6S6q9Yxf/lfexample2.gif)

Approval Flow：http://logic-flow.org/examples/#/extension/approve

![image: Approval-Flow](https://dpubstatic.udache.com/static/dpubimg/uBeSlMEytL/lfexample3.gif)

## Implementation principles and architecture

### Overall architecture diagram
![image: lfjk](https://dpubstatic.udache.com/static/dpubimg/fg7q5j_5nG/lfjk.png)

The core package `@logicflow/core` provides the basic capabilities of the flowchart editor, and the `@logicflow/extension` on the right is a plugin developed based on the extensibility of `@logicflow/core`.

### Design scheme of flow chart editor
We mainly introduce the selection and scheme design that is important to implement the flowchart editor.

#### Graph rendering scheme
Front-end drawing graphics is nothing but HTML + CSS, Canvas, Svg three ways, we do a comprehensive comparison, listed the corresponding advantages and disadvantages:

![bijiao1](https://dpubstatic.udache.com/static/dpubimg/-IgPkns3On/bijiao.png)


In the flowchart scenario, there is no need to render a large number of nodes (up to thousands of elements), and there is not a high demand for animation. The DOM-based nature of Svg will be more suitable for us, one is the lower learning and development cost, and the other is the DOM-based can do more extensions. However, the Svg tag does not support the insertion of other tags such as div, so it is necessary to combine other HTML tags when implementing certain functions.

So finally we choose to **use HTML + Svg to complete the rendering of the diagram, Svg is responsible for the graphics, line part, HTML to achieve text, menu, background and other layers**.

#### Module abstraction

Based on the above scheme, the next step we have to do is to classify and abstract the implementation of a flowchart.

![image: mkcx](https://dpubstatic.udache.com/static/dpubimg/LsdAsOJ1r4/xuanranchouxiang.png)

By the above chart：
- First, we build multiple layers to take on different responsibilities, which makes it easy to extend the functionality. The uppermost layer is the Svg layer, where all graphs (nodes, edges, alignment lines, outLine, etc.) are rendered on the Svg and are also responsible for listening to various events on the graph.The lower layers of Svg are the Component layer, which is responsible for expanding UI components;  the Grid layer, which is responsible for rendering the grid;  and the Background layer, which adds custom backgrounds.
- The responsibility of Shape is mainly to encapsulate the graphics rendering based on Svg, provide default styles, transform the attributes passed by the user, and so on. It mainly includes Rect, Circle, Ellipse, Polygon, Path, PolyLine, Text, etc., which is convenient for LogicFlow internal reuse. For example, Circle is required for both circular nodes and anchors.
- Based on Shape, many small elements are also implemented, such as anchor points needed for nodes and edges, arrows on edges, etc.
- BaseNode and BaseEdge encapsulate the general capabilities of nodes and edges, aggregating shape, anchor points, text, and also encapsulating the handling of events and styles.  By inheriting BaseNode and passing in shape, we can get renderable nodes such as RectNode, CircleNode, etc.

Because the flow chart is rich interactive, with these basic modules, the next thing to do is to design the rich interactive scheme, that is, to respond to any operation that users do on the diagram. For example, if I drag a node, the associated edge may need to follow, and Logicflow can also identify if there are other nodes (alignment lines) on a certain horizontal line.

#### MVVM + Virtual DOM

First of all, we consider that the whole diagram editor has a lot of state storage, and the ability to communicate between states is necessary to realize the response of each module on the editor diagram. Secondly, if you want to achieve something like redo/undo, the whole graph must be rendered based on the data, i.e. fn(state) => View, and a good way is to drive the View through the Model.

Finally, we choose to build the graph editor of LogicFlow based on MVVM, a design pattern widely used in current front-end engineering, and define the View and Model layers of the graph to make the engineering code have a certain degree of decoupling. At the same time, Mobx was introduced to enable our state management and data response capabilities.  A diagram is based on a Model to do the communication of state.  In addition, another reason to consider Mobx is that I can do the finest granularity of data binding (observation) whenever I want, which can reduce unnecessary rendering.

The following is a schematic of MVVM for the LogicFlow graph editor:
![image: mvvm](https://dpubstatic.udache.com/static/dpubimg/0o4_gZX0Ky/mvvm.png)

As you can see in the figure above, the View layer (diagram, nodes, etc.) responds/updates after the Model changes through data binding.  As we mentioned earlier that the rendering of the diagram is based on Svg + HTML, there are only two options to do the update of the View layer: imperative and declarative:
- Imperative. For example, jQuery's api, `$('.rectNode').attrs({x: 1, y: 2})`, which manipulates the DOM code in this way is actually rather cumbersome and redundant to write in a heavy interaction scenario. Although we eventually found a library that can easily support drawing by imperative way - antv/g.
- Declarative.  One of the core capabilities of view frameworks like React/Vue, for example, is to do state => UI.  By building the DOM declaratively, whenever the state changes, the UI is updated.

In addition to the fact that it is tedious to write code in the DOM manipulation scenario, another reason is the high cost of DOM manipulation. In the design of updating UI based on State, we naturally thought of introducing Virtual DOM to solve the update efficiency in some scenes, which can also make up for the rendering performance problems that may be caused by "rendering graphics based on Svg" to some extent.

In short, the two most fundamental reasons for choosing the MVVM design pattern and introducing the Virtual DOM are to improve the **development efficiency** in our graph editor scenario, and to pursue **better performance** in the HTML + Svg graph rendering scheme.

#### Event
To collect all kinds of user "actions" and report and bubble them in time, an event system is needed. The main thing is reuse and uniform reporting.

![image: Event](https://dpubstatic.udache.com/static/dpubimg/YHNzhMl-w2/Event.png)

Reuse means how to ensure that all nodes and edges have default event callbacks, and how to share the processing logic for complex events (dragging).
- Behavior. For complex event handling, we use function and class wrappers. Drag, for example, simulates h5's dragEnter, dragOver, dragEnd, and drop events via mousemove, down, and up. DnD implements the drag and drop interaction by abstracting the two entities dragsource and droptarget, such as dragging to create a node.
- As mentioned in the previous module abstraction section, Logicflow has internal abstractions like BaseNode and BaseEdge, and both built-in nodes and custom nodes gain common capabilities by inheriting from the base class. So the default event callbacks inside LogicFlow are actually reused through inheritance.
- EventCenter. Through the event bus, all user behavior events captured internally are reported to EventCenter according to a certain specification and format `emit(ev, args)`, and finally bubble up to the LogicFlow class, which will interact with the host.  In addition, any place in the graph editor can also do event triggering and listening through EventCenter.

#### Tool Center
The tool center is positioned as utils that solve a specific type of problem, such as the Behavior (wrapper for complex events) and EventCenter mentioned above.  in addition, there is actually a lot of complex computational logic to deal with in the process of graph editing if you want to achieve better interaction.

- Coordinate system. The clientX and clientY coordinate systems of the browser, and the coordinate system of the Svg graph itself. When there is zooming and panning of the graph, the two coordinate systems are obviously different, so how to do the conversion of the coordinate systems?
- Algorithm. Some problems of visualization are handled by geometry, algorithms.  For example:
When a node has more than one line in the same direction, how to do the merging of the paths for a more beautiful presentation, as follows:

    ![image: shili1](https://dpubstatic.udache.com/static/dpubimg/kml-1XH1t2/shili1.png)

    How to calculate the tangent point of a line to a graph in order to reach the position where the line can connect the non-anchor points of the graph, as follows:

    ![image:shili2](https://dpubstatic.udache.com/static/dpubimg/IwLtmEhGch/shili2.png)

- History. Mainly provides redo and undo capabilities. Two stacks are used to store undos and redos, and the maximum length is limited. Thanks to the MVVM design pattern, it is easy to do data change observation and Model driven View.

The details of the implementation of these parts will not be expanded here, and some special article will follow to introduce them.

### Extensibility
After describing the design of the flowchart editor, let's introduce another important feature of LogicFlow, the design for extensibility. In the program world, from a small function, a service, to a development framework react, applet development framework, to a Chrome-like application platform, all have their own scalability, which is a design to be considered in the process of software development. For LogicFlow, which is a development framework to solve a specific domain problem, the API should be extensible. In addition, LogicFlow also provides a View layer, in which users should be able to do secondary development. After the direction of these two extensions is determined, the main thing is to combine the business needs to be able to meet the current and future business scenarios foreseen in a period of time, but also not to over-design.

#### Design on API
First of all, LogicFlow is completely encapsulated based on object-oriented design patterns, the biggest advantage is that almost every programmer is familiar with its use, and the cost of using it is low. This can be understood by the following initialization method:

```js
const lf = new LogicFlow({ // Instantiate the lf object
  container: document.querySelector('#graph'), // Get the rendering container
  width: 700,
  height: 600,
  background: {
    color: '#F0F0F0'
  },
  grid: {
    type: 'dot',
    size: 20,
  },
});
lf.render({ nodes: [], edges: []}); // Rendering views on the interface
```
With 'class LogicFlow', the user instantiates a single instance of the flowchart, and the state is private. The various methods are called from an instance of `lf`.
A summary of the design of API extensions:
1. Object-oriented design pattern.  LogicFlow does a good job of encapsulation internally, so users can inherit and override interfaces/methods.
2. The design of the method. The first step is to have fixed types of inputs and outputs. In addition, LogicFlow also provides extends-like methods that extend methods on prototypes with LogicFlow.use(fn).
3. Communication is done through the observer pattern, i.e. providing `on` methods for the host to subscribe to various internal events.
4. The data of the diagram is customizable.  Whether it is what custom business attributes a node or edge has, or what kind of data to export for a flowchart, it should be able to be customized.

#### Plugins
In addition to being able to customize the presentation, the most important aspect of the extensibility of the View layer is pluggable. Because different business scenarios require different capabilities in process visualization, it is difficult for LogicFlow to support all scenarios. Therefore, it is a better choice to provide good pluggable ability and let users develop twice. Currently, in the UI, we have two open capabilities:
1. Nodes and edges support secondary development, that is, user-defined nodes and edges.
2. You can develop UI components to be registered in LogicFlow's Component Canvas.

Based on the idea of plug-in, we have supported different business systems, and in the process, we have precipitated some common capabilities and encapsulated them in the lf-extension package, such as the nodes used to support the BPMN specification.  There are four main categories of extensions: UI components, custom nodes, APIs, and adapters, and there will be a special article on the detailed design and implementation of plug-ins.

## Future Plans

v1.0 was released in 2021.4. We currently define version 1.0 as:
1. The ease of use and richness of the API. Because LogicFlow is still a new student, it still needs to be verified by a large number of users and different type systems, as well as the joint construction of developers before it can evolve into a mature and useful library. In addition to our current iteration plan, the list of specific features will also be added according to the priority of users' needs. We hope that you can give us your comments and requirements. The keynote of this direction is to keep the positioning of LogicFlow process visualization, enrich the API of core, and enhance the ability of extension.
2. Better documentation and examples. It mainly includes that the documentation is easy to read, complete, available in English, and has complete examples and code for developers to copy and paste.
3. It is not only used as a process visualization library, but is expected to provide a complete solution. LogicFlow only solves the technical problem of front-end flowchart editing, but a supporting process engine is needed for the definition of the graph data and how the process is ultimately executed. At present, our team also has a corresponding solution for "process engine" -- turbo, which will also be open source in the future. We will make an end-to-end solution for LogicFlow and turbo, and provide a complete application example. Let's wait and see!


## Last
I believe you have a general understanding of LogicFlow, and if you are responsible for a business that also has process editing requirements and a high level of extensibility, LogicFlow is a good choice. We welcome everyone to exchange implementation details of LogicFlow technology itself, discuss similar business, etc.
We will have more articles on LogicFlow's extension mechanism, edge calculation logic, and other thoughts on visualization, so look forward to them.

- WeChat user group: logic-flow
