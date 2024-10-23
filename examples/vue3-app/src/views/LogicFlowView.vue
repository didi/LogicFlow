<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { forEach, map, has } from 'lodash-es'
import LogicFlow, { ElementState, LogicFlowUtil } from '@logicflow/core'
import { register, getTeleport } from '@logicflow/vue-node-registry'
import '@logicflow/core/es/index.css'

import ProgressNode from '@/components/LFElements/ProgressNode.vue'
import { combine, square, star, uml, user } from '../components/LFElements/nodes'
import { animation, connection } from '../components/LFElements/edges'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666'
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf'
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366'
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00'
    },
    text: {
      color: '#b85450',
      fontSize: 12
    }
  }
}

const customTheme: Partial<LogicFlow.Theme> = {
  baseNode: {
    stroke: '#4E93F5'
  },
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13
  },
  edgeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    textWidth: 100
  }, // 确认 textWidth 是否必传
  polyline: {
    stroke: 'red'
  },
  rect: {
    width: 200,
    height: 40
  },
  arrow: {
    offset: 4, // 箭头长度
    verticalLength: 2 // 箭头垂直于边的距离
  }
}
const data = {
  nodes: [
    {
      id: 'custom-node-1',
      rotate: 1.1722738811284763,
      text: {
        x: 600,
        y: 200,
        value: 'xxxxx'
      },
      type: 'rect',
      x: 600,
      y: 200
    }
  ]
}

const lfRef = ref<LogicFlow | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const flowId = ref('')
const TeleportContainer = getTeleport()

const registerElements = (lf: LogicFlow) => {
  const elements = [
    // edges
    animation,
    connection,
    // nodes
    combine,
    square,
    star,
    uml,
    user
  ]

  map(elements, (customElement) => {
    lf.register(customElement)
  })
}
const registerEvents = (lf: LogicFlow) => {
  lf.on('history:change', () => {
    const data = lf.getGraphData()
    console.log('history:change', data)
  })
}

onMounted(() => {
  if (containerRef.value) {
    const lf = new LogicFlow({
      ...config,
      container: containerRef.value,
      // hideAnchors: true,
      // width: 1200,
      height: 400,
      // adjustNodePosition: false,
      // isSilentMode: true,
      // overlapMode: 1,
      // hoverOutline: false,
      // nodeSelectedOutline: false,
      multipleSelectKey: 'shift',
      disabledTools: ['multipleSelect'],
      autoExpand: true,
      // metaKeyMultipleSelected: false,
      // adjustEdgeMiddle: true,
      // stopMoveGraph: true,
      adjustEdgeStartAndEnd: true,
      // adjustEdge: false,
      allowRotate: true,
      edgeTextEdit: true,
      keyboard: {
        enabled: true
        // shortcuts: [
        //   {
        //     keys: ["backspace"],
        //     callback: () => {
        //       const r = window.confirm("确定要删除吗？");
        //       if (r) {
        //         const elements = lf.getSelectElements(true);
        //         lf.clearSelectElements();
        //         elements.edges.forEach((edge) => lf.deleteEdge(edge.id));
        //         elements.nodes.forEach((node) => lf.deleteNode(node.id));
        //         const graphData = lf.getGraphData()
        //         console.log(42, graphData, graphData.nodes.length)
        //       }
        //       // console.log(1)
        //     }
        //   }
        // ]
      },
      partial: true,
      background: {
        color: '#FFFFFF'
      },
      grid: true,
      edgeTextDraggable: true,
      edgeType: 'bezier',
      style: {
        inputText: {
          background: 'black',
          color: 'white'
        }
      },
      // 全局自定义id
      // edgeGenerator: (sourceNode, targetNode, currentEdge) => {
      //   // 起始节点类型 rect 时使用 自定义的边 custom-edge
      //   if (sourceNode.type === 'rect') return 'bezier'
      //   if (currentEdge) return currentEdge.type
      //   return 'polyline'
      // },
      idGenerator(type) {
        return type + '_' + Math.random()
      }
    })

    lf.setTheme(customTheme)
    // 注册节点 or 边
    registerElements(lf)
    // 注册自定义 vue 节点
    register(
      {
        type: 'custom-vue-node',
        component: ProgressNode
      },
      lf
    )

    lf.on('graph:rendered', ({ graphModel }) => {
      flowId.value = graphModel.flowId!
    })

    // 注册事件
    registerEvents(lf)
    lf.render(data)

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

    lfRef.value = lf
  }
})

