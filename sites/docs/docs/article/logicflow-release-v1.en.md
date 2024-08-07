---
title: LogicFlow released version 1.0
order: 4
toc: content
---

LogicFlow released version 1.0

![LogicFlow-2](https://github.com/didi/LogicFlow/assets/27529822/2208aad3-34eb-4f47-b738-0856a9a54545)

On December 31, 2021, we released LogicFlow version 1.0. LogicFlow is a **flowchart editing framework** that provides a series of features required for flowchart interaction and editing, and flexible expansion mechanisms for custom nodes, edges, plug-ins, etc. It can be used to develop various logic orchestration scenarios, such as flowcharts, brain maps, BPMN processes, etc.

On December 31, 2020, we open-sourced version 0.1 of LogicFlow. We continued to refine LogicFlow based on community feedback and finally released LogicFlow v1.0 on the one-year anniversary of its open source release.

## Characteristics of LogicFlow

### Class inheritance based customization mechanism

LogicFlow's customization mechanism is based on class inheritance. Developers can inherit the built-in nodes and edges of LogicFlow, and then use the object-oriented overriding mechanism to rewrite the related methods to achieve the effect of custom nodes.

Here is an example diagram of a custom model for LogicFlow (PS: This diagram is also drawn in LogicFlow) :

![logicflow-1.0-2.png](https://github.com/didi/LogicFlow/assets/27529822/1f582b02-3107-4549-958a-94b3e62e059f)

In order to define a node in LogicFlow, not only the model of the node needs to be defined, but also the view of the node needs to be defined using this inheritance method. This is because LogicFlow adopts the MVVM development pattern.

### Mvvm-based development model

LogicFlow chose the MVVM model, which is widely used in front-end engineering, for development in order to align the development experience with the popular front-end development experience, and for better understanding at the code level so that more people can participate in it. Define the View and Model layers of the graph, while leaving the view updates to the framework to do, so that the project code has some decoupling.   If you are familiar with react development, you can read our source code directly, you can find the whole project is about as easy to read as your usual business system development.

> We welcome everyone to join us. Whether you've changed a document punctuation or refactored one of our modules, you can give us a PR and we'll take each of your commits seriously.

The following is a schematic of LogicFlow's MVVM pattern:

![logicflow-1.0-3.png](https://github.com/didi/LogicFlow/assets/27529822/f6e16693-85e2-49fa-91d0-524ccae53112)

### Plug-in support for all non-core functions

The code released by LogicFlow is divided into two packages, @logicflow/core and @logicflow/extension, where the core package contains only the core functions of graph editing and the exposed graph editing API. Non-graph editing features such as **menu**, **Control bar**, **navigation**, **bpmn**, **node scaling**, etc. are provided as plugins in the extension package. In practice, you can freely choose a plug-in according to your own product logic, and if you are not satisfied with the plug-in, you can also completely re-implement one based on your own needs.

## LogicFlow-based example

One of the core ideas of LogicFlow development is high scalability. We developed LogicFlow to make the front end less of a bottleneck when it comes to flowchart related business. Here are some examples of our implementation:

### bpmn

LogicFlow implements **BPMN** extensions that allow the direct use of LogicFlow to draw BPMN 2.0 compliant processes and its exported data to run on the Activiti Process Engine.

> See: [http://logic-flow.org/usage/bpmn.html](http://logic-flow.org/mvp/index.html)

Example diagram:

![lfexample2.gif](https://dpubstatic.udache.com/static/dpubimg/CS6S6q9Yxf/lfexample2.gif)

### Examples of graphing tools

LogicFlow not only supports the development of flowcharting tools like bpmn.js that have a fixed overall style and are more oriented towards generating data that can be executed in the flow engine. It also supports the implementation of similar to ProcessOn, a free control style of graphing tools.

> See：[http://logic-flow.org/mvp/index.html](http://logic-flow.org/mvp/index.html)

Example diagram:

![logicflow-1.0-4.png](https://github.com/didi/LogicFlow/assets/27529822/c842abac-e7af-445a-ad06-36e6d0a17b7f)

### Approval flow

Here is an example of the approval flow we implemented in our react project

> See：[http://logic-flow.org/usage/approve.html](http://logic-flow.org/usage/approve.html)

Example diagram:

![https://dpubstatic.udache.com/static/dpubimg/uBeSlMEytL/lfexample3.gif](https://dpubstatic.udache.com/static/dpubimg/uBeSlMEytL/lfexample3.gif)

### Customized Scenes

Here is an example of a custom scene we implemented in our vue project

> See：[https://github.com/xinxin93/logicflow_vue_demo](https://github.com/xinxin93/logicflow_vue_demo)

![https://dpubstatic.udache.com/static/dpubimg/e35cef10-bb7c-4662-a494-f5aac024c092.gif](https://dpubstatic.udache.com/static/dpubimg/e35cef10-bb7c-4662-a494-f5aac024c092.gif)

## Future plans for LogicFlow

The LogicFlow project has been open source for 1 year, and there are still many things to do in the future. We will continue to iterate and maintain LogicFlow in 2022. In the near future, we will focus on BPMN, production, and engine development:

- Our current built-in bpmn elements only support the basic capabilities in bpmn 2.0, and we will continue to add sub-processes, boundary events, intermediate events, and other features in the future.
- For productization, we intend to incubate an out-of-the-box flowchart diagramming tool based on LogicFlow's capabilities.  This is also the above graphing tool example.
- In terms of enginization, we will provide a JS version of the process execution engine, so that the front-end has the "edit process => process data => execute process" the whole technology stack. Not only improve our technology ecosystem, but also hope to empower the front-end team with closed-loop business implementation needs.

## Last

LogicFlow is a relatively new framework, please be patient and welcome to join us to help us find problems and build together. For the implementation details of LogicFlow itself, the discussion of similar business, the use of LogicFlow problems are also welcome to join the group to exchange.

-   LogicFlow official website： [http://logic-flow.org](http://logic-flow.org)
-   github：[https://github.com/didi/LogicFlow](https://github.com/didi/LogicFlow)
-   Wechat user group： logic-flow