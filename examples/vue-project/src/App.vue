<script setup lang="ts">
import { ref, onMounted } from 'vue'
import icon2 from '@/assets/Element_Icon2.png'
import icon3 from '@/assets/Element_Icon3.png'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
const images = ref([
  {
    image: icon2,
  },
  {
    image: icon3,
  },
])
const graphData = {
  nodes: [
    // 节点数据属性：节点1
    {
      id: 'node_id_1',
      type: 'rect',
      x: 50,
      y: 50,
      text: { x: 100, y: 100, value: '节点1' }, // 节点文本
      properties: {
        width: 80,
        height: 80,
        style: {
          stroke: 'blue',
        },
        isPass: 'true', //例如：在审批流场景，我们定义某个节点，这个节点通过了，节点为绿色，不通过节点为红色。
      },
    },
    // 节点2
    {
      id: 'node_id_2',
      type: 'circle',
      x: 200,
      y: 300,
      text: { x: 300, y: 300, value: '节点2' },
      properties: {},
    },
  ],
  edges: [
    // 边数据属性
    {
      id: 'edge_id',
      type: 'bezier',
      sourceNodeId: 'node_id_1',
      targetNodeId: 'node_id_2',
      text: { x: 139, y: 200, value: '连线' }, // 连线文本
      properties: {},
    },
  ],
}
const container = ref()
const fl = ref()
onMounted(() => {
  document.querySelectorAll('img').forEach((img) => {
    img.ondragstart = function (event) {
      event.preventDefault()
    }
  })
  const options: LogicFlow.Options = {
    container: container.value,
    height: 700,
    edgeType: 'bezier',
    adjustEdge: true,
    stopScrollGraph: true,
    stopZoomGraph: true,
    stopMoveGraph: true,
    nodeTextEdit: false,
    edgeTextEdit: false,
  }
  fl.value = new LogicFlow(options)
  fl.value.render(graphData)
})
const mousedown = () => {
  fl.value.dnd.startDrag({
    type: 'circle',
  })
}
</script>

<template>
  <div class="container" ref="container"></div>
  <div class="el">
    <div v-for="(item, index) in images" :key="index">
      <img :src="item.image" alt="" @mousedown="mousedown" />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 900px;
  height: 700px;
  border: 1px solid red;
  overflow: hidden;
}

.el {
  display: flex;
  align-items: center;
}

img {
  width: 50px;
  height: 50px;
}
</style>
