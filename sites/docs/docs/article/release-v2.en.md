---
title: LogicFlow 2.0 is Released 🎉🎉🎉
order: 0
toc: content
---

## Introduction

LogicFlow is an open source flowchart editing framework for DDT customer service technical team,
which provides a series of flowchart interaction, editing the necessary functions and flexible node
customization, plug-ins and other expansion mechanisms. Since its release , LogicFlow influence
continues to grow , has become the head of the domestic open source flowchart editing framework ,
GitHub star number has exceeded 7.4k , npm downloads totaled more than 900k. In addition to our
internal team's use , but also attracted such as Meituan, Jingdong, Huawei and other enterprises in
the project of the technical team to apply LogicFlow .

During the smooth operation of open source, we gradually found some shortcomings of LogicFlow:

- **Extra development workload exists in simple customization scenarios**: LogicFlow has built-in
  some basic graphic classes, users can inherit the basic classes to do graphic customization in
  conjunction with their requirements, but in some simple customization scenarios such as
  customizing the width and height, style, you still need to write inheritance logic, which
  increases the cost of use; if you want to customize a graphic based on a front-end framework (
  React or Vue), you also need to If you want to customize a graph based on a front-end framework (
  React or Vue), you also need to mount the component to a node through a specific method.
- **Official documentation is not perfect, and the cost for users to get started is high**: the
  existing version of the README and the official documentation is poorly guided, and the cost of
  understanding is high for novices who are new to it; there is a lack of detailed descriptions of
  parameters, attributes, and APIs in the documentation, and you need to query the source code if
  you want to know how to use the functions and how to configure them.
- **Complicated project catalog and lack of guidance, poor development experience for contributors
  **: LogicFlow provides 3 function packages to the outside world, which are managed as monorepo in
  the project. In the existing version of the source code project, you need to enter the
  corresponding directory in order to debug, and the project debugging guide is not indicated in the
  README, so you need to find it by yourself.

After half a year of hard work, version 2.0 is finally coming to us. Let's take a look at what's new
in LogicFlow 2.0!

## What has changed with 2.0

### A quick look at the changes

- Product functionality enhancements:
  - Initialized configuration support for some node and edge attributes
  - Targeted enhancements to a range of plug-ins
  - A series of known issues were fixed;
- New capabilities:
  - New Label plugin with rich text support for node content.
  - New extension package, support for fast registration of custom nodes based on React/Vue
    components.
- Official website portal optimization:
  - The overall structure of the home page is adjusted: support for online debugging canvas on the
    home page, enriching the content of the home page display.
  - Documentation optimization: improve the content of the document, increase the anchor navigation
    within the document, and unify the interaction of the document page.
- Source code development experience enhancement:
  - Reconstruct project structure, upgrade packaging tools, optimize the development process.

### Enhanced core competencies

LogicFLow 2.0 has been significantly improved in terms of functionality and stability, providing
users and developers with more powerful tools and capabilities. We expect that these improvements
will lead to a smoother user experience and continue to promote the widespread use of LogicFLow in a
variety of application scenarios. major feature change points:

- **Custom shapes and styles built-in**: when using base nodes and edges, custom shape and style
  properties do not need to be re-customized through inheritance, they are configured through
  properties attributes of nodes and edges, same capabilities, faster implementation.

<div>
  <img alt="Custom shapes and styles built-in" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/propertiesDemo.gif" />
</div>

