<template>
  <div class="diagram">
    <diagram-toolbar
      class="diagram-toolbar"
      @changeNodeFillColor="$_changeNodeFill"
      @saveGraph="$_saveGraph"
    />
    <diagram-sidebar class="diagram-sidebar" @dragInNode="$_dragInNode" :style="{ width: sidebarWidth + 'px'}"/>
    <div class="diagram-container" ref="container" :style="{ left: sidebarWidth + 'px'}">
      <div class="diagram-wrapper" :style="{ width: this.diagramWidth + 'px' }">
        <div class="lf-diagram" ref="diagram" :style="{ width: this.diagramWidth + 'px', height: this.diagramHeight + 'px' }"></div>
      </div>
    </div>
    <diagram-node-panel
      class="diagram-panel"
      v-if="activeNodes.length > 0"
      @setStyle="$_setStyle"
      @setZIndex="$_setZIndex"
    />
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
// import { NodeResize } from '@logicflow/extension'
import '@logicflow/core/dist/style/index.css'
import '@logicflow/extension/lib/style/index.css'
import DiagramToolbar from './DiagramToolbar.vue'
import DiagramSidebar from './DiagramSidebar.vue'
import DiagramNodePanel from './DiagramNodePanel.vue'
// import BaseNode from './node/BaseNode'
import CircleNode from './node/CircleNode'
import RectNode from './node/RectNode'
import TextNode from './node/TextNode'
// const LogicFlow = window.LogicFlow
// LogicFlow.use(NodeResize)

export default {
  name: 'Diagram',
  data () {
    return {
      sidebarWidth: 200,
      diagramWidth: 0,
      diagramHeight: 0,
      filename: '',
      activeNodes: [],
      activeEdges: []
    }
  },
  mounted () {
    this.diagramWidth = this.$refs.container.clientWidth
    this.diagramHeight = this.$refs.container.clientHeight
    let data = ''
    if (window.location.search) {
      const query = window.location.search.substring(1).split('&').reduce((map, kv) => {
        const [key, value] = kv.split('=')
        map[key] = value
        return map
      }, {})
      this.filename = query.filename
      const d = window.sessionStorage.getItem(this.filename)
      if (d) {
        data = JSON.parse(d)
      }
    }
    this.initLogicFlow(data)
  },
  methods: {
    initLogicFlow (data) {
      const lf = new LogicFlow({
        container: this.$refs.diagram,
        width: this.diagramWidth,
        height: this.diagramHeight,
        hideOutline: true,
        overlapMode: 1,
        metaKeyMultipleSelected: true,
        keyboard: {
          enabled: true
        },
        grid: {
          visible: false,
          size: 5
        },
        history: false,
        background: {
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QwZDBkMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDBkMGQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=',
          repeat: 'repeat'
        }
      })
      // lf.register(BaseNode)
      lf.register(CircleNode)
      lf.register(RectNode)
      lf.register(TextNode)
      lf.render(data)
      this.lf = lf
      this.lf.on('selection:selected,node:click,blank:click,edge:click', () => {
        const { nodes, edges } = this.lf.getSelectElements()
        this.activeNodes = nodes
        this.activeEdges = edges
        console.log(333, nodes, edges)
      })
    },
    $_dragInNode (type) {
      this.lf.dnd.startDrag({
        type
      })
    },
    $_changeNodeFill (color) {
      const { nodes } = this.lf.graphModel.getSelectElements()
      nodes.forEach(({ id }) => {
        this.lf.setProperties(id, {
          fill: color
        })
      })
    },
    $_setStyle (item) {
      this.activeNodes.forEach(({ id }) => {
        this.lf.setProperties(id, item)
      })
    },
    $_setZIndex (type) {
      this.activeNodes.forEach(({ id }) => {
        this.lf.setElementZIndex(id, type)
      })
    },
    $_saveGraph () {
      const data = this.lf.getGraphData()
      this.download(this.filename, JSON.stringify(data))
    },
    download (filename, text) {
      window.sessionStorage.setItem(filename, text)
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
      element.setAttribute('download', filename)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  },
  components: {
    DiagramToolbar,
    DiagramSidebar,
    DiagramNodePanel
  }
}
</script>

<style scoped>

.diagram {
  width: 100%;
  height: 100%;
}
.diagram * {
  box-sizing: border-box;
}
.diagram-toolbar {
  height: 40px;
  border-bottom: 1px solid #dadce0;
}
.diagram-sidebar {
  height: calc(100% - 40px);
  border-right: 1px solid #dadce0;
}
.diagram-panel {
  width: 300px;
  background: #fff;
  height: calc(100% - 40px);
  position: absolute;
  right: 0px;
  top: 40px;
  border-left: 1px solid #dadce0;
}
.diagram-container {
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0;
  overflow: scroll;
}
/* 由于背景图和gird不对齐，需要css处理一下 */
.diagram /deep/ .lf-background {
  left: -9px;
}
/* .diagram-wrapper {
  padding: 100px 200px;
  box-sizing: border-box;
} */
.lf-diagram {
  box-shadow: 0px 0px 4px #838284;
}
::-webkit-scrollbar {
  width: 9px;
  height: 9px;
  background: white;
  border-left: 1px solid #e8e8e8;
}
::-webkit-scrollbar-thumb {
  border-width: 1px;
  border-style: solid;
  border-color: #fff;
  border-radius: 6px;
  background: #c9c9c9;
}
::-webkit-scrollbar-thumb:hover {
  background: #b5b5b5;
}
</style>
