---
title: Zero Code New Ideas
order: 5
toc: content
---

Zero code new idea, page logic arrangement based on LogicFlow

## Introduction
In DiDi's customer service business, we already have rich experience to configure the page by zero-code, which greatly improves the efficiency ad quality of service users. However, the traditional zero-code solution does not perform well in page logic configuration, and it is difficult to achieve flexible expansion. Therefore, our team explored a new way of thinking, using the flowchart way to organize the logic of the page, to solve the problem of difficult to extend the zero-code.
 
In this article, we'll start from the difficult configuration dilemma of complex interactions, introduce the solution ideas and solutions, and expand in detail how to utilize [LogicFlow \(a flowchart edit framework that has been open-sourced by the Customer Service Technology Team\)](https://github.com/didi/LogicFlow), to realize the Organizer, Executor and Debugger corresponding to the three phases of Development, Operation and Debugging in the R&D process.

## Background
Customer service business is a bridge linking users and the company's business divisions, in order to quickly respond to the business iteration of the business divisions, and continue to improve the service experience to the user, the technical team needs to build multiple systems in the customer service business to be configurable by the operations staff in order to guarantee a high level of efficiency for the entire customer service team.
 
Then, to reach the expectation that non-R&D personnel can configure the page, the drag-and-drop interaction of the zero-code platform is very suitable. Through WYSIWYG (What You See Is What You Get) design, numerous scenarios for customer service have been facilitated. Several systems now enable operations teams to alter logic online via configuration releases, providing users with intelligent customer service or allowing human customer service follow a process developed by operations staff to resolve and document user issues.

So far, multiple systems within DiDi Customer Service have produced more than 12,900 PC pages and 7,900 H5 pages through configuration in 4 years, throughout the entire service chain, in a verity of way, to solve the user's problems.