// 设置箭头
const setArrow = (arrowName: string) => {
  const lf = lfRef?.value
  if (lf) {
    const { edges } = lf.getSelectElements()
    edges.forEach(({ id, properties }) => {
      console.log(4444, properties)
      lf.setProperties(id, {
        arrowType: arrowName
      })
    })
  }
}
// 定位到指定节点
const focusOn = () => {
  lfRef?.value?.focusOn({
    id: 'custom-node-1'
  })
}
// 切换节点类型
const changeNodeType = () => {
  const lf = lfRef?.value
  if (lf) {
    const { nodes } = lf.getSelectElements()
    nodes.forEach(({ id, type }) => {
      lf.setNodeType(id, type === 'rect' ? 'star' : 'rect')
    })
  }
}
// 修改配置
const changeEditConfig = () => {
  const isSilentMode = lfRef?.value?.options.isSilentMode
  lfRef?.value?.updateEditConfig({
    isSilentMode: !isSilentMode
  })
}
// 取消编辑
const cancelEdit = () => {
  lfRef?.value?.graphModel.textEditElement?.setElementState(ElementState.DEFAULT)
}
// 修改边 ID
const changeId = () => {
  const lf = lfRef?.value
  if (lf) {
    const { edges } = lf.getSelectElements()
    edges.forEach(({ id }) => {
      lf.setEdgeId(id, 'newId')
    })
  }
}
// 刷新图
const refreshGraph = () => {
  const lf = lfRef?.value
  if (lf) {
    const data = lf.getGraphRawData()
    console.log('current graph data', data)
    const refreshData = LogicFlowUtil.refreshGraphId(data)
    console.log('after refresh graphId', data)
    lf.render(refreshData)
  }
}
// 激活元素
const activeElements = () => {
  const lf = lfRef?.value
  if (lf) {
    const { nodes, edges } = lf.getSelectElements()
    nodes.forEach(({ id }) => {
      lf.setProperties(id, {
        isHovered: true
      })
    })
    edges.forEach(({ id }) => {
      lf.setProperties(id, {
        isHovered: true
      })
    })
  }
}
// 开启边动画
const turnAnimationOn = () => {
  if (lfRef?.value) {
    const { edges } = lfRef?.value.getGraphData() as LogicFlow.GraphConfigData
    forEach(edges, (edge) => {
      if (edge.id) {
        lfRef?.value?.openEdgeAnimation(edge.id)
      }
    })
  }
}
// 关闭边动画
const turnAnimationOff = () => {
  if (lfRef?.value) {
    const { edges } = lfRef?.value.getGraphData() as LogicFlow.GraphConfigData
    forEach(edges, (edge) => {
      if (edge.id) {
        lfRef?.value?.closeEdgeAnimation(edge.id)
      }
    })
  }
}

const handleDragRect = () => {
  lfRef?.value?.dnd.startDrag({
    type: 'rect',
    text: 'xxxxx'
  })
}
const handleDragCircle = () => {
  lfRef?.value?.dnd.startDrag({
    type: 'circle',
    r: 25
  })
}
const handleDragText = () => {
  lfRef?.value?.dnd.startDrag({
    type: 'text',
    text: '文本'
  })
}
</script>

