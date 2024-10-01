---
nav: 指南
group:
  title: 进阶
  order: 2
title: Vue 自定义节点
order: 7
toc: content
tag: 新特性
---

:::info{title=我们带来了新特性，本节内容主要介绍}
- 如何使用 Vue 组件来注册节点内容
- properties 更新后如何同步更新节点内容
  :::

## 渲染 Vue 组件为节点内容
同 React 一样我们提供了一个独立的包 `@logicflow/vue-node-registry` 来使用 Vue 组件渲染节点。

### Vue3
在 Vue3 中使用示例如下：

```html
<template>
  <div ref="containerRef" id="graph" class="viewport"></div>
  <TeleportContainer :flow-id="flowId"/>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { forEach, map, has } from 'lodash-es'
  import LogicFlow, { ElementState, LogicFlowUtil } from '@logicflow/core'
  import { register, getTeleport } from '@logicflow/vue-node-registry'
  import '@logicflow/core/es/index.css'

  import ProgressNode from '@/components/LFElements/ProgressNode.vue'

  const lfRef = ref<LogicFlow | null>(null)
  const containerRef = ref<HTMLDivElement | null>(null)
  const TeleportContainer = getTeleport()
  const flowId = ref('')

  onMounted(() => {
    if (containerRef.value) {
      const lf = new LogicFlow({
        container: containerRef.value,
        grid: true,
      })

      // 注册自定义 vue 节点
      register({
        type: 'custom-vue-node',
        component: ProgressNode
      }, lf)

      lf.on('graph:rendered', ({ graphModel }) => {
        flowId.value = graphModel.flowId!
      })

      // 注册事件
      lf.render({})

      const node1 = lf.addNode({
        id: 'vue-node-1',
        type: 'custom-vue-node',
        x: 80,
        y: 80,
        properties: {
          progress: 60,
          width: 80,
          height: 80
        }
      })
      console.log('node1 --->>>', node1)

      const node2 = lf.addNode({
        id: 'vue-node-2',
        type: 'custom-vue-node',
        x: 360,
        y: 80,
        properties: {
          progress: 60,
          width: 80,
          height: 80
        }
      })

      setInterval(() => {
        const { properties } = node2.getData()
        console.log('properties.progress --->>>', properties?.progress)
        if (has(properties, 'progress')) {
          const progress = properties?.progress
          node2.setProperty('progress', (progress + 10) % 100)
        }
      }, 2000)
    }
  })
</script>

```

节点组件内容如下：
```html
<template>
  <el-progress type="dashboard" :percentage="percentage" :width="80">
    <template #default="{ percentage }">
      <span class="percentage-value">{{ percentage }}%</span>
    </template>
  </el-progress>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventType } from '@logicflow/core'
import { vueNodesMap } from '@logicflow/vue-node-registry'

export default defineComponent({
  name: 'ProgressNode',
  inject: ['getNode', 'getGraph'],
  data() {
    return {
      percentage: 80
    }
  },
  mounted() {
    const node = (this as any).getNode()
    const graph = (this as any).getGraph()
    graph.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData: any) => {
      const keys = eventData.keys as string[]
      const content = vueNodesMap[node.type]
      if (content && eventData.id === node.id) {
        const { effect } = content

        // 如果没有定义 effect，则默认更新；如果定义了 effect，则只有在 effect 中的属性发生变化时才更新
        if (!effect || keys.some((key) => effect.includes(key))) {
          console.log('eventData --->>>', eventData)
          this.percentage = eventData.properties?.progress || 0
        }
      }
    })
  }
})
</script>

```

下面插入一张动图展示效果。如果想体验具体功能可以通过启动：examples/vue3-app 项目查看。
<img src="/vue3-app.gif">

## 更新节点
跟 `HTMLNode` 一样，当用户通过 `setProperties` 或 `setProperty` 等更新节点 properties 时，
我们需要在组件内部监听 `node:property-change` 事件，根据 properties 值更新组件状态。如上面 Demo 所示。

## Vue2 使用
上面我们使用到了 teleport，它是 Vue3 中的特性，如果在 Vue2 中，如何使用呢？

```html
<template>
  <div id="app">
    <div ref="containerRef" id="graph"></div>
  </div>
</template>

<script>
  import LogicFlow from '@logicflow/core'
  import { register } from '@logicflow/vue-node-registry'

  import ProgressNode from '@/components/ProgressNode'
  import '@logicflow/core/dist/index.css'

  export default {
    name: 'App',
    data() {
      return {
        lf: null,
      }
    },
    mounted() {
      this.lf = new LogicFlow({
        container: this.$refs.containerRef,
        grid: true,
      })
      register(
        {
          type: 'progress',
          component: ProgressNode,
        },
        this.lf,
      )

      this.lf.render({})

      const node1 = this.lf.addNode({
        id: 'vue-node-1',
        type: 'progress',
        x: 80,
        y: 80,
        properties: {
          progress: 60,
          width: 80,
          height: 80,
        },
      })
      console.log('node1 --->>>', node1)
    },
  }
</script>

<style>
  #graph {
    height: 100vh;
  }
</style>
```

节点组件内容如下：
```html
<template>
  <div>vue2 node</div>
</template>

<script>
export default {
  name: 'ProgressNode',
  inject: ['getNode', 'getGraph'],
  data() {
    return {
      percentage: 80,
    }
  },
}
</script>

```

:::warning{title=注意}
目前在 Vue2 中，节点组件内容有一些限制，比如无法使用 Vuex、i18n、element-ui 等。如果需要使用这些功能，可以尝试
使用 vue2-teleport 来增强能力，欢迎给我们提 PR（我们后面也会逐步增强该功能）。
:::

