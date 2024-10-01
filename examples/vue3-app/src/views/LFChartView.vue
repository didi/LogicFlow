<template>
  <div class="w-full h-full">
    <div ref="container" class="flow w-full h-full overflow-hidden" />
    <TeleportContainer :flow-id="flowId" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { getTeleport } from '@logicflow/vue-node-registry'
import '@logicflow/core/lib/style/index.css'
import LinkChart from '@/components/chart/linkChart'
import type { IGraphData } from '@/components/chart/types.d'

interface IProps {
  activeKey: string
}
const props = defineProps<IProps>()

const TeleportContainer = getTeleport()
const container = ref()
const graphData = ref<IGraphData>()

const flowId = ref('')

let linkChart: LinkChart

onMounted(() => {
  graphData.value = {
    nodes: [
      {
        id: 'node_id_1',
        type: 'analysisNode',
        x: 0,
        y: 0,
        properties: {
          type: 'first',
          url: 'http://118037.com/32.html',
          category: '分类123' + props.activeKey
        }
      },
      {
        id: 'node_id_2',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'first',
          url: 'http://www.test.com'
        }
      },
      {
        id: 'node_id_3',
        type: 'analysisNode',
        x: 0,
        y: 0,
        properties: {
          type: 'first',
          url: 'http://www.emei.vip/aaa.html',
          category: '分类123'
        }
      },
      {
        id: 'node_id_4',
        type: 'analysisNode',
        x: 0,
        y: 0,
        properties: {
          type: 'first',
          url: 'http://365897.com/aaa.html',
          category: '分类123'
        }
      },
      {
        id: 'node_id_5',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'middle',
          url: 'https://118037.com/1.html'
        }
      },
      {
        id: 'node_id_6',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'middle',
          url: 'https://www.emei.vip'
        }
      },
      {
        id: 'node_id_7',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'middle',
          url: 'https://bbbb.com'
        }
      },
      {
        id: 'node_id_8',
        type: 'analysisNode',
        x: 0,
        y: 0,
        properties: {
          type: 'middle',
          url: 'http://www.emei.vip/a.html',
          category: '分类123'
        }
      },
      {
        id: 'node_id_9',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'middle',
          url: 'https://aaaa.com',
          seq: 1
        }
      },
      {
        id: 'node_id_10',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'landing',
          url: 'https://bbbb.com'
        }
      },
      {
        id: 'node_id_11',
        type: 'defaultNode',
        x: 0,
        y: 0,
        properties: {
          type: 'landing',
          url: 'https://cccc.com'
        }
      }
    ],
    edges: [
      {
        id: 'edge_id_1',
        type: 'polyline',
        sourceNodeId: 'node_id_1',
        targetNodeId: 'node_id_5'
      },
      {
        id: 'edge_id_2',
        type: 'polyline',
        sourceNodeId: 'node_id_5',
        targetNodeId: 'node_id_6'
      },
      {
        id: 'edge_id_3',
        type: 'polyline',
        sourceNodeId: 'node_id_6',
        targetNodeId: 'node_id_7'
      },
      {
        id: 'edge_id_4',
        type: 'polyline',
        sourceNodeId: 'node_id_7',
        targetNodeId: 'node_id_10'
      },
      {
        id: 'edge_id_5',
        type: 'polyline',
        sourceNodeId: 'node_id_2',
        targetNodeId: 'node_id_8'
      },
      {
        id: 'edge_id_6',
        type: 'polyline',
        sourceNodeId: 'node_id_8',
        targetNodeId: 'node_id_7'
      },
      {
        id: 'edge_id_7',
        type: 'polyline',
        sourceNodeId: 'node_id_3',
        targetNodeId: 'node_id_9'
      },
      {
        id: 'edge_id_8',
        type: 'polyline',
        sourceNodeId: 'node_id_9',
        targetNodeId: 'node_id_11'
      },
      {
        id: 'edge_id_9',
        type: 'polyline',
        sourceNodeId: 'node_id_4',
        targetNodeId: 'node_id_9'
      },
      {
        id: 'edge_id_10',
        type: 'polyline',
        sourceNodeId: 'node_id_5',
        targetNodeId: 'node_id_9'
      }
    ]
  }
  linkChart = LinkChart.create({
    container: container.value,
    graphData: graphData.value
  })
  flowId.value = linkChart.flowId!
})

onUnmounted(() => {
  // 非KeepAlive模式下应该主动触发destroy()方法触发LogicFlow.clearData()
  linkChart && linkChart.destroy()
})
</script>

<style scoped lang="scss">
.flow {
  :deep(.lf-node) {
    cursor: move;
  }
  :deep(.custom-vue-node-content) {
    width: 100%;
    height: 100%;
  }
}
</style>