[//]: # (![Custom shapes and styles built-in]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/propertiesDemo.gif&#41;)
<p align=center>Optimized results</p>

- **Node Resize capability is built-in:** The resize capability can be enabled directly by setting
  allowResize globally, or by configuring the resizable attribute for node/edge data, eliminating
  the need to introduce the NodeResize plugin.

<div>
  <img alt="Custom shapes and styles built-in" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/resize&rotateDemo.gif" />
</div>

[//]: # (![Node Resize capability built-in]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/resize&rotateDemo.gif&#41;)
<p align=center>Optimized results</p>

- **Grid and Canvas Optimization**: Optimized the internal logic of the grid, increased the adaptive
  width of the canvas, and improved the stability of canvas movement and scrolling.
- **Event and Status Optimization**: Fixed the problems of touchpad click events not taking effect,
  shortcut keys and drag-and-drop status not updating in silent mode, which ensures the stability of
  event triggering and the timeliness of status updating.
- **Anchor Enhancement**: Fixed several issues related to anchors, including the limitation of the
  number of connected edges, the linkback issue of custom node anchors, and added a default error
  message.
- **Polyline and clone node fixes**: fixes the polyline fold line fallback issue when dragging,
  fixes the wrong text position issue after cloneNode method copies a node.

### **Extension plug-in optimization**

In version 2.0, we have improved the capabilities and performance of several plugins, and brought in
the Label and DynamicGroup plugins to further enrich the LogicFlow plugin ecosystem.

- **Small map plug-in optimization**

Since the mini-map plugin has some functional defects and poor performance in the actual use, we
have reconstructed the implementation logic of the mini-map plugin to improve the smoothness of the
interaction and reliability of the preview window, and also improve the update strategy of the
mini-map in order to reduce the performance consumption of the canvas when moving.
<div style="display: flex; justify-content: space-between">
  <img alt="MiniMap version 1.x" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/minimapOldDemo.gif" />
  <img alt="MiniMap version 2.0" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/mini-map.gif" />
</div>

[//]: # (![MiniMap version 1.x]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/minimapOldDemo.gif&#41;! [MiniMap version 2.0]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/mini-map.gif&#41;)
Comparison of old and new capabilities (left: old right: new)

- **Canvas export plug-in optimized**

Although canvas export is provided in version 1.0, the single function is not enough to satisfy
users' demands. Therefore, we have enhanced the export function to support more parameter
configurations, and fixed the problems that online images could not be exported, and the exported
images were incomplete after partial rendering was enabled.

<div style="display: flex; justify-content: space-between">
  <img alt="Snapshot version 1.x" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshotOldDemo.gif" />
  <img alt="Snapshot version 2.0" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshot.gif" />
</div>

[//]: # (![Snapshot version 1.x]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshotOldDemo.gif&#41;! [Snapshot version 2.0]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/snapshot.gif&#41;)

Comparison of old and new capabilities (left: old right: new)

- **Box checking plug-in optimization**

In version 1.0, the box select plugin was simple to implement and had the problem of blocking page
scrolling. In version 2.0, we adjusted the logic of the box select plugin, fixed the problem and
enriched the configurability of the plugin to support user-configurable box selections in terms of
the scope of the judgment and the enabled state.

<div style="display: flex; justify-content: space-between">
  <img alt="SelectionSelect version 1.x" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selectionSelectOldDemo.gif" />
  <img alt="SelectionSelect version 2.0" style="border-radius: 5px; text-align: center; width: 49%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selection-select.gif" />
</div>

[//]: # (![SelectionSelect version 1.x]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selectionSelectOldDemo.gif&#41;! [SelectionSelect version 2.0]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/selection-select.gif&#41;)

Comparison of old and new capabilities (left: old right: new)

- **New DynamicGroup plugin**

The 1.0 version of the Group plugin has defects in API naming and implementation scheme, and more
issues are related to it. Since Group is a plugin with many usage scenarios, we have launched a new
DynamicGroup plugin based on the built-in Resize function of nodes, welcome to use it, and hope it
can bring a better experience.

<div>
  <img alt="DynamicGroup plugin" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/dynamic-group.gif" />
</div>

[//]: # (![DynamicGroup plugin]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/dynamic-group.gif&#41;)

- **New Multi-Text Plug-in**

LogicFlow has built-in text display and text editing capabilities, but the built-in text is not rich
enough in terms of configurability, and the style is limited by the characteristics of SVG text
nodes and foreignObject nodes, and the experience of configuring the text overflow mode is also
poor.

Therefore, we have introduced the Label plugin, which is designed to enhance the presentation of
text on nodes and edges.The Label plugin has the following main features:

1. provides global and node dimension configuration items, the user can flexibly customize;
2. built-in rich text editing capabilities, edit the text can be selected to add rich text style. 3.
   multiple text can be set per node or edge to enhance the display capabilities;
3. each node or edge can be set multiple text to enhance the display ability.

<div>
  <img alt="Label plugin" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/label.gif" />
</div>

[//]: # (![Label plugin]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/label.gif&#41;)

### New Custom Node Expansion Package

LogicFlow provides the ability to customize HTML nodes by inheriting from HTMLNode, but user
feedback suggests that this approach is not intuitive and may result in memory leaks due to poorly
timed destruction.

Through research and comparison with other flowcharting products in the industry, we have found that
enhancing this capability is very helpful in improving the user development experience.

We therefore provide two separate
packages `@logiclfow/react-node-registry`, `@logiclfow/vue-node-registry` for a more intuitive and
faster way to customize HTML nodes - i.e., using the React or Vue components to register nodes. It
is possible to either directly reuse the rich library of components already introduced in the host
system or customize the node content based on the React and Vue development approach.

### Build a better official portal

**Theme update to enhance user experience**

In order to make it easier for you to understand LogicFlow's capabilities, we have transformed the
home page Banner into a demo canvas where you can freely configure the node contents and experience
LogicFlow's capabilities.

<div>
  <img alt="Homepage Banner" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/homepageBanner.gif" />
</div>

[//]: # (![Homepage Banner]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/gif/homepageBanner.gif&#41;)

Added the Partner Showcase module (we welcome interested companies using LogicFlow to contact us).

<div>
  <img alt="Company List" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/comanylist.png" />
</div>

[//]: # (![Company List]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/comanylist.png&#41;)

**Harmonization of the presentation of document content pages**

Increase the percentage of document area to improve the utilization of page space. The document
catalog and in-document anchor routing are split and displayed on both sides of the document
content, making it easier for users to find the modules they need more quickly.

<div>
  <img alt="Unify website layout structure" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/website-layout.png" />
</div>

[//]: # (![Unified site layout structure]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/website-layout.png&#41;)

**Quick-start content adjustments**

We've reorganized the Getting Started section. We've made the demos easier to follow and understand
for different usage scenarios, so you can copy them locally and easily create your first LogicFlow
app.

<div>
  <img alt="Getting Started Quickly" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/getting-started.png" />
</div>

[//]: # (![Quick Start]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/getting-started.png&#41;)

**Example methodological content supplemented and categorized**

In the API module we have categorized the methods by module and added known missing content to make
it easier for you to retrieve what you need more efficiently.

<div>
  <img alt="instance method" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/instance-method.png" />
</div>

[//]: # (![Example method]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/instance-method.png&#41;)

**Fine base examples and support for online debugging**

In order to help you quickly learn to understand LogicFlow, we have added a series of basic examples
and support online debugging capabilities, you can combine their own practical requirements to
choose the examples of rapid debugging.

<div>
  <img alt="Example list" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-list.png" />
  <img alt="Example details" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-detail.png" />
</div>

[//]: # (![list of examples]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-list.png&#41;! [Example details]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/demo-detail.png&#41;)

### **Better development experience***

Due to our project structure, documentation and many other reasons, it is difficult for developers
to participate in the community contribution, we have improved and standardized the project
structure in version 2.0, and enriched the contributor guidance document, aiming to reduce the
difficulty for contributors to get started. We welcome everyone to actively participate in
contributing, and work together to create the "best flowchart framework".

## Who's using ##

XIAOJUSURVEY is the open source enterprise questionnaire system of DDT, which has received wide
attention from the community since it was open sourced. XIAOJUSURVEY chooses LogicFlow as the core
technology stack for skip logic orchestration, which simplifies the complex logic rule orchestration
and response mechanism, and enables users to configure and manage the skip logic in a more intuitive
way.

<div>
  <img alt="XIAOJUSURVEY" style="border-radius: 5px; text-align: center; width: 100%" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/xiaoju-survey.png" />
</div>

[//]: # (![XIAOJUSURVEY]&#40;https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/xiaoju-survey.png&#41;)

For immediate use look up: [XIAOJUSURVEY-Question Jump Logic](https://github.com/didi/xiaoju-survey)

## Future planning

### Functional planning

- **Continuously optimize core functions:**
  - Starting from user needs, continuously optimize the poor experience during the use of existing
    functions, such as mobile adaptation
  - Enrich canvas layout capabilities, including line layout algorithms and automatic layout
    beautification.
- **Enrich the ecosystem:** Develop more plug-ins, extension packs and official examples to enrich
  the ecosystem of LogicFLow and support users to better realize customization and integration
  needs.

### Operational planning

- **Output Articles and Courses:** Regularly publish articles on LogicFlow's practical experience;
  publish courses on graph editing technology to help people gain a deeper understanding of graph
  editing technology.
- **Establish an incentive system:** Establish a community of core contributors and set up a
  contribution incentive mechanism to encourage more users to participate in development and
  contribution.
- **Organize technical solution activities:** Open up technical solution discussion channels to
  allow community members to participate in decision-making and solution optimization.
- **Code Review (CR):** Set up a code review process to ensure the quality of contributed code and
  promote close cooperation between the team and the community.

## Acknowledgements

First of all, I would like to thank all the developers and LogicFlow users who have contributed to
the LogicFlow project. LogicFlow continues to grow and improve because of your contributions.

At the same time, thanks to projects such as X6 and ReactFlow, we can better understand our own
shortcomings through comparison, and target optimization and enhancement.

Finally, special thanks to all the contributors involved in the development of this release!

[javaskip](https://github.com/javaskip), [boyongjiong](https://github.com/boyongjiong), [DymoneLewis](https://github.com/DymoneLewis ), [ChangeSuger](https://github.com/ChangeSuger), [FanSun521](https://github.com/FanSun521), [CWsuper](https://github.com/CWsuper), [ yiidot](https://github.com/yiidot), [iamlqw](https://github.com/iamlqw)

## Conclusion

As LogicFlow evolves, we understand the importance of the developer experience. We are committed to
making it easy for every developer to get started and solve problems quickly. Through continuous
optimization, we hope that LogicFlow will become the tool of choice for developers in the flowchart
editing field, and we will keep moving forward to achieve this.

## Contact us

We welcome your active participation, and you are welcome to contact us and communicate with us, and
it would be great to have a Star!

- LogicFlow official website: <https://site.logic-flow.cn/>
- github repository address: <https://github.com/didi/LogicFlow>
- Groups
  - WeChat: Please add "LogicFlow official number".
      <div>
        <img alt="LogicFlow WeChat official number" style="border-radius: 18px; margin-left: 20px" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/wechat.png" width="300" />
      </div>
  - QQ Group:
      <div>
        <img alt="LogicFlow QQ group" style="border-radius: 18px; margin-left: 20px" src="https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/articles/2.0/qq.png" width="300" />
      </div>
  - Email: <logicflow_official@163.com>
