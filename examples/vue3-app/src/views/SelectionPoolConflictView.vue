<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LogicFlow from '@logicflow/core'
import { Control, PoolElements, SelectionSelect } from '@logicflow/extension'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const containerRef = ref<HTMLDivElement | null>(null)
const lfRef = ref<LogicFlow | null>(null)

declare global {
  interface Window {
    lf?: LogicFlow
  }
}

const graphData: LogicFlow.GraphConfigData = {
  nodes: [
    {
      id: 'pool_2418',
      type: 'pool',
      x: 520,
      y: 300,
      text: 'pool_2418',
      properties: {
        direction: 'horizontal',
        width: 560,
        height: 360,
        children: ['lane_top_2418', 'lane_bottom_2418']
      },
      children: ['lane_top_2418', 'lane_bottom_2418']
    },
    {
      id: 'lane_top_2418',
      type: 'lane',
      x: 550,
      y: 210,
      width: 500,
      height: 180,
      text: 'lane_top_2418',
      properties: {
        parent: 'pool_2418',
        direction: 'horizontal',
        isHorizontal: true,
        children: ['rect_2418']
      },
      children: ['rect_2418']
    },
    {
      id: 'lane_bottom_2418',
      type: 'lane',
      x: 550,
      y: 390,
      width: 500,
      height: 180,
      text: 'lane_bottom_2418',
      properties: {
        parent: 'pool_2418',
        direction: 'horizontal',
        isHorizontal: true,
        children: ['circle_2418']
      },
      children: ['circle_2418']
    },
    {
      id: 'rect_2418',
      type: 'rect',
      x: 470,
      y: 210,
      text: 'rect_2418',
      properties: {
        parent: 'lane_top_2418',
        width: 100,
        height: 60
      }
    },
    {
      id: 'circle_2418',
      type: 'circle',
      x: 620,
      y: 390,
      text: 'circle_2418',
      properties: {
        parent: 'lane_bottom_2418'
      }
    }
  ],
  edges: []
}

function openSelection() {
  const lf = lfRef.value as (LogicFlow & { openSelectionSelect?: () => void }) | null
  lf?.openSelectionSelect?.()
}

function closeSelection() {
  const lf = lfRef.value as (LogicFlow & { closeSelectionSelect?: () => void }) | null
  lf?.closeSelectionSelect?.()
}

function logDynamicGroupApi() {
  const dynamicGroup = lfRef.value?.graphModel.dynamicGroup as Record<string, unknown> | undefined
  console.log('graphModel.dynamicGroup', dynamicGroup)
  console.table({
    hasDynamicGroup: Boolean(dynamicGroup),
    getGroupByNodeId: typeof dynamicGroup?.getGroupByNodeId,
    getLaneByNodeId: typeof dynamicGroup?.getLaneByNodeId
  })
}

function resetGraph() {
  lfRef.value?.render(graphData)
}

onMounted(() => {
  if (!containerRef.value) return

  const lf = new LogicFlow({
    container: containerRef.value,
    grid: true,
    width: 1100,
    height: 640,
    allowResize: true,
    keyboard: {
      enabled: true
    },
    plugins: [PoolElements, SelectionSelect, Control]
  })

  lf.render(graphData)
  lfRef.value = lf
  window.lf = lf
  logDynamicGroupApi()
})

onBeforeUnmount(() => {
  lfRef.value?.destroy()
  lfRef.value = null
  delete window.lf
})
</script>

<template>
  <section class="issue-page">
    <div class="toolbar">
      <div>
        <h2>#2418 SelectionSelect + PoolElements 复现</h2>
        <p>
          点击“开启框选”后，从泳池左上角外侧拖到右下角外侧，观察控制台是否出现
          <code>getGroupByNodeId is not a function</code>。
        </p>
      </div>
      <div class="actions">
        <el-button type="primary" @click="openSelection">开启框选</el-button>
        <el-button @click="closeSelection">关闭框选</el-button>
        <el-button @click="logDynamicGroupApi">打印 dynamicGroup API</el-button>
        <el-button @click="resetGraph">重置图</el-button>
      </div>
    </div>
    <div ref="containerRef" class="lf-container" />
  </section>
</template>

<style scoped>
.issue-page {
  height: 100%;
  padding: 16px;
  background: #f6f7fb;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
}

h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

p {
  max-width: 680px;
  margin: 0;
  color: #4b5563;
}

code {
  padding: 1px 4px;
  color: #b42318;
  background: #fff1f0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.lf-container {
  width: 100%;
  height: calc(100vh - 150px);
  min-height: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
}
</style>