## Dilemma: zero-code deficiencies
Although the system within DiDi Customer Service is currently configured with a lot of pages utilizing zero-code, as the business grew, we felt the lack of zero-code. For example, there is a table modification operation requirements, when clicking the Edit button of the operation column, we need to request the server-side interface to get the user's permission information, and then according to the returned permission, display different editing pop-up dialog. As shown in the figure below:
 ![Suda List Page Demo](https://github.com/didi/LogicFlow/assets/56008486/c6b5e702-30d5-493e-9e6b-d4ee30c913de)

Facing this situation, if we use the currently prevalent zero-code solutions, we need to add request and popup dialog related logic in the properties panel of the table component. This iterative way of adding functionality in the component properties panel will only lead to bloated configuration content, increased configuration difficulty, higher development costs, and in the end, it is not as convenient as writing code.
 
As the zero-code configuration page is widely used within the Customer Service, the Customer Service Technical Team also expects to find a better way to solve the zero-code can not flexibly control the page logic and complex interactions of the problem, so that colleagues who do not know how to program can also make complex interactions of the page.

## Idea：Logical Organization of Pages
For the table editing requirements mentioned before, if we write JS Code to realize it, it is generally 「listen to events -> collecting data -> initiating a request -> parsing the returned results -> modifying the content of the page component」. So can we abstract the process of writing code into a simple logic, and then use the flowcharts to achieve the same effect?

Using this idea, we can split the previous requirements into "table trigger edit event", "request permission info", "show ordinary administrator edit pop-up dialog", "show senior administrator pop-up dialog" this 4 simple logic, and then drawn in the flow chart, the following diagram is shown below:
![2](https://github.com/didi/LogicFlow/assets/56008486/9bcf79ee-13aa-46d5-8868-ac31cb1b50ef)
> The image above is a screenshot of our internal zero-code system configuring of a basic table form. The left side of this, like most zero-code platforms, is the area where the page is configured via drag and drop. And on the right side is the configuration of complex logic within the page by editing the flowchart.

By using the flow to organize the page logic in this way, we can realize the flexible configuration of the page logic by freely combining the nodes. For example, when the server-side interface returns slowly, it is convenient to add a loading node before the request node.
![3](https://github.com/didi/LogicFlow/assets/56008486/fae3deb6-1fc4-44c3-bf9f-88e0587197fe)

It can also be combined to realize the component show and hide, for example, when the radio box A selects a1, show component B, hide component C; when the radio box A selects a2, show component C, hide component B. It can be split into five nodes as shown below. Finally, add the conditions "**radio-box A selects a1**" and **"radio-box A selects a2**" on the connecting line.
![4](https://github.com/didi/LogicFlow/assets/56008486/806499c8-d178-45ff-991b-df12a78948c4)

As you can see from the above introduction, the problem of difficult scaling in zero-code can ben better solved by **abstracting the changes of each component in complex interactions into a unit logic,** and then reflecting it with node choreography in the flowchart. Next we will introduce you to the core capabilities of page logic orchestration and demonstrate how to develop, run and debug page logic orchestration.

## Solution: Three Core Abilities of Page Logic Organization
In order to make process orchestration an alternative to writing code, we implemented organizer, executor and debugger corresponding to the development process for development, runtime execution and debugging.
![aa](https://github.com/didi/LogicFlow/assets/56008486/e5eb3135-3082-4a7a-be93-86f9c8d3d82a)

Since the whole process is realized around the flowchart, there will be many special requirements for the functionality of the flowchart. Since our team has a lot of precipitation in flowchart editing, and open source flowchart editing framework LogicFlow, with LogicFlow's powerful customization capabilities, we can quickly achieve a variety of core capabilities in the page logic arrangement.

The overall architecture of LogicFlow is as follows, the core package @logicflow/core provides the basic capabilities of the flowchart editor, and @logicflow/extension on the right is plugins developed based on the extended capabilities of @logicflow/core.
![logicflow-en](https://github.com/didi/LogicFlow/assets/8553969/a0343f0a-6095-4c13-be3a-9289f8df7fb5)

### Organizer
In the traditional development mode, the product of development is JS code, but now the process orchestration is used as the visualization development, the product of development becomes JSON data describing the flowchart. Since the flowchart is mainly composed of nodes and edges, the orchestrator also customizes the nodes and edges to achieve the page logic orchestration function.

### Custom Nodes
On the flowchart of the orchestrator, it supports the configuration of many types of node, including event nodes, data nodes, behavior nodes, page jump nodes, and so on. Each node represents a most basic page logic unit, for example:
* Event nodes can be thought of as JS event listeners.
* Data Nodes can be viewed as Ajax requests.
* Behavior nodes can be viewed as modifying page components properties.
* The page jump node can be seen as a browser jump to a new page.
  ![5](https://github.com/didi/LogicFlow/assets/56008486/02feeb90-3b03-4902-b9ac-4c01c1b5fb39)

LogicFlow's custom HTML nodes can be used to achieve the desired style for different functional nodes. For example, in the orchestrator, widgets such as highlight synchronization, hover buttons, hover tips, and so on, which provide a silky-smooth "development" experience, can be perfectly supported by LogicFlow's custom HTML node capabilities.
![6](https://github.com/didi/LogicFlow/assets/56008486/08aba71b-0b8c-432f-bab0-1e9f2942fbd6)

When customizing the HTML node, you can override the setHtml method of the HTML node to customize the html content by mounting a Vue or React component. The code example is as follows:
![7](https://github.com/didi/LogicFlow/assets/56008486/67411001-d8df-4999-bd9d-1cf57b91ec5c)

The specific content of the node is written in Vue, the writing method is also unchanged, you can also directly use the UI component library, sample code is as follows:
![8](https://github.com/didi/LogicFlow/assets/56008486/355a5926-5f56-45f2-b785-29628dee13fc)

### Custom Edges
In the orchestrator, edges control the execution order of nodes, and by default, an edge indicates that the execution of the pervious node is completed and continues to the next node. You can interrupt the execution of a process by configuring conditions on the edge, which is similar to the logic judgement function in JS code.
![9](https://github.com/didi/LogicFlow/assets/56008486/691c1511-20c6-4648-9a53-f36167fbc7c8)

**How to implement the display of small condition icons on the edge?**
Using LogicFlow to implement edge in the orchestrator is a bit more complicated, as the edge does not need to display text, but an icon with popover instead. So we need to use LogicFlow's custom edge mechanism to override the default text logic and replace the text with an icon.
![10](https://github.com/didi/LogicFlow/assets/56008486/853e03e7-c70e-4ee1-95b9-1240f6bd2182)

By default, LogicFlow's text is SVG element, so when we need to provide more HTML content on top of it, we can **use LogicFlow's customization mechanism based on inheritance overriding to reimplement the text**. The above code example overrides the getText function and inserts a **foreignObject** into the SVG to nest the HTML content inside the SVG.

### Executor
The page logical orchestration is based on the configuration of the flowchart to achieve, to let the flowchart run in accordance with the logic of the orchestration, the most common method is to use the flow engine. However, most of the process engines on the market run on the server side, such as Activity, Flowable, Turbo, etc., which are not suitable for logic execution in the browser environment. Therefore, we choose to implement a process engine **LogicFlow Engine** that can run in the JS environment and then implement an **Executor** based on this process engine. The design concept of LogicFlow Engine is shown in the following figure.
![logicflow-engine-en](https://github.com/didi/LogicFlow/assets/8553969/3229da62-ba58-4904-a8da-237327b7a636)


Then let's take a look at how the LogicFlow Engine capability supports actuator functionality.

### Capability I: Support for multiple types of nodes
The Executor has nodes such as event nodes, behavior nodes, request data nodes, data conversion nodes, page jump nodes, etc., each of which has a unique function.
![11](https://github.com/didi/LogicFlow/assets/56008486/cf0d9f94-09b3-41a9-be4e-ff92bb532867)

LogicFlow Engine currently only has built-in start node and task node, you can inherit these nodes to implement customized business logic. For example, to realize the executor requesting data node, rewrite the action method of the task node and realize the logic of requesting data in the method content.
![12](https://github.com/didi/LogicFlow/assets/56008486/ad52c47c-fb41-4c05-86b8-82c3e932c9b1)

### Capability II: Support for concurrent execution
When orchestrating logic, we often encounter scenarios where you have to do more than one thing at a time after an event. For example, when a button is clicked, a request is made to update the data, but also to update some text on the page. It is more "intuitive" for most people to use a branching configuration, and the executor needs to support this "concurrent" execution.
![14](https://github.com/didi/LogicFlow/assets/56008486/e3e75937-b667-4520-a048-2cc83312405d)

This feature requires LogicFlow Engine to be a parallel gateway by default, when one node is finished executing, it will execute all the following nodes in a non-blocking way, for example, the execution order of the above figure is: click on the search button -> request data and update the text -> update the data.

![15](https://github.com/didi/LogicFlow/assets/56008486/cc93a6f9-c5b1-458c-86af-c5e233214b4f)
The above code is the LogicFlow Engine's internal logic that supports parallel gateway by default. If you want to realize exclusive gateway, you can rewrite the getOutgoing method of the node.

### Capability III: Support for multiple start nodes
In most cases, a page will have multiple components that can bind events. So when logic is organized, there will also be multiple event nodes on a flowchart. In an executor the event node is the starting point for the process to begin execution, which requires LogicFlow Engine to **support the existence of multiple start nodes on a flowchart**.
![16](https://github.com/didi/LogicFlow/assets/56008486/7ac3ec7b-9d18-444c-b2aa-82d28fb8b198)

LogicFlow Engine not only supports multiple start nodes for a flow, but also supports specifying the start of execution from any node in the flow and re-execution from an already executed node. For example, in the executor, when a component of a page triggers an event, the executor will find the corresponding node of this component and start execution from this node.
![17](https://github.com/didi/LogicFlow/assets/56008486/7730d816-f99a-44ab-a17f-1cf15fd973ac)

### Capability IV: Repeatable processes
Inside the form, we will often encounter the need to select different contents and display different components. For example, when selecting a1 for checkbox A, set component B to Show and component C to hide. When selecting a2 for checkbox A, set component C to show and component B to hide.
![18](https://github.com/didi/LogicFlow/assets/56008486/a29892b1-c882-4786-a943-7d7e5aebb04d)

In order to satisfy the user's incessant switching of radio box options, the process engine needs to be able to perform iteratively.
![20](https://github.com/didi/LogicFlow/assets/56008486/f875522e-25ce-4058-ad15-caca32c1a851)

As shown in the following code, LogicFlow Engine supports the same process instance, called for multiple executions.
![21](https://github.com/didi/LogicFlow/assets/56008486/8f017777-a291-4cda-a190-3ce390b7990f)

### Debugger
The use of organizer and executor enables the visual orchestration and execution of page logic. However, even though visual "development" reduces the difficulty of "code", we will inevitably encounter errors. Therefore, we also provide a "debugging" function that allows us to run and check the page logic directly without modifying the code.
 
### Feature I: Operating Record
Each operation that triggers an event node generates a runtime record, and we display the runtime record in the form of a flowchart path to visualize the process nodes triggered by each operation. The following is the schematic diagram of the runtime record:
![22](https://github.com/didi/LogicFlow/assets/56008486/2c1f15f8-c57d-434a-917e-2355e05dae7a)

### Feature II: Element Details
We can view the runtime content of a node by clicking on the node that was executed in the runtime log, including element data, the cause of the error, and so on. The following element details are shown in the following figure:
![23](https://github.com/didi/LogicFlow/assets/56008486/18cabb00-bdcc-4318-bb27-c6ca923005fc)

### Feature III: Page Data
Global data in the current operating environment, which contains both dynamic data generated when the current page is running(e.g., data returned by API requests, component values, etc.) and data passed in when the page is initialized(data passed in by the host system, URL data, etc.). The page data can be used to help the configurator troubleshoot page errors.

## In Summary
Through the above way to realize the page logic organization and execution, to a large extend, to solve the problem that traditional zero-code technology is difficult to expand, and we can encapsulate a simpler organizer based on this architectural design to ensure scalability and reduce the maintenance costs of the system itself.

Of course, in the field of zero-code there are many other difficult problems need to be solved, such as **data sources, complex algorithms, data conversion, etc.**, in our internal zero-code platform have a lot of good practice, but also based on the actual use of the continual polishing and refinement, and strive to open source the entire zero-code platform at the right time, will not continue to be introduced here.

In addition, we have open-sourced LogicFlow Engine as a sub-package of LogicFlow. So you can try to use it to realize your own page logical organizer and executor. If you have any other questions, please send us your feedback via issue. LogicFlow Engine can be used in many different scenarios not just page logic execution.

⠀You are also welcome to send us issues and PRs through the official LogicFlow code repository. Of course, it would be great to have your star! The relevant website address is as follows:
* LogicFlow Github address: [LogicFlow Github](https://github.com/didi/LogicFlow)
* LogicFlow official website: [LogicFlow Docs](https://site.logic-flow.cn/)
