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
