<script lang="ts" setup>
import { VkLogicFlow, __VkLogicFlow } from '@/components/LogicFlow'
import LoopNode from '@/components/LoopNode/index.vue'
import { nextTick } from 'vue'

const onLoad: __VkLogicFlow.OnLoad = ({ lf }) => {
  nextTick(() => {
    lf.render({
      nodes: [
        {
          id: 'start-node-1',
          type: 'rect',
          x: 50,
          y: 50,
          properties: {
            name: 'Start Node'
          }
        },

        {
          id: 'loop-node-1',
          type: 'loop-node',
          x: 250,
          y: 550,
          properties: {
            width: 500,
            height: 300
          }
        }
      ],
      edges: []
    })
  })
}
</script>
<template>
  <VkLogicFlow @load="onLoad">
    <LoopNode></LoopNode>
  </VkLogicFlow>
</template>
