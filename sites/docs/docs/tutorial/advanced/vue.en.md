---
nav: Guide
group:
  title: Intermediate
  order: 2
title: Vue Node Registry
order:  7
toc: content
tag: New
---

:::info{title=New-Features-Introduction}
* How to use Vue components to register node content
* How to synchronize node content updates when properties change
  :::

## Rendering Vue Components as Node Content

Similar to React, we provide a separate package `@logicflow/vue-node-registry` for rendering nodes with Vue components.

### Vue 3

Here's an example of how to use Vue 3:

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

Node component content is as follows:

```html
<template>
    <el-progress type="dashboard" :percentage="percentage" :width="80">
        <template #default="{ percentage }">
            <span class="percentage-value">{{ percentage }}%</span>
        </template>
    </el-progress>
</template>

<script lang="ts">
    import {
        defineComponent
    } from 'vue'
    import {
        EventType
    } from '@logicflow/core'
    import {
        vueNodesMap
    } from '@logicflow/vue-node-registry'

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
                    const {
                        effect
                    } = content

                    // If effect is not defined, default to updating; if effect is defined, only update when properties in effect change
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

Below is an animated image showing the effect. To experience the functionality, you can start the `examples/vue3-app` project.
<img src="/vue3-app.gif">

## Updating Nodes

Similar to `HTMLNode` , when users update node properties using `setProperties` or `setProperty` , we need to listen to the `node:property-change` event inside the component and update the component's state based on the properties value, as demonstrated in the example above.

## Using Vue 2

In the example above, we used teleport, a feature of Vue 3. How can this be done in Vue 2?

```html
<template>
    <div id="app">
        <div ref="containerRef" id="graph"></div>
    </div>
</template>

<script>
    import LogicFlow from '@logicflow/core'
    import {
        register
    } from '@logicflow/vue-node-registry'

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
            register({
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

Node component content is as follows:

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

:::warning{title=Note}
Currently, there are some limitations with node component content in Vue 2, such as the inability to use Vuex, i18n, element-ui, etc. If you need these features, you can try using `vue2-teleport` to enhance the capabilities, and we welcome PRs (we will also gradually enhance this functionality in the future).
:::