<template>
  <el-card header="Graph">
    <div class="flex-wrapper">
      <el-button key="arrow1" type="primary" @click="() => setArrow('half')"> 箭头 1 </el-button>
      <el-button key="arrow2" type="primary" @click="() => setArrow('empty')"> 箭头 2 </el-button>
      <el-button key="focusOn" type="primary" @click="focusOn"> 定位到五角星 </el-button>
      <el-button key="undo" type="primary" @click="() => lfRef?.value?.undo()"> 上一步 </el-button>
      <el-button key="redo" type="primary" @click="() => lfRef?.value?.redo()"> 下一步 </el-button>
      <el-button key="clearData" type="primary" @click="() => lfRef?.value?.clearData()">
        清空数据
      </el-button>
      <el-button key="changeType" type="primary" @click="changeNodeType">
        切换节点为五角星
      </el-button>
      <el-button key="changeConfig" type="primary" @click="changeEditConfig"> 修改配置 </el-button>
      <el-button key="cancelEdit" type="primary" @click="cancelEdit"> 取消编辑 </el-button>
      <el-button key="changeEdgeId" type="primary" @click="changeId"> 修改边 ID </el-button>
    </div>
    <el-divider />
    <div class="flex-wrapper">
      <el-button
        key="getData"
        type="primary"
        @click="() => console.log(lfRef?.value?.getGraphData())"
      >
        获取数据
      </el-button>
      <el-button key="getRefreshData" type="primary" @click="refreshGraph">
        属性流程图节点 ID
      </el-button>
      <el-button key="setProperties" type="primary" @click="activeElements"> 设置属性 </el-button>
      <el-button key="setZoom" type="primary" @click="() => lfRef?.value?.zoom(0.6, [400, 400])">
        设置大小
      </el-button>
      <el-button
        key="selectElement"
        type="primary"
        @click="() => lfRef?.value?.selectElementById('custom-node-1')"
      >
        选中指定节点
      </el-button>
      <el-button key="triggerLine" type="primary"> 触发边 </el-button>
      <el-button
        key="translateCenter"
        type="primary"
        @click="() => lfRef?.value?.translateCenter()"
      >
        居中
      </el-button>
      <el-button key="fitView" type="primary" @click="() => lfRef?.value?.fitView()">
        适应屏幕
      </el-button>
      <el-button key="getNodeEdges" type="primary" @click="() => {}"> 获取节点所有的边 </el-button>
      <el-button key="openEdgeAnimation" type="primary" @click="turnAnimationOn">
        开启边动画
      </el-button>
      <el-button key="closeEdgeAnimation" type="primary" @click="turnAnimationOff">
        关闭边动画
      </el-button>
      <el-button key="showCanvas" type="primary"> 显示流程图 </el-button>
      <el-button
        key="deleteNode"
        type="primary"
        @click="() => lfRef?.value?.deleteNode('custom-node-1')"
      >
        删除节点
      </el-button>
    </div>
    <el-divider content-position="left">节点面板</el-divider>
    <div class="flex-wrapper">
      <div class="circle" @mousedown="handleDragCircle" />
      <div class="rect" @mousedown="handleDragRect" />
      <div class="text" @mousedown="handleDragText">文本</div>
    </div>
    <el-divider />
    <div ref="containerRef" id="graph" class="viewport"></div>
    <TeleportContainer :flow-id="flowId" />
  </el-card>
</template>

<style>
.flex-wrapper {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.viewport {
  position: relative;
  overflow: hidden;
}

.el-button + .el-button {
  margin-left: 0;
}

*:focus {
  outline: none;
}

.rect {
  width: 50px;
  height: 50px;
  background: #fff;
  border: 2px solid #000;
}

.circle {
  width: 50px;
  height: 50px;
  background: #fff;
  border: 2px solid #000;
  border-radius: 50%;
}

.uml-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: rgb(255 242 204);
  border: 1px solid rgb(214 182 86);
  border-radius: 10px;
}

.uml-head {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  text-align: center;
}

.uml-body {
  padding: 5px 10px;
  font-size: 12px;
  border-top: 1px solid rgb(214 182 86);
  border-bottom: 1px solid rgb(214 182 86);
}

.uml-footer {
  padding: 5px 10px;
  font-size: 14px;
}

/* 输入框字体大小和设置的大小保持一致，自动换行输入和展示保持一致 */

.lf-text-input {
  font-size: 12px;
}

.buttons {
  position: absolute;
  z-index: 1;
}

.button-list {
  display: flex;
  align-items: center;
}
</style>
