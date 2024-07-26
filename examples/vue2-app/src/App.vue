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

    this.lf.render({
      nodes: [
        {
          id: 'node_1',
          type: 'rect',
          x: 100,
          y: 100,
          properties: { label: 'rect' },
        },
        {
          id: 'node_2',
          type: 'rect',
          x: 300,
          y: 200,
          properties: { label: 'rect' },
        },
      ],
    })

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
