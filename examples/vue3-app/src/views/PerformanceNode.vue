<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <el-space wrap :size="20">
          <span>操作栏</span>
          <el-input v-model="domNumber"></el-input>
          <el-button type="primary" @click="addElementNode(domNumber)">添加Element节点</el-button>
          <el-button type="primary" @click="addEChartNode(domNumber)">添加Echart节点</el-button>
          <el-button type="primary" @click="addDomNumber(domNumber, true)"
            >添加个节点和边:</el-button
          >
          <el-button type="primary" @click="addDomNumber(domNumber, false)">只添加节点:</el-button>
          <el-button type="warning" @click="clearAll">清空</el-button>
          <span>element元素数量：{{ elementNumber }}</span>
          <span>EChart元素数量：{{ eChartNumber }}</span>
          <span>节点数量：{{ nodeNumber }}</span>
          <span>边数量：{{ edgeNumber }}</span>
          <span>Total DOM elements: {{ totalDOMNumber }}</span>
          <el-button type="primary" @click="fitView">fitView:</el-button>
        </el-space>
      </div>
    </template>
    <div id="graph" ref="containerRef"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive, shallowRef } from 'vue'
import { ElNotification } from 'element-plus'
import LogicFlow from '@logicflow/core'
import { register } from '@logicflow/vue-node-registry'

import ElementNode from '@/components/UILibrary/ElementNode.vue'
import EchartNode from '@/components/UILibrary/EchartNode.vue'
import DomNumber from '@/components/dom/DomNumber.vue'

// import { startObservingLongTasks } from '@/utils/performance'
import { getTotalDOMNumber } from '@/utils/performance'
import { getRandom } from '@/utils/math'

const containerRef = ref<HTMLDivElement | null>(null)
const lfRef = shallowRef<LogicFlow | null>(null)
const elementNumber = ref<number>(0)
const eChartNumber = ref<number>(0)
const totalDOMNumber = ref<number>(0)
const eventType = ref<undefined | string>()
const nodeNumber = ref<number>(0)
const domNumber = ref<number>(500)
const edgeNumber = ref<number>(0)
const id = ref<number>(0)

type increaseInfoModel = {
  nodeNumber: number
  domNumber: number
  renderTime?: number
}
const increaseInfo = reactive<increaseInfoModel[]>([])

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
    elementNumber.value++
    nextTick(() => {
      totalDOMNumber.value = getTotalDOMNumber()
    })
  }
}

// 添加 EChart 元素
const addEChartNode = (number: number) => {
  for (let i = 0; i < +number; i++) {
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
    eChartNumber.value++
    nextTick(() => {
      totalDOMNumber.value = getTotalDOMNumber()
    })
  }
}

// 添加 dom 数量元素
const addDomNumber = (number: number, hasEdge: boolean) => {
  if (lfRef.value) {
    performance.mark('start')

    for (let i = 0; i < number; i++) {
      lfRef.value.addNode({
        id: '' + id.value,
        type: 'dom-number',
        x: getRandom(0, 2000),
        y: getRandom(0, 1000, 480, 520),
        properties: {
          width: 150,
          height: 30
        }
      })
      id.value >= 1 &&
        lfRef.value &&
        hasEdge &&
        lfRef.value.addEdge({
          sourceNodeId: '' + (id.value - 1),
          targetNodeId: '' + id.value,
          type: 'bezier'
        })
      id.value++
    }
    nodeNumber.value += +number
    hasEdge && (edgeNumber.value += +number)
    nextTick(() => {
      totalDOMNumber.value = getTotalDOMNumber()
      increaseInfo.push({
        nodeNumber: nodeNumber.value,
        domNumber: totalDOMNumber.value
      })
    })

    requestAnimationFrame(() => {
      performance.mark('mid')

      requestAnimationFrame(() => {
        performance.mark('end')
        performance.measure('renderTime', 'start', 'end')
        const measure = performance.getEntriesByName('renderTime')[0]
        ElNotification({
          message: `Time to render: ${measure.duration} ms`
        })
        increaseInfo[increaseInfo.length - 1].renderTime = measure.duration
        console.log('increaseInfo', increaseInfo)
        performance.clearMarks()
        performance.clearMeasures()
      })
    })
  }
}

const clearAll = () => {
  lfRef.value?.clearData()
}
// 模拟自动添加节点
// const autoAddNode = (time: number, count: number, nodeNumber: number) => {
//   let total = 0
//   const timer = setInterval(() => {
//     if (total >= count) {
//       clearInterval(timer)
//     } else {
//       addDomNumber(nodeNumber, false)
//       total++
//     }
//   }, time)
// }

// fitViw
const fitView = () => {
  if (lfRef.value) {
    lfRef.value.fitView()
    lfRef.value.translateCenter()
  }
}

// 模拟长任务
// const startObservingLongTasks = (callback: (entry: { eventType: any; duration: any }) => void) => {
//   const observer = new PerformanceObserver((list) => {
//     for (const entry of list.getEntries()) {
//       callback(entry)
//     }
//   })
//   observer.observe({ entryTypes: ['longtask'] }, time)
// }

onMounted(() => {
  if (containerRef.value) {
    lfRef.value = new LogicFlow({
      container: containerRef.value,
      grid: true,
      allowResize: true
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

    lfRef.value.setTheme({
      bezier: {
        stroke: '#ccc',
        strokeWidth: 1
      }
    })

    lfRef.value.render({})

    getTotalDOMNumber()

    // 开启长任务
    // startObservingLongTasks((entry: { eventType: any; duration: any }) => {
    //   ElNotification({
    //     title: `交互行为：${eventType.value}`,
    //     message: `耗时：${entry.duration}ms`
    //   })
    // })

    // 监听画布滚动
    window.addEventListener('wheel', () => {
      eventType.value = 'wheel'
    })

    // 监听鼠标点击
    window.addEventListener('click', () => {
      eventType.value = 'click'
    })
  }

  // 实时获取 DOM 元素数量
  setInterval(() => {
    totalDOMNumber.value = getTotalDOMNumber()
  }, 1000)

  // 自动增加节点
  // autoAddNode(500, 500, 50)
})
</script>

<style scoped>
#graph {
  width: 100%;
  height: 900px;
}
</style>
