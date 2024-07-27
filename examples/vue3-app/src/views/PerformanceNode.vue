<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <el-space wrap :size="20">
          <span>操作栏</span>
          <el-button type="primary" @click="addElementNode(1)">添加1个element</el-button>
          <el-button type="primary" @click="addElementNode(10)">添加10个element</el-button>
          <el-button type="primary" @click="addEchartNode(1)">添加1个Echart</el-button>
          <el-button type="primary" @click="addEchartNode(10)">添加10个Echart</el-button>
          <el-button type="primary" @click="addDomNumber(domNumber)">添加个dom数量:</el-button>
          <el-input v-model="domNumber"></el-input>
          <span>elment元素数量：{{ ElementNumber }}</span>
          <span>Echart元素数量：{{ EchartNumber }}</span>
          <span>Total DOM elements: {{ TotalDOMNumber }}</span>
        </el-space>
      </div>
    </template>
    <div id="graph" ref="containerRef"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import LogicFlow from '@logicflow/core'
import { register } from '@logicflow/vue-node-registry'
import ElementNode from '@/components/UILibrary/ElementNode.vue'
import EchartNode from '@/components/UILibrary/EchartNode.vue'
import DomNumber from '@/components/dom/DomNumber.vue'
import { getTotalDOMNumber, startObservingLongTasks } from '@/utils/performance'
import { getRandom } from '@/utils/math'
import { ElNotification } from 'element-plus'

const containerRef = ref<HTMLDivElement | null>(null)
const lfRef = ref<LogicFlow | null>(null)
const ElementNumber = ref(0)
const EchartNumber = ref(0)
const TotalDOMNumber = ref(0)
const eventType = ref<undefined | string>()
const domNumber = ref(0)

// 添加 element 元素
const addElementNode = (number: number) => {
  for (let i = 0; i < number; i++) {
    lfRef.value &&
      lfRef.value.addNode({
        type: 'element-node',
        x: getRandom(0, 2000),
        y: getRandom(0, 1000),
        properties: {
          width: 2000,
          height: 2500
        }
      })
    ElementNumber.value++
    nextTick(() => {
      TotalDOMNumber.value = getTotalDOMNumber()
    })
  }
}

// 添加 Echart 元素
const addEchartNode = (number: number) => {
  for (let i = 0; i < number; i++) {
    lfRef.value &&
      lfRef.value.addNode({
        type: 'echart-node',
        x: getRandom(0, 2000),
        y: getRandom(0, 1000),
        properties: {
          width: 1000,
          height: 2000
        }
      })
    EchartNumber.value++
    nextTick(() => {
      TotalDOMNumber.value = getTotalDOMNumber()
    })
  }
}

// 添加 dom 数量元素
const addDomNumber = (number: number) => {
  for (let i = 0; i < number; i++) {
    lfRef.value &&
      lfRef.value.addNode({
        type: 'dom-number',
        x: getRandom(0, 2000),
        y: getRandom(0, 1000),
        properties: {
          width: 100
        }
      })
    nextTick(() => {
      TotalDOMNumber.value = getTotalDOMNumber()
    })
  }
}

onMounted(() => {
  if (containerRef.value) {
    lfRef.value = new LogicFlow({
      container: containerRef.value,
      grid: true
    })

    // 注册 element 组件库节点
    register(
      {
        type: 'element-node',
        component: ElementNode
      },
      lfRef.value as LogicFlow
    )

    // 注册 echart 组件库节点
    register(
      {
        type: 'echart-node',
        component: EchartNode
      },
      lfRef.value as LogicFlow
    )

    // 注册 dom 节点
    register(
      {
        type: 'dom-number',
        component: DomNumber
      },
      lfRef.value as LogicFlow
    )

    lfRef.value.render({})

    getTotalDOMNumber()

    // 开启长任务
    startObservingLongTasks((entry: { eventType: any; duration: any }) => {
      ElNotification({
        title: `交互行为：${eventType.value}`,
        message: `耗时：${entry.duration}ms`
      })
    })

    // 监听画布滚动
    window.addEventListener('wheel', () => {
      eventType.value = 'wheel'
    })

    // 监听鼠标点击
    window.addEventListener('click', () => {
      eventType.value = 'click'
    })
  }

  // 每隔1s获取一次DOM数量
  setInterval(() => {
    TotalDOMNumber.value = getTotalDOMNumber()
  }, 1000)
})
</script>

<style scoped>
#graph {
  width: 100%;
  height: 900px;
}
</style>
